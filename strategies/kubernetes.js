"use strict";

let K8Api = require('kubernetes-client');
let async = require('async');

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
	getDeployer (options, cb) => {
        let config = clone(options.deployerConfig);
		let kubernetes = {}, kubeConfig;

		getClusterCertificates(config, (error, certs) => {
			checkError(error, cb, () => {
				getManagerNodeDeployer(config, certs, cb);
			});
		});

		function getManagerNodeDeployer(config, certs, cb) {
			if (!config.nodes || config.nodes.length === 0) {
				return cb({message: 'No manager nodes found in this environment\'s deployer'});
			}

			let opts = {
				collection: dockerColl,
				conditions: { recordType: 'node', role: 'manager' }
			};

			options.model.findEntries(soajs, opts, (error, managerNodes) => {
				checkError(error, cb, () => {
					async.detect(managerNodes, (oneNode, callback) => {
						kubeConfig = buildKubeConfig(oneNode.ip, oneNode.kubePort, certs);
						kubeConfig.version = 'v1';
						kubernetes = new K8Api.Core(kubeConfig);
						kubernetes.namespaces.pods.get({}, function (error, response) { //TODO: find better ping call
							//error is insignificant in this case
							return callback(null, response);
						});
					}, (error, fastestNodeRecord) => {
						//error is insignificant in this case
						if (!fastestNodeRecord) {
							return cb({'message': 'ERROR: unable to connect to a manager node'});
						}
						kubeConfig = buildKubeConfig(fastestNodeRecord.ip, fastestNodeRecord.kubePort, certs);
						kubernetes = {};
						kubeConfig.version = 'v1';
						kubernetes.core = new K8Api.Core(kubeConfig);
						kubeConfig.version = 'v1beta1';
						kubernetes.extensions = new K8Api.Extensions(kubeConfig);

						return cb(null, kubernetes);
					});
				});
			});
		}

		function buildKubeConfig(host, port, certs) {
			var kubeConfig = {
				url: 'https://' + host + ':' + port
			};

			var certKeys = Object.keys(certs);
			certKeys.forEach((oneCertKey) => {
				kubeConfig[oneCertKey] = certs[oneCertKey];
			});

			return kubeConfig;
		}

		function getClusterCertificates(config, callback) {
			if (!config.envCode) {
				return callback({message: 'Missing environment code'});
			}

			var opts = {
				collection: gridfsColl,
				conditions: {}
			};
			opts.conditions['metadata.env.' + config.envCode.toUpperCase()] = config.selectedDriver;
			model.findEntries(soajs, opts, (error, certs) => {
				checkError(error, callback, () => {
					if (!certs || (certs && certs.length === 0)) {
						return callback({
							code: 741,
							message: 'No certificates for ' + config.envCode + ' environment found'
						});
					}

					model.getDb(soajs).getMongoDb((error, db) => {
						checkError(error, callback, () => {
							var gfs = Grid(db, model.getDb(soajs).mongodb);
							var counter = 0;
							return getCerts(certs, gfs, db, callback);
						});
					});
				});
			});
		}
	}
};

let engine = {

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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                deployer.core.node.delete({name: options.params.name}, cb);
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
        //Only supports availability for now, role update not included yet
        let updateValue;
        if (options.params.Availability === 'active') updateValue = false;
        else if (options.params.Availability === 'drain') updateValue = true;

        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                deployer.core.node.get({name: options.params.nodeName}, (error, node) => {
                    checkError(error, cb, () => {
                        node.spec.unschedulable = updateValue;
                        deployer.core.nodes.put({name: options.params.nodeName, body: node}, cb);
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
     * Creates a new deployment for a SOAJS scaleService
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deployService (options, cb) {

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
                        let deployment = info.service;
                        deployment.spec.replicas = options.params.scale;
                        deployer.extensions.namespaces.deployments.put({name: options.params.serviceName, body: deployment}, cb);
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
                deployer.extensions.namespaces.deployments.get(options.params.serviceName, (error, deployment) => {
                    checkError(error, cb, () => {

                        if (options.params.excludeTasks) {
                            return cb(null, {service: deployment});
                        }

                        deployer.core.namespaces.pods.get({qs: {labelSelector: 'soajs-app=' + options.params.serviceName}}, (error, podsList) => {
                            checkError(error, cb, () => {
                                return cb(null, {service: deployment, tasks: podsList.items});
                            });
                        });
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
            checkError(error, cb, () => {
                let runningPods = [];
                info.tasks.forEach((onePod) => {
                    if (onePod.metadata.labels['soajs-app'] === options.params.serviceName && onePod.status.phase === 'Running') {
                        runningPods.push(onePod);
                    }
                });

                if (runningPods.length !== options.params.serviceCount) {
                    setTimeout(engine.getServiceComponents.bind(null, options, cb), 500);
                }
                else {
                    info.tasks = runningPods;
                    return cb(null, info);
                }
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

    },

    /**
     * Collects and returns a container logs based on a pre-defined 'tail' value
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getContainerLogs (options, res) {
        lib.getDeployer(options, (error, deployer) => {
            if (error) {
                options.soajs.log.error(error);
                return options.res.jsonp(options.soajs.buildResponse({code: 774, msg: error.message}));
            }

            let params = {
                name: options.params.taskname, //pod name
                qs: {
                    tailLines: options.params.tail || 400
                }
            };

            deployer.core.namespaces.pods.log(params, (error, logData) => {
                if (error) {
                    options.soajs.log.error(error);
                    return options.res.jsonp(options.soajs.buildResponse({code: 774, msg: error.message}));
                }

                return options.res.jsonp(options.soajs.buildResponse(null, {data: logData}));
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
        async.map(options.params.serviceInfo.tasks, (onePod, callback) => {
            var record = {
                type: options.params.serviceType,
                env: options.soajs.inputmaskData.envCode.toLowerCase(),
                running: true,
                recordType: 'container',
                deployer: options.deployerConfig,
                taskName: onePod.metadata.name,
                serviceName: options.params.serviceInfo.service.metadata.name
            };

            return callback(null, record);
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
        async.each(options.params.serviceInfo.tasks, (onePod, callback) => {
            let found, podName = onePod.metadata.name;
            for (let i = 0; i < options.params.dockerRecords.length, i++) {
                found = (options.params.dockerRecords[i].taskName === podName);
                if (found) break;
            }

            if (!found) {
                newInstances.push(onePod);
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
            let found, podName;
            for (let i = 0; i < options.params.serviceInfo.tasks.length; i++) {
                podName = options.params.serviceInfo.tasks[i].metadata.name;
                found = (podName === oneRecord.taskName);
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

    /** //TODO: review
     * Create a kubernetes service in order to expose port or domain name, strategy in this case is restricted to kubernetes
     * NOTE: can be merged with deployService (recommended)
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    createKubeService (options, cb) {

    },

    /** //TODO: review
     * List kubernetes services, strategy in this case is restricted to kubernetes
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listKubeServices (options, cb) {

    },

    /** //TODO: review
     * Delete kubernetes service, strategy in this case is restricted to kubernetes
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteKubeService (options, cb) {

    },

    /**
     * Delete all deployed SOAJS services
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

    },

	/**
     * Get the latest version of a deployed service
     * Returns integer: service version
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getLatestVersion (options, cb) {

    },

    /**
     * Get the domain/host name of a deployed service (per version)
     * Sample response: {"1":"DOMAIN","2":"DOMAIN"}
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getServiceHost (options, cb) {

    },

    /**
     * Get the domain/host names of controllers per environment for all environments
     * {"dev":{"1":"DOMAIN","2":"DOMAIN"}}
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getControllerEnvHost (options, cb) {

    }

};

module.exports = engine;
