"use strict";

let Docker = require('dockerode');
let async = require('async');
let Grid = require('gridfs-stream');
let clone = require('clone');

function checkError(error, cb, fCb) {
	if (error) {
		return cb(error, null);
	}
	return fCb();
}

function getDockerCerts(certs, gfs, db, cb) { //NOTE: common function for docker and kubernetes driver
	let certBuffers = {};
	async.each(certs, function (oneCert, callback) {
		let gs = new gfs.mongo.GridStore(db, oneCert._id, 'r', { //TODO: update to support model injection
			root: 'fs',
			w: 1,
			fsync: true
		});

		gs.open(function (error, gstore) {
			checkError(error, callback, function () {
				gstore.read(function (error, filedata) {
					checkError(error, callback, function () {
						gstore.close();

						let certName = oneCert.filename.split('.')[0];
						certBuffers[oneCert.metadata.certType] = filedata;
						return callback(null, true);
					});
				});
			});
		});
	}, function (error, result) {
		checkError(error, cb, function () {
			return cb(null, certBuffers);
		});
	});
}

let lib = {
	getDeployer (options, cb) {
        //(soajs, deployerConfig, model, cb)
		/**
		 Three options:
		 - local: use socket port
		 - remote: get fastest manager node and use it
		 - remote and target: get deployer for target node
		 */

		// var config = utils.cloneObj(deployerConfig);
        let config = JSON.parse(JSON.stringify (options.deployerConfig)); //TODO: change
		let docker;

		if (config.socketPath) {
			docker = new Docker({socketPath: config.socketPath});
			return cb(null, docker);
		}

		getClusterCertificates(config, (error, certs) => {
			checkError(error, cb, () => {

				if (config.flags && (config.flags.newNode || config.flags.targetNode)) {
					getTargetNode(config, (error, target) => {
						checkError(error, cb, () => {
							let dockerConfig = buildDockerConfig(target.host, target.port, certs);
							docker = new Docker(dockerConfig);
							return cb(null, docker);
						});
					});
				}
				else {
					return getManagerNodeDeployer(config, certs, cb);
				}
			});
		});


		function getTargetNode(config, callback) {
			if (!config.host || !config.port) {
				return callback({message: 'Missing host/port info'});
			}
			return callback(null, {host: config.host, port: config.port});
		}

		function getManagerNodeDeployer(config, certs, cb) {
			if (!config.nodes || config.nodes.length === 0) {
				return cb({message: 'No manager nodes found in this environment\'s deployer'});
			}

			let opts = {
				collection: dockerColl,
				conditions: { recordType: 'node', role: 'manager' }
			};

			options.model.findEntries(options.soajs, opts, (error, managerNodes) => {
				checkError(error, cb, () => {
					async.detect(managerNodes, (oneNode, callback) => {
						let dockerConfig = buildDockerConfig(oneNode.ip, oneNode.dockerPort, certs);
						let docker = new Docker(dockerConfig);
						docker.ping((error, response) => {
							//error is insignificant in this case
							return callback(null, response);
						});
					}, (error, fastestNodeRecord) => {
						//error is insignificant in this case
						if (!fastestNodeRecord) {
							return cb({'message': 'ERROR: unable to connect to a manager node'});
						}
						let dockerConfig = buildDockerConfig(fastestNodeRecord.ip, fastestNodeRecord.dockerPort, certs);
						let docker = new Docker(dockerConfig);
						return cb(null, docker);
					});
				});
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

		function getClusterCertificates(config, callback) {
			if (!config.envCode) {
				return callback({message: 'Missing environment code'});
			}

			let opts = {
				collection: gridfsColl,
				conditions: {}
			};
			opts.conditions['metadata.env.' + config.envCode.toUpperCase()] = config.selectedDriver;
			options.model.findEntries(options.soajs, opts, (error, certs) => {
				checkError(error, callback, () => {
					if (!certs || (certs && certs.length === 0)) {
						return callback({
							code: 741,
							message: 'No certificates for ' + config.envCode + ' environment found'
						});
					}

					options.model.getDb(options.soajs).getMongoDB((error, db) => {
						checkError(error, callback, () => {
							let gfs = Grid(db, options.model.getDb(options.soajs).mongodb);
							let counter = 0;
							return getDockerCerts(certs, gfs, db, callback);
						});
					});
				});
			});
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

    },

    /**
     * Removes a node from a cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    removeNode (options, cb) { //options should include backgroundCB
        /*
		 - get deployer for target node
		 - leave swarm
		 - return success response
		 - get deployer of a manager node in the swarm
		 - remove node
		 */

        let deployerConfig = JSON.parse(JSON.stringify (options.deployerConfig));

        options.deployerConfig.host = options.params.ip;
        options.deployerConfig.port = options.params.dockerPort;
        options.deployerConfig.flags = { targetNode: true };
        lib.getDeployer(options, (error, targetDeployer) => {
            checkError(error, cb, () => {
                targetDeployer.swarmLeave((error) => {
                    checkError(error, cb, () => {
                        //return response and remove node entry from swarm in the background
                		cb(null, true);

                        options.deployerConfig = deployerConfig;
                        lib.getDeployer(options, (error, deployer) => {
                            checkError(error, cb, () => {
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
            checkError(error, cb, () => {
                let node = deployer.getNode(options.params.nodeId);

                //need to inspect node in order to get its current version and pass it to update call
                node.inspect((error, node) => {
                    checkError(error, cb, () => {
                        options.params.version = node.Version.Index;
                        node.update(options.params, (error) => {
                            checkError(error, cb, () => {
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

    },

    /**
     * List nodes in a cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listNodes (options, cb) {

    },

    /**
     * Generates an object that contains all required information about a node
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    buildNodeRecord (options, cb) {

    },

    /**
     * List services/deployments currently available
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listServices (options, cb) {

    },

    /**
     * Creates a new deployment for a SOAJS scaleHAService
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deployService (options, cb) {
		let payload = clone(require(__dirname + '../schemas/service.template.js'));
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
            checkError(error, cb, () => {
                options.params.excludeTasks = true;
                engine.inspectService(options, (error, info) => {
                    checkError(error, cb, () => {
                        let service = deployer.getService(info.service.ID); //NOTE: api does not allow using service name for update ops
                        let update = info.service.Spec;

                        update.version = info.service.Version.Index;
                        update.Mode.Replicated.Replicas = options.params.scale;
                        service.update(update, cb);
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
            checkError(error, cb, () => {
                let service = deployer.getService(options.params.id || options.params.serviceName);
                service.inspect((error, serviceInfo) => {
                    checkError(error, cb, () => {

                        if (options.params.excludeTasks) {
                            return cb(null, { service: serviceInfo });
                        }

                        let params = {
                            filters: { service: [options.serviceName] }
                        };
                        deployer.listTasks(params, (error, serviceTasks) => {
                            checkError(error, cb, () => {
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
            checkError(error, cb, () => {
                let service = deployer.getService(options.params.id || options.params.serviceName);
                service.remove(cb);
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
            checkError(error, cb, () => {
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
        //NOTE: user is expected not to have the task name but not its id. API does not support inspect a task by its name directly
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                let serviceName = options.params.taskName.split('.')[0];
                let taskSlot = options.params.taskName.split('.')[1];
                let params = { filters: { service: [serviceName] } };

                deployer.listTasks(params, (error, tasks) => {
                    checkError(error, cb, () => {
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
    inspectContainer (options, cb) {
        let opts = {
            collection: dockerColl,
            conditions: { recordType: 'node', id: options.params.nodeId }
        };
        options.model.findEntry(options.soajs, opts, (error, node) => {
            checkError(error || !node, cb, () => {
                options.deployerConfig.host = node.ip;
                options.deployerConfig.port = node.dockerPort;
                options.deployerConfig.flags = { targetNode: true };

                lib.getDeployer(options, (error, deployer) => {
                    checkError(error, cb, () => {
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
                checkError(error, cb, () => {
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

    },

    /**
     * Inspect network, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectNetwork (options, cb) {

    },

    /**
     * Create new network, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    createNetwork (options, cb) {

    },

    /**
     * Delete all deployed services
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteServices (options, cb) {

    },

    /** //TODO: review
     * Delete all tasks or pods
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteTasksOrPods (options, cb) {

    }

};

module.exports = engine;
