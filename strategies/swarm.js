/*jshint esversion: 6 */

"use strict";

const Docker = require('dockerode');
const async = require('async');
const Grid = require('gridfs-stream');

const gridfsColl = 'fs.files';

const utils = require('../utils/utils.js');
const errorFile = require('../utils/errors.js');

function checkError(error, code, cb, scb) {
	if(error) {
		return cb({
			source: 'driver',
			value: error,
			code: code,
			msg: errorFile[code]
		});
	}
	else {
		return scb();
	}
}

let lib = {
	getDeployer (options, cb) {
		let config = options.deployerConfig, deployer;

		//local & remote deployments can use unix socket if function does not require connection to worker nodes
		//dashboard containers are guaranteed to be deployed on manager nodes
		if (!config.flags || (config.flags && !config.flags.targetNode)) {
			deployer = new Docker({socketPath: config.socketPath});
			lib.ping({ deployer }, (error) => {
				checkError(error, 600, cb, () => { //TODO: fix params
					return cb(null, deployer);
				});
			});
		}

		//remote deployments should use certificates if function requires connecting to a worker node
		if (config.flags && config.flags.targetNode) {
			getTargetNode(options, (error, target) => {
				checkError(error, 600, cb, () => {
					findCerts(options, (error, certs) => {
						checkError(error, 600, cb, () => {
							deployer = new Docker(buildDockerConfig(target.host, target.port, certs));
							lib.ping({ deployer }, (error) => {
								checkError(error, 600, cb, () => { //TODO: fix
									return cb(null, deployer);
								});
							});
						});
					});
				});
			});
		}

		function findCerts(options, cb) {
			if (!options.env) {
				return cb(600);
			}

			let opts = {
				collection: gridfsColl,
				conditions: {
					['metadata.env.' + config.env.toUpperCase()]: config.driver
				}
			};

			options.model.findEntries(options.soajs, opts, (error, certs) => {
				checkError(error, 600, cb, () => {
					if (!certs || certs.length === 0) {
						return cb(600);
					}

					options.model.getDb(options.soajs).getMongoDB((error, db) => {
						checkError(error, 600, cb, () => {
							let gfs = Grid(db, options.model.getDb(options.soajs).mongodb);
							return pullCerts(certs, gfs, db, cb);
						});
					});
				});
			});
		}

		function pullCerts(certs, gfs, db, cb) {
			var certBuffers = {};
			async.each(certs, (oneCert, callback) => {
				var gs = new gfs.mongo.GridStore(db, oneCert._id, 'r', { //TODO: update to support model injection
					root: 'fs',
					w: 1,
					fsync: true
				});

				gs.open((error, gstore) => {
					checkError(error, 600, callback, () => {
						gstore.read((error, filedata) => {
							checkError(error, 600, callback, () => {
								gstore.close();

								var certName = oneCert.filename.split('.')[0];
								certBuffers[oneCert.metadata.certType] = filedata;
								return callback(null, true);
							});
						});
					});
				});
			}, (error, result) => {
				checkError(error, 600, cb, () => {
					return cb(null, certBuffers);
				});
			});
		}

		function getTargetNode(options, cb) {
			if (config.flags.swarmMember) {
				let customOptions = utils.cloneObj(options);
				delete customOptions.deployerConfig.flags.targetNode;
				//node is already part of the swarm, inspect it to obtain its address
				engine.inspectNode(customOptions, (error, node) => {
					checkError(error, 600, cb, () => { //TODO: wrong params, update!!
						if (node.role === 'manager') {
							return cb(null, {host: node.managerStatus.address.split(':')[0], port: '2376'}); //TODO: get port from env record, deployer object
						}
						else {
							return cb(null, {host: node.ip, port: '2376'}); //TODO: get port from env record, deployer object
						}
					});
				});
			}
			else {
				//swarmMember = false flag means the target node is a new node that should be added to the cluster, invoked by addNode()
				//we only need to return the host/port provided by the user, the ping function will later test if a connection can be established
				return cb(null, {host: options.params.host, port: options.params.port});
			}
		}

		function buildDockerConfig(host, port, certs) {
			let dockerConfig = { host, port };

			let certKeys = Object.keys(certs);
			certKeys.forEach((oneCertKey) => {
				dockerConfig[oneCertKey] = certs[oneCertKey];
			});

			return dockerConfig;
		}
	},

	ping (options, cb) {
		options.deployer.ping(cb);
	}
};

let engine = {

	/**
	 * Inspect cluster, returns general cluster info + list of manager nodes
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectCluster (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.swarmInspect((error, swarm) => {
					checkError(error, 541, cb, () => {
						deployer.info((error, info) => {
							checkError(error, 542, cb, cb.bind(null, null, {swarm, info}));
						});
					});
				});
			});
		});
	},

	/**
	 * Adds a node to a cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	addNode (options, cb) {
		let payload = {};
		engine.inspectCluster(options, (error, cluster) => {
			checkError(error, 543, cb, () => {
				buildManagerNodeList(cluster.info.Swarm.ManagerNodes, (error, remoteAddrs) => {
					//error is null, no need to check it
					let swarmPort = cluster.info.Swarm.RemoteManagers[0].Addr.split(':')[1]; //swarm port is being copied from any of the manger nodes in the swarm
					payload.ListenAddr = '0.0.0.0:' + swarmPort;
					payload.AdverstiseAddr = options.params.host + ':' + swarmPort;
					payload.RemoteAddrs = remoteAddrs;
					payload.JoinToken = ((options.params.role === 'manager') ? cluster.swarm.JoinTokens.Manager : cluster.swarm.JoinTokens.Worker);

					options.deployerConfig.flags = { targetNode: true, swarmMember: false };
					lib.getDeployer(options, (error, deployer) => {
						checkError(error, 540, cb, () => {
							deployer.swarmJoin(payload, (error, res) => {
								checkError(error, 544, cb, () => {
									return cb(null, true);
								});
							});
						});
					});
				});
			});
		});

		//this function takes a list of manager nodes and returns an array in the format required by the swarm api
		function buildManagerNodeList (nodeList, cb) {
			async.map(nodeList, (oneNode, callback) => {
				return callback(null, oneNode.Addr);
			}, cb);
		}
	},

	/**
	 * Removes a node from a cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	removeNode (options, cb) {
		/*
		 - get deployer for target node
		 - leave swarm
		 - return success response
		 - get deployer of a manager node in the swarm
		 - remove node
		 */

		let deployerConfig = utils.cloneObj(options.deployerConfig);

		// options.deployerConfig.host = options.params.ip;
		// options.deployerConfig.port = options.params.dockerPort;
		options.deployerConfig.flags = { targetNode: true, swarmMember: true };
		lib.getDeployer(options, (error, targetDeployer) => {
			checkError(error, 540, cb, () => {
				targetDeployer.swarmLeave((error) => {
					checkError(error, 545, cb, () => {
						//return response and remove node entry from swarm in the background
						cb(null, true);

						options.deployerConfig = deployerConfig;
						lib.getDeployer(options, (error, deployer) => {
							checkError(error, 540, cb, () => {
								let node = deployer.getNode(options.params.id);
								setTimeout(node.remove.bind(null, options.backgroundCB), 20000);
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Updates a node's role or availability
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	updateNode (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let node = deployer.getNode(options.params.nodeId);
				//need to inspect node in order to get its current version and pass it to update call
				node.inspect((error, node) => {
					checkError(error, 547, cb, () => {
						options.params.version = node.Version.Index;
						node.update(options.params, (error) => {
							checkError(error, 546, cb, () => {
								return cb(null, true);
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Inspect a node that is already part of the cluster, strategy in this case is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectNode (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let node = deployer.getNode(options.params.id);
				node.inspect((error, node) => {
					checkError(error, 547, cb, () => {

						let record = {
							id: node.ID,
							hostname: node.Description.Hostname,
							ip: node.Status.Addr,
							version: node.Version.Index,
							role: node.Spec.Role,
							state: node.Status.State,
							spec: {
								role: node.Spec.Role,
								availability: node.Spec.Availability
							},
							resources: {
								cpus: node.Description.Resources.NanoCPUs / 1000000000,
								memory: node.Description.Resources.MemoryBytes
							}
						};

						if (record.role === 'manager') {
							record.managerStatus = {
								leader: node.ManagerStatus.Leader,
								reachability: node.ManagerStatus.Reachability,
								address: node.ManagerStatus.Addr
							};
						}

						return cb(null, record);
					});
				});
			});
		});
	},

	/**
	* Inspect a node that is provisioned with docker but not part of the cluster
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	inspectDockerEngine (options, cb) {
		options.deployerConfig.flags = { targetNode: true, swarmMember: false };
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, () => {
				deployer.info((error, info) => {
					checkError(error, 561, cb, () => {
						checkError((info && info.Swarm && info.Swarm.LocalNodeState === 'active'), 652, cb, () => {
							return cb(null, info);
						});
					});
				});
			});
		});
	},

	/**
	 * List nodes in a cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listNodes (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.listNodes((error, nodes) => {
					checkError(error, 548, cb, () => {
						//normalize response
						let record = {};
						async.map(nodes, (oneNode, callback) => {
							record = {
								id: oneNode.ID,
								hostname: oneNode.Description.Hostname,
								ip: oneNode.Status.Addr,
								version: oneNode.Version.Index,
								role: oneNode.Spec.Role,
								state: oneNode.Status.State,
								spec: {
									role: oneNode.Spec.Role,
									availability: oneNode.Spec.Availability
								},
								resources: {
									cpus: oneNode.Description.Resources.NanoCPUs / 1000000000,
									memory: oneNode.Description.Resources.MemoryBytes
								}
							};

							if (record.role === 'manager') {
								record.managerStatus = {
									leader: oneNode.ManagerStatus.Leader,
									reachability: oneNode.ManagerStatus.Reachability,
									address: oneNode.ManagerStatus.Addr
								};
							}

							return callback(null, record);
						}, cb);
					});
				});
			});
		});
	},

	/**
	 * List services/deployments currently available
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listServices (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.listServices({}, (error, services) => {
					checkError(error, 549, cb, () => {

						//normalize response
						let record = {};
						async.map(services, (oneService, callback) => {
							record = {
								id: oneService.ID,
								version: oneService.Version.Index,
								name: oneService.Spec.Name,
								service: {
									env: ((oneService.Spec.Labels) ? oneService.Spec.Labels['soajs.env.code'] : null),
									name: ((oneService.Spec.Labels) ? oneService.Spec.Labels['soajs.service.name'] : null),
									group: ((oneService.Spec.Labels) ? oneService.Spec.Labels['soajs.service.version'] : null),
									version: ((oneService.Spec.Labels) ? oneService.Spec.Labels['soajs.service.version'] : null)
								},
								ports: []
							};

							return callback(null, record);
						}, cb);
					});
				});
			});
		});
	},

	/**
	 * Creates a new deployment for a SOAJS service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deployService (options, cb) {
		let payload = utils.cloneObj(require(__dirname + '../schemas/swarm/service.template.js'));
		payload.Name = options.params.context.dockerParams.env + '-' + options.params.context.dockerParams.name;
		payload.TaskTemplate.ContainerSpec.Image = options.soajs.inputmaskData.imagePrefix + '/' + ((options.params.context.origin === 'service' || options.params.context.origin === 'controller') ? options.params.config.images.services : options.params.config.images.nginx);
		payload.TaskTemplate.ContainerSpec.Env = options.params.context.dockerParams.variables;
		payload.TaskTemplate.ContainerSpec.Dir = options.params.config.imagesDir;
		payload.TaskTemplate.ContainerSpec.Command = [options.params.context.dockerParams.Cmd[0]];
		payload.TaskTemplate.ContainerSpec.Args = options.params.context.dockerParams.Cmd.splice(1);
		payload.TaskTemplate.Resources.Limits.MemoryBytes = options.soajs.inputmaskData.memoryLimit;
		payload.TaskTemplate.RestartPolicy.Condition = 'any'; //TODO: make dynamic
		payload.TaskTemplate.RestartPolicy.MaxAttempts = 5; //TODO: make dynamic
		payload.Mode.Replicated.Replicas = options.soajs.inputmaskData.haCount;
		payload.Networks[0].Target = 'soajsnet';
		payload.Labels['org.soajs.env.code'] = options.params.context.dockerParams.env;
		payload.Labels['org.soajs.service.name'] = options.params.context.dockerParams.name;
		payload.Labels['org.soajs.service.version'] = options.params.context.dockerParams.version;


		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.createService(payload, (error, serviceId) => {
					checkError(error, 549, cb, () => {
						return cb(null, serviceId);
					});
				});
			});
		});
	},

	/**
	 * Redeploy a service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	 redeployService (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, cb, 540, () => {
				let service = deployer.getService(options.params.id);
				service.inspect((error, service) => {
					checkError(error, cb, 550, () => {
						let update = service.Spec;
						update.version = service.Version.Index;

						if (service.Spec.Labels['soajs.service.sync.count']) {
							update.Labels['soajs.service.sync.count'] += 1;
						}
						else {
							update.Labels['soajs.service.sync.count'] = 1;
						}

						service.update(update, (error) => {
							checkError(error, cb, 653, cb.bind(null, null, true));
						});
					});
				});
			});
		});
	 },

	/**
	 * Scales a deployed services up/down depending on current replica count and new one
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	scaleService (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				options.params.excludeTasks = true;
				engine.inspectService(options, (error, info) => {
					checkError(error, 550, cb, () => {
						let service = deployer.getService(info.service.ID); //NOTE: api does not allow using service name for update ops
						let update = info.service.Spec;

						update.version = info.service.Version.Index;
						update.Mode.Replicated.Replicas = options.params.scale;
						service.update(update, (error) => {
							checkError(error, 551, cb, () => {
								return cb(null, true);
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Gathers and returns information about specified service and a list of its tasks
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectService (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id || options.params.serviceName);
				service.inspect((error, serviceInfo) => {
					checkError(error, 550, cb, () => {

						let service = {
							id: serviceInfo.ID,
							version: serviceInfo.Version.Index,
							name: serviceInfo.Spec.Name,
							service: {
								env: ((serviceInfo.Spec.Labels) ? serviceInfo.Spec.Labels['soajs.env.code'] : null),
								name: ((serviceInfo.Spec.Labels) ? serviceInfo.Spec.Labels['soajs.service.name'] : null),
								version: ((serviceInfo.Spec.Labels) ? serviceInfo.Spec.Labels['soajs.service.version'] : null)
							},
							ports: []
						};

						if (options.params.excludeTasks) {
							return cb(null, { service });
						}

						let params = {
							filters: { service: [options.serviceName] }
						};
						deployer.listTasks(params, (error, serviceTasks) => {
							checkError(error, 552, cb, () => {

								async.map(serviceTasks, (oneTask, callback) => {
									let task = {
										id: oneTask.ID,
										version: oneTask.Version.Index,
										name: service.name + '.' + oneTask.Slot, //might add extra value later
										ref: {
											slot: oneTask.Slot,
											service: {
												name: service.name,
												id: oneTask.ServiceID
											},
											node: {
												id: oneTask.NodeID
											},
											container: {
												id: oneTask.Status.ContainerStatus.ContainerID
											}
										},
										status: {
											ts: oneTask.Status.Timestamp, //timestamp of the last status update
											state: oneTask.Status.State, //current state of the task, example: running
											desiredState: oneTask.DesiredState, //desired state of the task, example: running
											message: oneTask.Status.Message //current message of the task, example: started or error,
										}
									};

									return callback(null, task);
								}, (error, tasks) => {
									return cb(null, { service, tasks });
								});
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Deletes a deployed service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteService (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id || options.params.serviceName);
				service.remove((error) => {
					checkError(error, 553, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},

	/**
	 * Inspects and returns information about a specified task/pod
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectTask (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let task = deployer.getTask(options.params.taskId);
				task.inspect((error, taskInfo) => {
					checkError(error, 555, cb, () => {
						options.params.id = taskInfo.ServiceID;
						options.params.excludeTasks = true;
						engine.inspectService(options, (error, service) => {
							checkError(error, 550, cb, () => {
								let taskRecord = {
									id: taskInfo.ID,
									version: taskInfo.Version.Index,
									name: service.name + '.' + taskInfo.Slot, //might add extra value later
									ref: {
										slot: taskInfo.Slot,
										service: {
											name: service.name,
											id: taskInfo.ServiceID
										},
										node: {
											id: taskInfo.NodeID
										},
										container: {
											id: taskInfo.Status.ContainerStatus.ContainerID
										}
									},
									status: {
										ts: taskInfo.Status.Timestamp, //timestamp of the last status update
										state: taskInfo.Status.State, //current state of the task, example: running
										desiredState: taskInfo.DesiredState, //desired state of the task, example: running
										message: taskInfo.Status.Message //current message of the task, example: started or error,
									}
								};

								return cb(null, taskRecord);
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Inspects and returns information about a container in a specified node
	 * Stateless approach: [might not be required for stateless HA]
	 * 1. pass task name as param, get container id and node id by inspecting task
	 * 2. Connect to target node and call inspect container on it
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectContainer (options, cb) {
		let opts = {
			collection: dockerColl,
			conditions: { recordType: 'node', id: options.params.nodeId }
		};
		options.model.findEntry(options.soajs, opts, (error, node) => {
			checkError(error || !node, cb, () => {
				//TODO: replace ip/port with node id
				options.deployerConfig.host = node.ip;
				options.deployerConfig.port = node.dockerPort;
				options.deployerConfig.flags = { targetNode: true, swarmMember: true };

				lib.getDeployer(options, (error, deployer) => {
					checkError(error, 540, cb, () => {
						let container = deployer.getContainer(options.params.containerId);
						container.inspect(cb);
					});
				});
			});
		});
	},

	/**
	 * Collects and returns a container logs from a specific node
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	 getContainerLogs (options, res) {
		 engine.inspectTask(options, (error, task) => {
			 if (error) {
 				options.soajs.log.error(error);
 				return options.res.jsonp(options.soajs.buildResponse({code: 555, msg: error.message}));
 			}

			 let containerId = task.Status.ContainerStatus.ContainerID;
			 let opts = {
				 collection: dockerColl,
				 conditions: { recordType: 'node', id: task.NodeID }
			 };

			 options.model.findEntry(options.soajs, opts, (error, node) => { //TODO: update to support stateless HA
				 if (error || !node) {
					 error = ((error) ? error : {message: 'Node record not found'});
					 options.soajs.log.error(error);
					 return options.res.jsonp(options.soajs.buildResponse({code: 601, msg: error.message}));
				 }

				 options.deployerConfig.host = node.ip;
				 options.deployerConfig.port = node.dockerPort;
				 options.deployerConfig.flags = { targetNode: true, swarmMember: true };
				 lib.getDeployer(options, (error, deployer) => {
					 checkError(error, 540, cb, () => {

						 let container = deployer.getContainer(containerId);
						 let logOptions = {
							 stdout: true,
							 stderr: true,
							 tail: options.params.tail || 400
						 };

						 container.logs(logOptions, (error, logStream) => {
							 checkError(error, cb, () => {
								 let data = '', chunk;
								 logStream.setEncoding('utf8');
								 logStream.on('readable', () => {
									 let handle = this;
									 while ((chunk = handle.read()) !== null) {
										 data += chunk.toString('utf8');
									 }
								 });

								 logStream.on('end', () => {
									 logStream.destroy();
									 return cb(null, {data: data})
								 });
							 });
						 });
					 });
				 });
			 });
		 });
	 },

	/**
	 * List available networks, strategy in this case is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listNetworks (options, cb) {
		let params = {};

		if (!options.params.all) {
			params.filters = {
				type: {
					custom: true
				}
			};
		}

		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.listNetworks(params, (error, networks) => {
					checkError(error, 556, cb, () => {
						return cb(null, networks);
					});
				});
			});
		});
	},

	/**
	 * Inspect network, strategy in this case is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectNetwork (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let network = deployer.getNetwork(options.params.id);
				network.inspect((error, network) => {
					checkError(error, 556, cb, () => {
						return cb(null, network);
					});
				});
			});
		});
	},

	/**
	 * Create new network, strategy in this case is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	createNetwork (options, cb) {
		let payload = utils.utils.cloneObj(require(__dirname + '../schemas/network.template.js'));
		payload.Name = options.params.networkName;

		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.createNetwork(payload, (error, network) => {
					checkError(error, 557, cb, () => {
						return cb(null, network);
					});
				});
			});
		});
	},

	/**
	 * Delete all deployed services
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteServices (options, cb) {
		engine.listServices(options, (error, services) => {
			checkError(error, 549, cb, () => {
				async.each(services, (oneService, callback) => {
					options.params.id = oneService.ID;
					engine.deleteService(options, callback);
				}, (error) => {
					checkError(error, 559, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},

	/**
	 * Get the latest version of a deployed service
	 * Returns integer: service version
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getLatestVersion (options, cb) {
		engine.listServices(options, (error, services) => {
			checkError(error, 549, cb, () => {
				let latestVersion = 0, match;
				services.forEach(function (oneService) {
					match = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.env.code'] === options.params.env &&
						oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.name'] === options.params.service;

					if (match) {
						if (oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.version'] > latestVersion) {
							latestVersion = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.version'];
						}
					}
				});

				return cb(null, latestVersion);
			});
		});
	},

	/**
	 * Get the domain/host name of a deployed service (per version)
	 * Sample response: {"1":"DOMAIN","2":"DOMAIN"}, input: service name, version
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getServiceHost (options, cb) {
		engine.listServices(options, (error, services) => {
			checkError(error, 549, cb, () => {
				async.detect(services, (oneService, callback) => {
					let match = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.env.code'] === options.params.env &&
						oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.name'] === options.params.service &&
						oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.version'] === options.params.version;
					return callback(null, match);
				}, (error, service) => {
					checkError(error, 560, cb, () => {
						return cb(null, ((service && service.Spec && service.Spec.Name) ? service.Spec.Name : null));
					});
				});
			});
		});
	},

	/**
	 * Get the domain/host names of controllers per environment for all environments
	 * {"dev":{"1":"DOMAIN","2":"DOMAIN"}}
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getControllerEnvHost (options, cb) {
		engine.listServices(options, (error, services) => {
			checkError(error, cb, () => {
				let envs = {}, match;
				services.forEach(function (oneService) {
					match = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.env.code'] === options.params.env &&
						oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.name'] === 'controller';
				});

				//TODO
			});
		});
	}

};

module.exports = engine;
