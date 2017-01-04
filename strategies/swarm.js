"use strict";

let Docker = require('dockerode');
let async = require('async');
let Grid = require('gridfs-stream');
let clone = require('clone');

let gridfsColl = 'fs.files';

function checkError(error, cb, fCb) {
	return (error) ? cb(error) : true;
}

let lib = {
	getDeployer (options, cb) {
		let config = clone(options.deployerConfig);
		let docker;

		//local deployments can use the unix socket
		if (config.socketPath) {
			docker = new Docker({socketPath: config.socketPath});
			return cb(null, docker);
		}

		//remote deployments can use unix socket if function does not require connection to worker nodes
		//dashboard containers are guaranteed to be deployed on manager nodes
		if (!config.flags || (config.flags && !config.flags.targetNode)) {
			docker = new Docker({socketPath: config.socketPath});
			return cb(null, docker);
		}

		//remote deployments should use certificates if function requires connecting to a worker node
		if (config.flags && config.flags.targetNode) {
			getTargetNode(options, (error, target) => {
				checkError(error, cb);
				findCerts(options, (error, certs) => {
					checkError(error, cb);
					return cb(null, new Docker(buildDockerConfig(target.host, target.port, certs)));
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
				checkError(error, cb);
				if (!certs || certs.length === 0) {
					return cb(600);
				}

				options.model.getDb(options.soajs).getMongoDB((error, db) => {
					checkError(error, cb);
					let gfs = Grid(db, options.model.getDb(options.soajs).mongodb);
					return pullCerts(certs, gfs, db, cb);
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
					checkError(error, callback);
					gstore.read((error, filedata) => {
						checkError(error, callback);
						gstore.close();

						var certName = oneCert.filename.split('.')[0];
						certBuffers[oneCert.metadata.certType] = filedata;
						return callback(null, true);
					});
				});
			}, (error, result) => {
				checkError(error, cb);
				return cb(null, certBuffers);
			});
		}

		function getTargetNode(options, cb) {
			let customOptions = clone(options);
			delete customOptions.flags.targetNode;
			engine.inspectNode(customOptions, (error, node) => {
				checkError(error, cb);
				if (node.Spec.Role === 'manager') {
					return cb(null, {host: node.ManagerStatus.Addr.split(':')[0], port: ''}); //TODO: find a way to get engine port
				}
				else {
					return cb(null, {host: node.Status.Addr, port: ''}); //TODO: find a way to get engine port
				}
			});
		}

		function buildDockerConfig(host, port, certs) {
			let dockerConfig = { host: host, port: port };

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
	* Inspect a swarm cluster, strategy in this case is restricted to swarm
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	inspectCluster (options, cb) {

	},

	/**
	* Adds a node to a cluster
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	addNode (options, cb) {
		options.deployerConfig.flags = { targetNode: true };
		lib.getDeployer(options, (error, deployer) => {
			checkError(error, cb);
			deployer.swarmJoin(options.params, (error) => {
				checkError(error, cb);
				//TODO: update env records, deployer object, if new node is manager add it to list
				if (options.params.role === 'manager') {
					return cb(null, true);
				}
				else {
					return cb(null, true);
				}
			});
		});
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
			checkError(error, cb);
			targetDeployer.swarmLeave((error) => {
				checkError(error, cb);
				//return response and remove node entry from swarm in the background
				cb(null, true);

				options.deployerConfig = deployerConfig;
				lib.getDeployer(options, (error, deployer) => {
					checkError(error, cb);
					let node = deployer.getNode(options.params.id);
					setTimeout(node.remove.bind(null, options.backgroundCB), 20000);
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
			checkError(error, cb);
			let node = deployer.getNode(options.params.nodeId);

			//need to inspect node in order to get its current version and pass it to update call
			node.inspect((error, node) => {
				checkError(error, cb);
				options.params.version = node.Version.Index;
				node.update(options.params, (error) => {
					checkError(error, cb);
					return cb(null, true);
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
			checkError(error, cb);

			let node = deployer.getNode(options.params.id);
			node.inspect(cb);
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
			checkError(error, cb);
			deployer.listNodes(cb);
		});
	},

	/**
	* Generates an object that contains all required information about a node
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	buildNodeRecord (options, cb) {
		var record = {
			recordType: 'node',
			id: options.params.node.ID,
			name: options.params.node.Description.Hostname,
			availability: options.params.node.Spec.Availability,
			role: options.params.node.Spec.Role,
			resources: {
				cpuCount: options.params.node.Description.Resources.NanoCPUs / 1000000000,
				memory: options.params.node.Description.Resources.MemoryBytes
			},
			tokens: options.params.managerNodes[0].tokens
		};

		if (record.role === 'manager') {
			record.ip = options.params.node.ManagerStatus.Addr.split(':')[0];
			record.dockerPort = options.soajs.inputmaskData.port;
			record.swarmPort = options.params.node.ManagerStatus.Addr.split(':')[1];
		}
		else {
			record.ip = options.soajs.inputmaskData.host;
			record.dockerPort = options.soajs.inputmaskData.port;
			record.swarmPort = options.params.swarmPort;
		}
		return cb(record);
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
			checkError(error, cb);
			deployer.listServices({}, cb);
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
			checkError(error, cb);
			options.params.excludeTasks = true;
			engine.inspectService(options, (error, info) => {
				checkError(error, cb);
				let service = deployer.getService(info.service.ID); //NOTE: api does not allow using service name for update ops
				let update = info.service.Spec;

				update.version = info.service.Version.Index;
				update.Mode.Replicated.Replicas = options.params.scale;
				service.update(update, cb);
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
			checkError(error, cb);
			let service = deployer.getService(options.params.id || options.params.serviceName);
			service.inspect((error, serviceInfo) => {
				checkError(error, cb);

				if (options.params.excludeTasks) {
					return cb(null, { service: serviceInfo });
				}

				let params = {
					filters: { service: [options.serviceName] }
				};
				deployer.listTasks(params, (error, serviceTasks) => {
					checkError(error, cb);
					return cb(null, { service: serviceInfo, tasks: serviceTasks });
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
			checkError(error, cb);
			let service = deployer.getService(options.params.id || options.params.serviceName);
			service.remove(cb);
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
			checkError(error, cb);
			let runningTasks = [];
			info.tasks.forEach((oneTask) => {
				if (oneTask.Status.State === 'running') {
					runningTasks.push(oneTask);
				}
			});

			if (runningTasks.length !== options.params.serviceCount) {
				setTimeout(engine.getServiceComponents.bind(null, options, cb), 500);
			}
			else {
				info.tasks = runningTasks;
				return cb(null, info);
			}
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
			checkError(error, cb);
			let serviceName = options.params.taskName.split('.')[0];
			let taskSlot = options.params.taskName.split('.')[1];
			let params = { filters: { service: [serviceName] } };

			deployer.listTasks(params, (error, tasks) => {
				checkError(error, cb);
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
	inspectContainer (options, cb) {
		let opts = {
			collection: dockerColl,
			conditions: { recordType: 'node', id: options.params.nodeId }
		};
		options.model.findEntry(options.soajs, opts, (error, node) => {
			checkError(error || !node, cb);
			options.deployerConfig.host = node.ip;
			options.deployerConfig.port = node.dockerPort;
			options.deployerConfig.flags = { targetNode: true };

			lib.getDeployer(options, (error, deployer) => {
				checkError(error, cb);
				let container = deployer.getContainer(options.params.containerId);
				container.inspect(cb);
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
		//TODO: make this work with the deployment script
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
				return options.res.jsonp(options.soajs.buildResponse({code: 811, msg: error.message}));
			}

			let containerId = task.Status.ContainerStatus.ContainerID;
			let opts = {
				collection: dockerColl,
				conditions: { recordType: 'node', id: task.NodeID }
			};

			model.findEntry(options.soajs, opts, (error, node) => {
				if (error || !node) {
					error = ((error) ? error: {message: 'Node record not found'});
					options.soajs.log.error(error);
					return options.res.jsonp(options.soajs.buildResponse({code: 601, msg: error.message}));
				}

				options.deployerConfig.host = node.ip;
				options.deployerConfig.port = node.dockerPort;
				options.deployerConfig.flags = { targetNode: true };
				lib.getDeployer(options, (error, deployer) => {
					if (error) {
						options.soajs.log.error(error);
						return options.res.jsonp(options.soajs.buildResponse({code: 601, msg: error.message}));
					}

					let container = deployer.getContainer(containerId);
					let logOptions = {
						stdout: true,
						stderr: true,
						tail: options.params.tail || 400
					};

					container.logs(logOptions, (error, logStream) => {
						if (error) {
							options.soajs.log.error(error);
							return options.res.jsonp(options.soajs.buildResponse({code: 601, msg: error.message}));
						}

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
							return options.res.jsonp(options.soajs.buildResponse(null, {data: data}));
						});
					});
				});
			});
		});
	},

	/**
	* Generates an object that contains all required information about a container
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	buildContainerRecords (options, cb) {
		async.map(options.params.serviceInfo.tasks, (oneInstance, callback) => {
			options.params.nodeId = oneInstance.NodeID;
			options.params.containerId = oneInstance.Status.ContainerStatus.ContainerID;

			engine.inspectContainer(options, (error, container) => {
				checkError(error, cb);
				let newRecord = {
					type: options.params.serviceType,
					env: options.soajs.inputmaskData.envCode.toLowerCase(),
					running: true,
					recordType: 'container',
					deployer: options.deployerConfig,
					taskName: container.Config.Labels['com.docker.swarm.task.name'],
					serviceName: container.Config.Labels['com.docker.swarm.service.name']
				};

				//NOTE: cleaning dots from field names to avoid mongo error
				let labels = Object.keys(containerInfo.Config.Labels);
				labels.forEach((oneLabel) => {
					container.Config.Labels[oneLabel.replace(/\./g, '-')] = container.Config.Labels[oneLabel];
					delete container.Config.Labels[oneLabel];
				});
				newRecord.info = containerInfo;

				return callback(null, newRecord);
			});
		}, cb);
	},

	/**
	* Loops over current saved container records and returns any new instances not yet saved in docker collection
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	getNewInstances (options, cb) {
		let newInstances = [];
		async.each(options.params.serviceInfo.tasks, (oneTask, callback) => {
			let found, taskName = options.params.serviceInfo.service.Spec.Name + '.' + oneTask.Slot;
			for (let i = 0; i < options.params.dockerRecords.length; i++) {
				found = (options.params.dockerRecords[i].taskName === taskName);
				if (found) break;
			}

			if (!found) {
				newInstances.push(oneTask);
			}

			return callback(null, true);
		}, (error, result) => {
			return cb(newInstances);
		});
	},

	/**
	* Loops over current saved container records and returns any saved records in docker collection that no longer exist in the cluster
	*
	* @param {Object} options
	* @param {Function} cb
	* @returns {*}
	*/
	getRemovedInstances (options, cb) {
		let rmInstances = [];
		async.each(options.params.dockerRecords, (oneRecord, callback) => {
			let found;
			for (let i = 0; i < options.params.serviceInfo.tasks.length; i++) {
				let taskName = options.params.serviceInfo.Spec.Name + '.' + options.params.serviceInfo.tasks[i].Slot;
				found = (taskName === oneRecord.taskName);
				if (found) break;
			}

			if (!found) {
				rmInstances.push(oneRecord);
			}

			return callback(null, true);
		}, (error, result) => {
			return cb(rmInstances);
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
			checkError(error, cb);
			deployer.listNetworks(params, cb);
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
			checkError(error, cb);
			let network = deployer.getNetwork(options.params.id);
			network.inspect(cb);
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
			checkError(error, cb);
			deployer.createNetwork(payload, cb);
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
			checkError(error, cb);
			async.each(services, (oneService, callback) => {
				options.params.id = oneService.ID;
				engine.deleteService(options, callback);
			}, cb);
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
			checkError(error, cb)
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
			checkError(error, cb);
			async.detect(services, (oneService, callback) => {
				let match = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.env.code'] === options.params.env &&
				oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.name'] === options.params.service &&
				oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.version'] === options.params.version;
				return callback(null, match);
			}, (error, service) => {
				return cb(null, ((service && service.Spec && service.Spec.Name) ? service.Spec.Name : null));
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
			checkError(error, cb);
			let envs = {}, match;
			services.forEach(function (oneService) {
				match = oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.env.code'] === options.params.env &&
				oneService.Spec.TaskTemplate.ContainerSpec.Labels['org.soajs.service.name'] === 'controller';


			});

			//TODO
		});
	}

};

module.exports = engine;
