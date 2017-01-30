/*jshint esversion: 6 */

"use strict";

const K8Api = require('kubernetes-client');
const async = require('async');
const request = require('request');

const utils = require('../utils/utils.js');
const errorFile = require('../utils/errors.js');

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

const lib = {
    getDeployer(options, cb) { //TODO: revert to certificates approach
        let kubernetes = {};
        let kubeProxyURL = process.env.SOAJS_KUBE_PROXY_URL || 'http://127.0.0.1';
        let kubeProxyPort = process.env.SOAJS_KUBE_PROXY_PORT || 8001;

        let kubeConfig = { url: kubeProxyURL + ':' + kubeProxyPort };

        kubeConfig.version = 'v1';
        kubernetes.core = new K8Api.Core(kubeConfig);

        kubeConfig.version = 'v1beta1';
        kubernetes.extensions = new K8Api.Extensions(kubeConfig);

        return cb(null, kubernetes);
    },

    ping (options, cb) {

    },

    buildNodeRecord (options) {
        let record = {
            id: options.node.metadata.name, //setting id = name | kuberenetes api depends on name unlike swarm
            hostname: options.node.metadata.name,
            ip: getIP(options.node.status.addresses),
            version: options.node.metadata.resourceVersion,
            state: getStatus(options.node.status.conditions),
            spec: {
                role: 'manager', //TODO: set to manager by default for now, needs revision
                availability: getStatus(options.node.status.conditions)
            },
            resources: {
                cpus: options.node.status.capacity.cpu,
                memory: calcMemory(options.node.status.capacity.memory)
            }
        };

        return record;

        function calcMemory (memory) {
			let value = memory.substring(0, options.node.status.capacity.memory.length - 2);
			let unit = memory.substring(memory.length - 2);

			if (unit === 'Ki') value += '000';
			else if (unit === 'Mi') value += '000000';

			return parseInt(value);
		}

		function getIP (addresses) {
			let ip = '';
			for (let i = 0; i < addresses.length; i++) {
				if (addresses[i].type === 'LegacyHostIP') {
					ip = addresses[i].address;
                    break;
				}
			}

			return ip;
		}

        function getStatus (statuses) {
            let status = 'unreachable'; //TODO: verify value
            for (let i = 0; i < statuses.length; i++) {
                if (statuses[i].type === 'Ready') {
                    status = ((statuses[i].status) ? 'ready' : 'unreachable');
                    break;
                }
            }

            return status;
        }
    },

    buildDeploymentRecord (options) {
        let record = {
            id: options.deployment.metadata.name, //setting id = name
            version: options.deployment.metadata.resourceVersion,
            name: options.deployment.metadata.name,
            labels: options.deployment.metadata.labels,
            env: [], //TODO: add
            ports: [], //TODO
            tasks: []
        };

        return record;
    },

    buildPodRecord (options) {
        let record = {
            id: options.pod.metadata.name,
            version: options.pod.metadata.resourceVersion,
            name: options.pod.metadata.name,
            ref: {
                service: {
                    name: options.pod.metadata.labels['soajs.service.label'],
                    id: options.pod.metadata.labels['soajs.service.label']
                },
                node: {
                    id: options.pod.spec.nodeName
                },
                container: {
                    id: options.pod.status.containerStatuses[0].containerID.split('//')[1] //only one container runs per pod in the current setup
                }
            },
            status: {
                ts: options.pod.metadata.creationTimestamp,
                state: options.pod.status.phase,
                message: options.pod.status.message
            }
        };

        return record;
    },

    buildEnvList (options) {
        let envs = [];
        options.envs.forEach((oneVar) => {
            envs.push({ name: oneVar.split('=')[0], value: oneVar.split('=')[1] });
        });

        envs.push({
            name: 'SOAJS_HA_NAME',
            valueFrom: {
                fieldRef: {
                    fieldPath: 'metadata.name'
                }
            }
        });

        return envs;
    }
};

const engine = {

    /**
     * Inspect a node in the cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectNode (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.namespaces.node.get({name: options.params.id}, (error, node) => {
                    checkError(error, 655, cb, () => {
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
            checkError(error, 520, cb, () => {
                deployer.core.nodes.get({}, (error, nodeList) => {
                    checkError(error, 521, cb, () => {
                        async.map(nodeList.items, (oneNode, callback) => {
                            return callback(null, lib.buildNodeRecord({ node: oneNode }));
                        }, cb);
                    });
                });
            });
        });
    },

    /**
     * Adds a node to a cluster
     * todo: should be deprecated
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
     listServices (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.env.code=' + options.params.env
                };

                deployer.extensions.namespaces.deployments.get({qs: filter}, (error, deploymentList) => {
                    checkError(error, 536, cb, () => {
                        async.map(deploymentList.items, (oneDeployment, callback) => {
                            let record = lib.buildDeploymentRecord({ deployment: oneDeployment });

                            if (options.params && options.params.excludeTasks) {
                                return callback(null, record);
                            }

                            filter = {
                                labelSelector: 'soajs.service.label=' + record.name
                            };
                            deployer.core.namespaces.pods.get({qs: filter}, (error, podsList) => {
                                if (error) {
                                    return callback(error);
                                }

                                async.map(podsList.items, (onePod, callback) => {
                                    return callback(null, lib.buildPodRecord({ pod: onePod }));
                                }, (error, pods) => {
                                    if (error) {
                                        return callback(error);
                                    }

                                    record.tasks = pods;
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
     * Adds a node to a cluster
     * todo: should be deprecated
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    addNode (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                engine.listNodes(options, (error, nodeList) => {
                    checkError(error, 521, cb, () => {
                        async.detect(nodeList.items, (oneNode, callback) => {
                            for (var i = 0; i < oneNode.status.addresses.length; i++) {
                                if (oneNode.status.addresses[i].type === 'LegacyHostIP') {
                                    return callback(oneNode.status.addresses[i].address === options.soajs.inputmaskData.host);
                                }
                            }

                            return callback(false);
                        }, (targetNodeRecord) => {
                            if (!targetNodeRecord) {
                                return cb({
                                    "error": "error",
                                    "code": 522,
                                    "msg": errorFile[522]
                                });
                            }

                            var nodeInfo = {
                                role: targetNodeRecord.role,
                                name: targetNodeRecord.name
                            };

                            return cb(null, targetNodeRecord, nodeInfo);
                        });
                    });
                });
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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.node.delete({name: options.params.id}, (error, res) => {
                    checkError(error, 523, cb, () => {
                        return cb(null, true);
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
        //Only supports availability for now, role update not included yet
        let unschedulable;
        if (options.params.availability === 'active') unschedulable = false;
        else if (options.params.availability === 'drain') unschedulable = true;

        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.node.get({name: options.params.id}, (error, node) => {
                    checkError(error, 655, cb, () => {
                        node.spec.unschedulable = unschedulable;
                        deployer.core.nodes.put({name: options.params.id, body: node}, (error, res) => {
                            checkError(error, 524, cb, () => {
                                return cb(null, true);
                            });
                        });
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
        options.params.variables.push('SOAJS_DEPLOY_HA=kubernetes');

        let service = utils.cloneObj(require(__dirname + '/../schemas/kubernetes/service.template.js'));
        service.metadata.name = options.params.name + '-service';
        service.metadata.labels = options.params.labels;
        service.spec.selector = { 'soajs.service.label': options.params.labels['soajs.service.label'] };

        if (options.params.ports && options.params.ports.length > 0) {
            options.params.ports.forEach((onePortEntry, portIndex) => {
                let portConfig = {
                    protocol: 'TCP',
                    name: 'port-' + portIndex,
                    port: onePortEntry.target,
                    targetPort: onePortEntry.target
                };

                if (onePortEntry.isPublished) {
                    if (!service.spec.type || service.spec.type !== 'NodePort') {
                        service.spec.type = 'NodePort';
                    }
                    portConfig.NodePort = onePortEntry.published;
                    portConfig.name = 'published-' + portConfig.name;
                }

                service.spec.ports.push(portConfig);
            });
        }

        let payload = {};
        if (options.params.replication.mode === 'replicated') {
            payload = utils.cloneObj(require(__dirname + '/../schemas/kubernetes/deployment.template.js'));
            options.params.type = 'deployment';
        }
        else if (options.params.replication.mode === 'global') {
            payload = utils.cloneObj(require(__dirname + '/../schemas/kubernetes/daemonset.template.js'));
            options.params.type = 'daemonset';
        }

        payload.metadata.name = options.params.name;
        payload.metadata.labels = options.params.labels;

        if (options.params.type === 'deployment') {
            payload.spec.replicas = options.params.replicaCount;
        }

        payload.spec.selector.matchLabels = { 'soajs.service.label': options.params.labels['soajs.service.label'] };
        payload.spec.template.metadata.name = options.params.labels['soajs.service.name'];
        payload.spec.template.metadata.labels = options.params.labels;
        //NOTE: only one container is being set per pod
        payload.spec.template.spec.containers[0].name = options.params.labels['soajs.service.name'];
        payload.spec.template.spec.containers[0].image = options.params.image;
        payload.spec.template.spec.containers[0].workingDir = ((options.params.containerDir) ? options.params.containerDir : '');
        payload.spec.template.spec.containers[0].command = [options.params.cmd[0]];
        payload.spec.template.spec.containers[0].args = options.params.cmd.splice(1);
        payload.spec.template.spec.containers[0].env = lib.buildEnvList({ envs: options.params.variables });

        //TODO: support voluming

        if (process.env.SOAJS_TEST) {
            //using lightweight image and commands to optimize travis builds
            //the purpose of travis builds is to test the dashboard api, not the containers
            payload.spec.template.spec.containers[0].image = 'alpine:latest';
            payload.spec.template.spec.containers[0].command = ['sh'];
            payload.spec.template.spec.containers[0].args = ['-c', 'sleep 36000'];
        }

        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 540, cb, () => {
                deployer.core.namespaces.services.post({ body: service }, (error) => {
                    checkError(error, 525, cb, () => {
                        deployer.extensions.namespaces[options.params.type].post({ body: payload }, (error) => {
                            checkError(error, 526, cb, cb.bind(null, null, true));
                        });
                    });
                });
            });
        });
    },

    /**
     * Scales a deployed services up/down depending on current replica count and new one
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    scaleService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployments.get({name: options.params.id}, (error, deployment) => {
					checkError(error, 536, cb, () => {
						deployment.spec.replicas = options.params.scale;
						deployer.extensions.namespaces.deployments.put({name: options.params.id, body: deployment}, (error, result) => {
                            checkError(error, 527, cb, cb.bind(null, null, true));
                        });
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
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployment.get({name: options.params.id}, (error, deployment) => {
                    checkError(error, 536, cb, () => {
                        deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_REDEPLOY_TRIGGER', value: 'true' });
                        deployer.extensions.namespaces.deployments.put({ name: options.params.id, body: deployment }, (error) => {
                            checkError(error, 527, cb, cb.bind(null, null, true));
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
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployment.get(options.params.id, (error, deployment) => {
                    checkError(error, 528, cb, () => {
                        let deploymentRecord = lib.buildDeployerOptions({ deployment });

                        if (options.params.excludeTasks) {
                            return cb(null, { deployment: deploymentRecord });
                        }

                        deployer.core.namespaces.pods.get({qs: {labelSelector: 'soajs.service.label=' + options.params.id}}, (error, podList) => {
                            checkError(error, 529, cb, () => {
                                async.map(podList.items, (onePod, callback) => {
                                    return callback(null, lib.buildPodRecord({ pod: onePod }));
                                }, (error, pods) => {
                                    return cb(null, { service: deploymentRecord, tasks: pods });
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
        //TODO: implement
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
            checkError(error, 520, cb, () => {
                var body = {
                    gracePeriodSeconds: 0
                };

                var requestOptions = {
                    uri: deployer.extensions.url + deployer.extensions.path + '/namespaces/default/replicasets',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    json: true,
                    ca: deployer.extensions.requestOptions.ca,
                    cert: deployer.extensions.requestOptions.cert,
                    key: deployer.extensions.requestOptions.key
                };
                options.params = {name: options.serviceName};
                engine.getDeployment(options, (error, deployment) => { //TODO: fix
                    checkError(error, 528, cb, () => {
                        deployment.spec.replicas = 0;
                        options.params = {name: options.serviceName, body: deployment};
                        engine.scaleService(options, (error) => {
                            checkError(error, 527, cb, () => {
                                ensureDeployment(deployer, (error) => {
                                    options.requestOptions = utils.cloneObj(requestOptions);
                                    engine.getReplicaSet(options, (error, replicaSet) => {
                                        checkError(error, 530, cb, () => {
                                            options.requestOptions = utils.cloneObj(requestOptions);
                                            engine.updateReplicaSet(options, replicaSet, {replicas: 0}, (error) => {
                                                checkError(error, 531, cb, () => {
                                                    ensureReplicaSet(deployer, utils.cloneObj(requestOptions), (error) => {
                                                        checkError(error, 530, cb, () => {
                                                            options.requestOptions = utils.cloneObj(requestOptions);
                                                            options.params = {rsName: replicaSet.metadata.name};
                                                            engine.deleteReplicaSet(options, (error) => {
                                                                checkError(error, 532, cb, () => {
                                                                    getDeleteKubeService(deployer, (error) => {
                                                                        checkError(error, 534, cb, () => {
                                                                            options.params = {name: options.serviceName, body: body};
                                                                            engine.deleteDeployment(options, (error) => {
                                                                                checkError(error, 535, cb, () => {
                                                                                    cb(null, true);
                                                                                    //delete pods in background
                                                                                    options.params = {
                                                                                        qs: {
                                                                                            labelSelector: 'soajs.service.label=' + options.serviceName
                                                                                        }
                                                                                    };
                                                                                    engine.deletePods(options, (error) => {
                                                                                        checkError(error, 539, cb, () => {
                                                                                            return cb(null, true);
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            function ensureDeployment(deployer, callback) {
                options.params = {name: options.serviceName};
                engine.getDeployment(options, (error, deployment) => { //TODO: fix
                    checkError(error, 536, cb, () => {
                        if (deployment.spec.replicas === 0) {
                            return callback(null, true);
                        }
                        else {
                            setTimeout(ensureDeployment.bind(null, deployer, callback), 500);
                        }
                    });
                });
            }

            function ensureReplicaSet(deployer, requestOptions, callback) {
                options.requestOptions = requestOptions;
                engine.getReplicaSet(options, function (error, replicaSet) {
                    if (error) {
                        return callback(error);
                    }

                    if (!replicaSet) {
                        return callback(null, true);
                    }

                    if (replicaSet.spec.replicas === 0) {
                        return callback(null, true);
                    }
                    else {
                        setTimeout(ensureReplicaSet.bind(null, deployer, requestOptions, callback), 500);
                    }
                });
            }

            function getDeleteKubeService(deployer, callback) {
                if (options.serviceType === 'controller' || options.serviceType === 'nginx') {
                    var kubeServiceName = options.serviceName + '-service';
                    options.params = {name: kubeServiceName};
                    engine.listKubeServices(options, function (error, service) {
                        checkError(error, 533, cb, () => {
                            options.params = {name: kubeServiceName, body: body};
                            engine.deleteKubeService(options, callback);
                        });
                    });
                }
                else {
                    return callback(null, true);
                }
            }


        });
    },

    /**
	 * Gathers and returns information about a specified pod
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
     inspectTask (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 540, cb, () => {
                deployer.core.namespaces.pods.get({ name: options.params.taskId }, (error, pod) => {
                    checkError(error, 656, cb, () => {
                        return cb(null, lib.buildPodRecord({ pod }));
                    });
                });
            });
        });
     },

    /**
     * Returns a kubernetes replica set
     * @param options
     * @param cb
     */
    getReplicaSet(options, cb) {
        options.requestOptions = engine.injectCerts(options);
        options.requestOptions.qs = {
            labelSelector: 'soajs.service.label=' + options.serviceName
        };

        request.get(options.requestOptions, (error, response, body) => {
            checkError(error, 530, cb, () => {
                var rs = ((body && body.items && body.items[0]) ? body.items[0] : null); //replicaset list must contain only one item in this case
                return cb(error, rs);
            });
        });
    },

    /**
     * Deletes a kubernetes replica set
     * @param options
     * @param cb
     */
    deleteReplicaSet(options, cb) {
        options.requestOptions = engine.injectCerts(options);
        options.requestOptions.uri += '/' + options.params.rsName;
        options.requestOptions.body = {
            gracePeriodSeconds: 0
        };

        request.delete(options.requestOptions, (error, response, body) => {
            checkError(error, 532, cb, () => {
                return cb(error, true);
            });
        });
    },

    /**
     * updates a kubernetes replica set
     * @param options
     * @param cb
     */
    updateReplicaSet(options, cb) {
        options.requestOptions = engine.injectCerts(options);
        options.requestOptions.uri += '/' + options.replicaSet.metadata.name;
        options.requestOptions.body.replicaSet.spec = {
            replicas : options.params.replicas
        };
        request.put(options.requestOptions, function (error, response, body) {
            checkError(error, 531, cb, () => {
                return cb(error, true);
            });
        });
    },

    /**
     * Injects the certificates
     * @param options
     * @returns {*}
     */
    injectCerts (options) {
        lib.getDeployer(options, (error, deployer) => {
            if (error) {
                return null;
            }

            options.requestOptions.ca = deployer.extensions.requestOptions.ca;
            options.requestOptions.cert = deployer.extensions.requestOptions.cert;
            options.requestOptions.key = deployer.extensions.requestOptions.key;
            return options;
        });
    },

    /**
     * Deletes a kubernetes pod
     * @param options
     * @param cb
     */
    deletePod (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.namespaces.pods.delete(options.params, (error, res) => {
                    checkError(error, 539, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    },

    /**
     * Returns a kubernetes deployment //TODO: delete, use inspectService() instead
     * @param options
     * @param cb
     */
    // getDeployment (options, cb) {
    //     lib.getDeployer(options, (error, deployer) => {
    //         checkError(error, 520, cb, () => {
    //             deployer.extensions.namespaces.deployments.get(options.params, (error, deployment) => {
    //                 checkError(error, 536, cb, () => {
    //                     let service = {
    //                         id: deployment.metadata.uid,
    //                         version: deployment.metadata.resourceVersion,
    //                         name: deployment.metadata.name,
    //                         service: {
    //                             env: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.env.code'] : null),
    //                             name: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.name'] : null),
    //                             version: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.version'] : null)
    //                         },
    //                         ports: []
    //                     };
    //                     return cb(null, service);
    //                 });
    //             });
    //         });
    //     });
    // },

    /**
     * Deletes a kubernetes deployment
     * @param options
     * @param cb
     */
    deleteDeployment (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployments.delete(options.params, (error, res) => {
                    checkError(error, 535, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    },

    /**
     * Collects and returns a container logs based on a pre-defined 'tail' value
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getContainerLogs (options, cb) {

        let res = options.res;
        delete options.res;
        lib.getDeployer(options, (error, deployer) => {
            check(error, 520, () => {

                let params = {
                    name: options.params.taskId, //pod name
                    qs: {
                        tailLines: options.params.tail || 400
                    }
                };

                deployer.core.namespaces.pods.log(params, (error, logs) => {
                    check(error, 537, () => {
                        return res.jsonp(options.soajs.buildResponse(null, { data: logs }));
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

    /** //TODO: review
     * Create a kubernetes service in order to expose port or domain name, strategy in this case is restricted to kubernetes
     * NOTE: can be merged with deployService (recommended)
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    createKubeService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.namespaces.services.post(options.params, (error, res) => {
                   checkError(error, 525, cb, () => {
                       return cb(null, res.metadata.uid);
                    });
                });
            });
        });
    },

    /** //TODO: review
     * List kubernetes services, strategy in this case is restricted to kubernetes
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listKubeServices (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.namespaces.services.get(options.params, (error, res) => {
                    checkError(error, 533, cb, () => {
                        //normalize response
                        let record = {};
                        async.map(services, (oneService, callback) => {
                            record = {
                                id: oneService.metadata.uid,
                                version: oneService.metadata.resourceVersion,
                                name: oneService.metadata.name,
                                service: {
                                    name: ((oneService.metadata.labels) ? oneService.metadata.labels['soajs.service.name'] : null),
                                    env: ((oneService.metadata.labels) ? oneService.metadata.labels['soajs.env.code'] : null)
                                }
                                //TODO
                            };

                            return callback(null, record);
                        }, cb);
                    });
                });
            });
        });
    },

    /** //TODO: review
     * Delete kubernetes service, strategy in this case is restricted to kubernetes
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteKubeService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.namespaces.services.delete(options.params, (error, res) => {
                    checkError(error, 534, cb, () => {
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
		lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.env.code=' + options.params.env + ', soajs.env.service.name=' + options.params.serviceName
                };
                let latestVersion = 0;
                deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
                    checkError(error, 536, cb, () => {
                        deploymentList.items.forEach((oneDeployment) => {
                            if (oneDeployment.metadata.labels['soajs.service.version'] > latestVersion) {
                                latestVersion = oneDeployment.metadata.labels['soajs.service.version'];
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
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.env.code=' + options.params.env + ', soajs.service.name=' + options.params.serviceName + ', soajs.service.version=' + options.params.serviceVersion
                };

                deployer.core.services.get({qs: filter}, (error, serviceList) => {
                    checkError(error, 600, cb, () => {
                        //only one service must match the filter, therefore serviceList will contain only one item
                        return cb(null, serviceList.metadata.name);
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
        //TODO
	}
};

module.exports = engine;
