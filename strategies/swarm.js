/*jshint esversion: 6 */

"use strict";

const Docker = require('dockerode');
const async = require('async');
const Grid = require('gridfs-stream');
const request = require('request');

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

const lib = {
	getDeployer (options, cb) {
		let config = options.deployerConfig, deployer;

		if (!config.flags || (config.flags && !config.flags.targetNode)) {
			redirectToProxy();
		}

		//remote deployments should use certificates if function requires connecting to a worker node
		if (config.flags && config.flags.targetNode) {
			getTargetNode(options, (error, target) => {
				checkError(error, 600, cb, () => {
					//target object in this case contains ip/port of target node
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

		function redirectToProxy() {
			let ports = options.soajs.registry.serviceConfig.ports;
			deployer = new Docker({
				host: ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller',
				port: ports.controller + ports.maintenanceInc,
				version: 'proxySocket'
			});

			lib.ping({ deployer }, (error) => {
				checkError(error, 600, cb, () => { //TODO: fix params
					return cb(null, deployer);
				});
			});
		}

		function getTargetNode(options, cb) {
			/**
			* This function is triggered whenever a connection to a specific node is required. Three options are available:
			* 1. The target node is a member of the cluster, query the swarm to get its address and return it (example: get logs of a container deployed on cluster member x)
			* 2. The target node is not a member of the cluster, such as when adding a new node to the cluster
			*/
			if (config.flags.swarmMember) {
				if (options.driver.split('.')[1] === 'local') { //local deployment means the cluster has one manager node only
					return redirectToProxy();
				}

				let customOptions = utils.cloneObj(options);
				delete customOptions.deployerConfig.flags.targetNode;

				//node is already part of the swarm, inspect it to obtain its address
				engine.inspectNode(customOptions, (error, node) => {
					checkError(error, 600, cb, () => { //TODO: wrong error code, update
						if (node.role === 'manager') { //option number one
							return cb(null, {host: node.managerStatus.address.split(':')[0], port: '2376'}); //TODO: get port from env record, deployer object
						}
						else {
							return cb(null, {host: node.ip, port: '2376'}); //TODO: get port from env record, deployer object
						}
					});
				});
			}
			else { //option number two
				//swarmMember = false flag means the target node is a new node that should be added to the cluster, invoked by addNode()
				//we only need to return the host/port provided by the user, the ping function will later test if a connection can be established
				return cb(null, {host: options.params.host, port: options.params.port});
			}
		}

		function findCerts(options, cb) {
			if (!options.env) {
				return cb(600);
			}

			let opts = {
				collection: gridfsColl,
				conditions: {
					['metadata.env.' + options.env.toUpperCase()]: options.driver
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
	},

	buildNodeRecord (options) {
		let record = {
			id: options.node.ID,
			hostname: options.node.Description.Hostname,
			ip: options.node.Status.Addr,
			version: options.node.Version.Index,
			state: options.node.Status.State,
			spec: {
				role: options.node.Spec.Role,
				availability: options.node.Spec.Availability
			},
			resources: {
				cpus: options.node.Description.Resources.NanoCPUs / 1000000000,
				memory: options.node.Description.Resources.MemoryBytes
			}
		};

		if (record.spec.role === 'manager') {
			record.managerStatus = {
				leader: options.node.ManagerStatus.Leader,
				reachability: options.node.ManagerStatus.Reachability,
				address: options.node.ManagerStatus.Addr
			};
		}

		return record;
	},

	buildServiceRecord (options) {
		let record = {
			id: options.service.ID,
			version: options.service.Version.Index,
			name: options.service.Spec.Name,
			labels: options.service.Spec.Labels,
			env: options.service.Spec.TaskTemplate.ContainerSpec.Env || [],
			ports: [],
			tasks: []
		};

		if (options.service.Endpoint && options.service.Endpoint.Ports && options.service.Endpoint.Ports.length > 0) {
			options.service.Endpoint.Ports.forEach((onePortConfig) => {
				record.ports.push({
					protocol: onePortConfig.Protocol,
					target: onePortConfig.TargetPort,
					published: onePortConfig.PublishedPort
				});
			});
		}

		return record;
	},

	buildTaskRecord (options) {
		let record = {
			id: options.task.ID,
			version: options.task.Version.Index,
			name: options.serviceName + '.' + options.task.Slot, //might add extra value later
			ref: {
				slot: options.task.Slot,
				service: {
					name: options.serviceName,
					id: options.task.ServiceID
				},
				node: {
					id: options.task.NodeID
				},
				container: {
					id: options.task.Status.ContainerStatus.ContainerID
				}
			},
			status: {
				ts: options.task.Status.Timestamp, //timestamp of the last status update
				state: options.task.Status.State, //current state of the task, example: running
				desiredState: options.task.DesiredState, //desired state of the task, example: running
				message: options.task.Status.Message //current message of the task, example: started or error,
			}
		};

		return record;
	}
};

const engine = {

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
				buildManagerNodeList(cluster.info.Swarm.RemoteManagers, (error, remoteAddrs) => {
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
		 - get deployer of a manager node in the swarm
		 - remove node
		 */

		 options.deployerConfig.flags = { targetNode: true, swarmMember: true };
		 lib.getDeployer(options, (error, targetDeployer) => {
			 checkError(error, 540, cb, () => {
				 targetDeployer.swarmLeave((error) => {
					checkError(error, 545, cb, () => {

						delete options.deployerConfig.flags;
						lib.getDeployer(options, (error, deployer) => {
							checkError(error, 540, cb, () => {
								let node = deployer.getNode(options.params.id);
								node.remove({force: true}, (error) => {
									checkError(error, 654, cb, cb.bind(null, null, true));
								});
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
				let node = deployer.getNode(options.params.id);
				//need to inspect node in order to get its current version and pass it to update call
				node.inspect((error, nodeInfo) => {
					checkError(error, 547, cb, () => {
						let update = nodeInfo.Spec;
						update.version = nodeInfo.Version.Index;

						delete options.params.id;
						Object.keys(options.params).forEach((oneUpdateParam) => {
							update[oneUpdateParam.charAt(0).toUpperCase() + oneUpdateParam.slice(1)] = options.params[oneUpdateParam];
						});
						node.update(update, (error) => {
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
						return cb(null, lib.buildNodeRecord({ node }));
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
						async.map(nodes, (node, callback) => {
							return callback(null, lib.buildNodeRecord({ node }));
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
				let params = {};
				if (options.params && options.params.env) {
					params.filters = { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env ] };
				}

				deployer.listServices(params, (error, services) => {
					checkError(error, 549, cb, () => {
						async.map(services, (oneService, callback) => {
							let record = lib.buildServiceRecord({ service: oneService });

							if (options.params && options.params.excludeTasks) {
								return callback(null, record);
							}

							let params = {
								filters: { service: [oneService.Spec.Name] }
							};
							deployer.listTasks(params, (error, serviceTasks) => {
								if (error) {
									return callback(error);
								}

								async.map(serviceTasks, (oneTask, callback) => {
									return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: oneService.Spec.Name }));
								}, (error, tasks) => {
									if (error) {
										return callback(error);
									}

									record.tasks = tasks;
									return callback(null, record);
								});
							});
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
		let payload = utils.cloneObj(require(__dirname + '/../schemas/swarm/service.template.js'));
		options.params.variables.push('SOAJS_DEPLOY_HA=swarm');
		options.params.variables.push('SOAJS_HA_NAME={{.Task.Name}}');

		payload.Name = options.params.name;
		payload.TaskTemplate.ContainerSpec.Image = options.params.image;
		payload.TaskTemplate.ContainerSpec.Env = options.params.variables;
		payload.TaskTemplate.ContainerSpec.Dir = ((options.params.containerDir) ? options.params.containerDir : "");
		payload.TaskTemplate.ContainerSpec.Command = [options.params.cmd[0]];
		payload.TaskTemplate.ContainerSpec.Args = options.params.cmd.splice(1);
		payload.TaskTemplate.Resources.Limits.MemoryBytes = options.params.memoryLimit;
		payload.TaskTemplate.RestartPolicy.Condition = options.params.restartPolicy.condition;
		payload.TaskTemplate.RestartPolicy.MaxAttempts = options.params.restartPolicy.maxAttempts;
		payload.Mode[options.params.replication.mode.charAt(0).toUpperCase() + options.params.replication.mode.slice(1)] = {};
		payload.Networks[0].Target = ((options.params.network) ? options.params.network : "");
		payload.Labels = options.params.labels;
		payload.EndpointSpec = { Mode: 'vip' , ports: [] };

		if (options.params.replication.mode === 'replicated') {
			payload.Mode.Replicated.Replicas = options.params.replication.replicas;
		}

		if (options.params.volume) {
			payload.TaskTemplate.ContainerSpec.Mounts.push({
				Type: options.params.volume.type,
				ReadOnly: options.params.volume.readOnly,
				Source: options.params.volume.source,
				Target: options.params.volume.target,
			});
		}

		if (options.ports && options.ports.length > 0) {
			options.ports.forEach((onePortEntry) => {
				if (onePortEntry.isPublished) {
					payload.EndpointSpec.ports.push({
						Protocol: 'tcp',
						TargetPort: onePortEntry.target,
						PublishedPort: onePortEntry.published
					});
				}
			});
		}

		if (process.env.SOAJS_TEST) {
			//using lightweight image and commands to optimize travis builds
			//the purpose of travis builds is to test the dashboard api, not the docker containers
			payload.TaskTemplate.ContainerSpec.Image = 'alpine:latest';
			payload.TaskTemplate.ContainerSpec.Command = ['sh'];
			payload.TaskTemplate.ContainerSpec.Args = ['-c', 'sleep 36000'];
		}

		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				deployer.createService(payload, (error, service) => {
					checkError(error, 549, cb, () => {
						return cb(null, service);
					});
				});
			});
		});
	},

	/**
	 * Redeploy a service
	 * This update process is simulated by adding/replacing a dummy environment variables that automatically triggers a redeploy command for all service containers
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	 redeployService (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id);
				service.inspect((error, serviceInfo) => {
					checkError(error, 550, cb, () => {
						let update = serviceInfo.Spec;
						update.version = serviceInfo.Version.Index;
						update.TaskTemplate.ContainerSpec.Env.push('SOAJS_REDEPLOY_TRIGGER=true');

						service.update(update, (error) => {
							checkError(error, 653, cb, cb.bind(null, null, true));
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
				//NOTE: not using engine.inspectService() since the required info are not included in its response
				let service = deployer.getService(options.params.id);
				service.inspect((error, serviceInfo) => {
					checkError(error, 550, cb, () => {
						let update = serviceInfo.Spec;
						update.version = serviceInfo.Version.Index;
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
	inspectService (options, cb) { //TODO: test again
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id);
				service.inspect((error, serviceInfo) => {
					checkError(error, 550, cb, () => {
						let service = lib.buildServiceRecord({ service: serviceInfo });

						if (options.params.excludeTasks) {
							return cb(null, { service });
						}

						let params = {
							filters: { service: [options.params.id] }
						};
						deployer.listTasks(params, (error, serviceTasks) => {
							checkError(error, 552, cb, () => {

								async.map(serviceTasks, (oneTask, callback) => {
									return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: options.params.id }));
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
	 * Takes environment code and soajs service name and returns corresponding swarm service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	 findService (options, cb) {
		 lib.getDeployer(options, (error, deployer) => {
 			checkError(error, 540, cb, () => {
 				let params = {
 					filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
 				};

 				if (options.params.version) {
 					params.filters.label.push('soajs.service.version=' + options.params.version);
 				}

 				deployer.listServices(params, (error, services) => {
 					checkError(error, 549, cb, () => {
 						checkError(services.length === 0, 550, cb, () => {
							//NOTE: only one service with the same name and version can exist in a given environment
							return cb(null, lib.buildServiceRecord({ service: services[0] }));
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
				let service = deployer.getService(options.params.id);
				service.remove((error) => {
					checkError(error, 553, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},

	/**
	 * Inspects and returns information about a specified task
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
								return cb(null, lib.buildTaskRecord({ task: taskInfo, serviceName: service.name }));
							});
						});
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
	 getContainerLogs (options) {

		 /**
		 * 1. inspect task provided as input, get container id and node id
		 * 2. inspect target node and get its ip
		 * 3. connect to target node and get container logs
		 */

		 let res = options.res;
		 delete options.res;
		 lib.getDeployer(options, (error, deployer) => {
			check(error, 540, () => {
				//NOTE: engine.inspectTask() does not return the container status
				let task = deployer.getTask(options.params.taskId);
				task.inspect((error, taskInfo) => {
					check(error, 555, () => {
						let containerId = taskInfo.Status.ContainerStatus.ContainerID;
						let nodeId = taskInfo.NodeID;

						options.params.id = nodeId;
						options.deployerConfig.flags = { targetNode: true, swarmMember: true };
						lib.getDeployer(options, (error, deployer) => {
							check(error, 540, () => {
								let container = deployer.getContainer(containerId);
								let logOptions = {
									stdout: true,
									stderr: true,
									tail: options.params.tail || 400
								};
								container.logs(logOptions, (error, logStream) => {
									check(error, 537, () => {
										let data, chunk;
										logStream.setEncoding('utf8');
										logStream.on('readable', () => {
											while((chunk = logStream.read()) !== null) {
												data += chunk.toString('utf8');
											}
										});

										logStream.on('end', () => {
											logStream.destroy();
											return res.jsonp(options.soajs.buildResponse(null, { data }));
										});
									});
								});
							});
						});
					});
				});
			});
		 });

		 function check(error, code, cb) {
			 if (error) {
				 return res.jsonp(options.soajs.buildResponse({code: code, msg: errorFile[code]}));
			 }

			 return cb();
		 }
	 },

	 /**
 	 * Perform a SOAJS maintenance operation on a given service
 	 *
 	 * @param {Object} options
 	 * @param {Function} cb
 	 * @returns {*}
 	 */
	 maintenance (options, cb) {
		 lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let params = {
					filters: { service: [options.params.id] }
				};
				deployer.listTasks(params, (error, tasks) => {
					checkError(error, 552, cb, () => {
						async.map(tasks, (oneTask, callback) => {
							async.detect(oneTask.NetworksAttachments, (oneConfig, callback) => {
								return callback(null, oneConfig.Network && oneConfig.Network.Spec && oneConfig.Network.Spec.Name === options.params.network);
							}, (error, networkInfo) => {
								let taskInfo = {
									id: oneTask.ID,
									networkInfo: networkInfo
								};
								return callback(null, taskInfo);
							});
						}, (error, targets) => {
							async.map(targets, (oneTarget, callback) => {
								if (!oneTarget.networkInfo.Addresses || oneTarget.networkInfo.Addresses.length === 0) {
									return callback(null, {
										result: false,
										ts: new Date().getTime(),
										error: {
											msg: 'Unable to get the ip address of the container'
										}
									});
								}
								let oneIp = oneTarget.networkInfo.Addresses[0].split('/')[0];
								let requestOptions = {
									uri: 'http://' + oneIp + ':' + options.params.maintenancePort + '/' + options.params.operation,
									json: true
								};
								request.get(requestOptions, (error, response, body) => {
									let operationResponse = {
										id: oneTarget.id,
										response: {}
									};

									if (error) {
										operationResponse.response = {
											result: false,
											ts: new Date().getTime(),
											error: error
										};
									}
									else {
										operationResponse.response = body;
									}
									return callback(null, operationResponse);
								});
							}, cb);
						});
					});
				});
			});
		 });
	 },

	/**
	 * List available networks, strategy in this case is restricted to swarm
	 * NOTE: function required by installer, not part of current release
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	// listNetworks (options, cb) {
	// 	let params = {};
	//
	// 	if (!options.params.all) {
	// 		params.filters = {
	// 			type: {
	// 				custom: true
	// 			}
	// 		};
	// 	}
	//
	// 	lib.getDeployer(options, (error, deployer) => {
	// 		checkError(error, 540, cb, () => {
	// 			deployer.listNetworks(params, (error, networks) => {
	// 				checkError(error, 556, cb, () => {
	// 					return cb(null, networks);
	// 				});
	// 			});
	// 		});
	// 	});
	// },

	/**
	 * Inspect network, strategy in this case is restricted to swarm
	 * NOTE: function required by installer, not part of current release
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	// inspectNetwork (options, cb) {
	// 	lib.getDeployer(options, (error, deployer) => {
	// 		checkError(error, 540, cb, () => {
	// 			let network = deployer.getNetwork(options.params.id);
	// 			network.inspect((error, network) => {
	// 				checkError(error, 556, cb, () => {
	// 					return cb(null, network);
	// 				});
	// 			});
	// 		});
	// 	});
	// },

	/**
	 * Create new network, strategy in this case is restricted to swarm
	 * NOTE: function required by installer, not part of current release
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	// createNetwork (options, cb) {
	// 	let payload = utils.utils.cloneObj(require(__dirname + '/../schemas/network.template.js'));
	// 	payload.Name = options.params.networkName;
	//
	// 	lib.getDeployer(options, (error, deployer) => {
	// 		checkError(error, 540, cb, () => {
	// 			deployer.createNetwork(payload, (error, network) => {
	// 				checkError(error, 557, cb, () => {
	// 					return cb(null, network);
	// 				});
	// 			});
	// 		});
	// 	});
	// },

	/**
	 * Delete all deployed services
	 * NOTE: function required by installer, not part of current release
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	// deleteServices (options, cb) {
	// 	engine.listServices(options, (error, services) => {
	// 		checkError(error, 549, cb, () => {
	// 			async.each(services, (oneService, callback) => {
	// 				options.params.id = oneService.ID;
	// 				engine.deleteService(options, callback);
	// 			}, (error) => {
	// 				checkError(error, 559, cb, () => {
	// 					return cb(null, true);
	// 				});
	// 			});
	// 		});
	// 	});
	// },

	/**
	 * Get the latest version of a deployed service
	 * Returns integer: service version
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getLatestVersion (options, cb) {
		let latestVersion = 0, v;
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let params = {
					filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
				};
				deployer.listServices(params, (error, services) => {
					checkError(error, 549, cb, () => {
						services.forEach((oneService) => {
							if (oneService.Spec && oneService.Spec.Labels && oneService.Spec.Labels['soajs.service.version']) {
								v = parseInt(oneService.Spec.Labels['soajs.service.version']);

								if (v > latestVersion) {
									latestVersion = v;
								}
							}
						});

						return cb(null, latestVersion);
					});
				});
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
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let params = {
					filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
				};

				if (options.params.version) {
					params.filters.label.push('soajs.service.version=' + options.params.version);
				}

				deployer.listServices(params, (error, services) => {
					checkError(error, 549, cb, () => {
						if (services.length === 0) {
							return cb({message: 'Service not found'});
						}

						//NOTE: only one service with the same name and version can exist in a given environment
						return cb(null, services[0].Spec.Name);
					});
				});
			});
		});
	}

};

module.exports = engine;
