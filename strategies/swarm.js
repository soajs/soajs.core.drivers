/*jshint esversion: 6 */

"use strict";

let Docker = require('dockerode');
let async = require('async');
let Grid = require('gridfs-stream');
let clone = require('clone');

let gridfsColl = 'fs.files';

let errorFile = require('../utils/errors.js');

function checkError(error, code, cb, scb) {
	if(error)
		return cb({
			"error": error,
			"code": code,
			"msg": errorFile[code]
		});
	else
		return scb();
}

let lib = {
	getDeployer (options, cb) {
		let config = clone(options.deployerConfig);

		//local deployments can use the unix socket
		if (config.socketPath) {
			return cb(null, new Docker({socketPath: config.socketPath}));
		}

		//remote deployments can use unix socket if function does not require connection to worker nodes
		//dashboard containers are guaranteed to be deployed on manager nodes
		if (!config.flags || (config.flags && !config.flags.targetNode)) {
			return cb(null, new Docker({socketPath: config.socketPath}));
		}

		//remote deployments should use certificates if function requires connecting to a worker node
		if (config.flags && config.flags.targetNode) {
			getTargetNode(options, (error, target) => {
				checkError(error, cb, () => {
					findCerts(options, (error, certs) => {
						checkError(error, cb, () => {
							return cb(null, new Docker(buildDockerConfig(target.host, target.port, certs)));
						});
					});
				});
			});
		}

		function findCerts(options, cb) {
			if (!options.params.envCode) {
				return cb(600);
			}

			let opts = {
				collection: gridfsColl,
				conditions: {
					['metadata.env.' + config.params.envCode.toUpperCase()]: config.params.selectedDriver
				}
			};

			options.model.findEntries(options.soajs, opts, (error, certs) => {
				checkError(error, cb, () => {
					if (!certs || certs.length === 0) {
						return cb(600);
					}

					options.model.getDb(options.soajs).getMongoDB((error, db) => {
						checkError(error, cb, () => {
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
					checkError(error, callback, () => {
						gstore.read((error, filedata) => {
							checkError(error, callback, () => {
								gstore.close();

								var certName = oneCert.filename.split('.')[0];
								certBuffers[oneCert.metadata.certType] = filedata;
								return callback(null, true);
							});
						});
					});
				});
			}, (error, result) => {
				checkError(error, cb, () => {
					return cb(null, certBuffers);
				});
			});
		}

		function getTargetNode(options, cb) {
			let customOptions = clone(options);
			delete customOptions.flags.targetNode;
			engine.inspectNode(customOptions, (error, node) => {
				checkError(error, cb, () => {
					if (node.Spec.Role === 'manager') {
						return cb(null, {host: node.ManagerStatus.Addr.split(':')[0], port: '2376'}); //TODO: get port from env record, deployer object
					}
					else {
						return cb(null, {host: node.Status.Addr, port: '2376'}); //TODO: get port from env record, deployer object
					}
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
							checkError(error, 542, cb, () => {
								return cb(null, {swarm, info});
							});
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
					payload.AdverstiseAddr = options.soajs.inputmaskData.host + ':' + swarmPort;
					payload.RemoteAddrs = remoteAddrs;
					payload.JoinToken = ((options.soajs.inputmaskData.role === 'manager') ? cluster.swarm.JoinTokens.Manager : cluster.swarm.JoinTokens.Worker);

					options.deployerConfig.flags = { targetNode: true };
					lib.getDeployer(options, (error, deployer) => {
						checkError(error, 540, cb, () => {
							deployer.swarmJoin(options.params, (error, res) => {
								checkError(error, 544, cb, () => {
									return cb(null, res);
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

		let deployerConfig = clone(options.deployerConfig);

		options.deployerConfig.host = options.params.ip;
		options.deployerConfig.port = options.params.dockerPort;
		options.deployerConfig.flags = { targetNode: true };
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
	 * Inspect a node, strategy in this case is restricted to swarm
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
						return cb(null, node);
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
						return cb(null, nodes);
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
						return cb(null, services);
					});
				});
			});
		});
	},

	/**
	 * Creates a new deployment for a SOAJS scaleHAService
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deployService (options, cb) {
		let payload = clone(require(__dirname + '../schemas/swarm/service.template.js'));
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
				deployer.createService(payload, (error, service) => {
					checkError(error, 549, cb, () => {
						return cb(null, service);
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
						service.update(update, (error, service) => {
							checkError(error, 551, cb, () => {
								return cb(null, service);
							});
						});
					});
				});
			});
		});
	},

	/**
	 * Gathers and returns information about specified service and a list of its tasks/pods
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
						if (options.params.excludeTasks) {
							return cb(null, { service: serviceInfo });
						}

						let params = {
							filters: { service: [options.serviceName] }
						};
						deployer.listTasks(params, (error, serviceTasks) => {
							checkError(error, 552, cb, () => {
								return cb(null, { service: serviceInfo, tasks: serviceTasks });
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
				service.remove((error, service) => {
					checkError(error, 553, cb, () => {
						return cb(null, service);
					});
				});
			});
		});
	},

	/**
	 * Recursively fetches a service's tasks/pods and returns the same output as inspectService() only when the desired number of tasks/pods is available
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getServiceComponents (options, cb) {
		engine.inspectService(options, (error, info) => {
			checkError(error, 550, cb, () => {
				let runningTasks = [];
				info.tasks.forEach((oneTask) => {
					if (oneTask.Status.State === 'running') {
						runningTasks.push(oneTask);
					}
				});

				if (runningTasks.length !== options.params.serviceCount) {
					setTimeout(engine.getServiceComponents.bind(null, options, (error, components) => {
						checkError(error, 554, cb, () => {
							return cb(null, components);
						});
					});, 500);
				}
				else {
					info.tasks = runningTasks;
					return cb(null, info);
				}
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
		//NOTE: user is expected to have the task name but not its id. API does not support inspect a task by its name directly
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, 540, cb, () => {
				let serviceName = options.params.taskName.split('.')[0];
				let taskSlot = options.params.taskName.split('.')[1];
				let params = { filters: { service: [serviceName] } };

				deployer.listTasks(params, (error, tasks) => {
					checkError(error, 555, cb, () => {
						let found;
						for (let i = 0; i < tasks.length; i++) {
							if (tasks[i].Slot === taskSlot) {
								found = tasks[i];
								break;
							}
						}

						return ((found) ? cb(null, found) : cb());
					});
				});
			});
		});
	},

	/**
	 * Lists containers ona specified node, strategy is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listContainers (options, cb) {
		//TODO: make this work with the deployment script
	},

	/**
	 * Inspects and returns information about a container in a specified node
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	//todo: modify the method in order not to use the docker collection anymore
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
				options.deployerConfig.flags = { targetNode: true };

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
	 * Delete container, strategy is this case is restricted to swarm
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteContainer (options, cb) {

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


			let containerId = task.Status.ContainerStatus.ContainerID;
			let opts = {
				collection: dockerColl,
				conditions: { recordType: 'node', id: task.NodeID }
			};

			model.findEntry(options.soajs, opts, (error, node) => {
				if (error || !node) {
					error = ((error) ? error : {message: 'Node record not found'});
					options.soajs.log.error(error);
					return options.res.jsonp(options.soajs.buildResponse({code: 601, msg: error.message}));
				}

				options.deployerConfig.host = node.ip;
				options.deployerConfig.port = node.dockerPort;
				options.deployerConfig.flags = {targetNode: true};
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
								return cb(null, {data: data}));
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
		let payload = clone(require(__dirname + '../schemas/network.template.js'));
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
				}, (error, services) => {
					checkError(error, 559, cb, () => {
						return cb(null, services);
					});
				});
			});
		});
	},

	/** //TODO: review
	 * Delete all tasks or pods
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteTasksOrPods (options, cb) {

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
