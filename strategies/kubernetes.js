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

let lib = {
    getDeployer(options, cb) {
        let kubernetes = {};
        let kubeProxyURL = process.env.SOAJS_KUBE_PROXY_URL || '127.0.0.1';
        let kubeProxyPort = process.env.SOAJS_KUBE_PROXY_PORT || 8001;

        let kubeConfig = { url: kubeProxyURL + ':' + kubeProxyPort };

        kubeConfig.version = 'v1';
        kubernetes.core = new K8Api.Core(kubeConfig);

        kubeConfig.version = 'v1beta1';
        kubernetes.extensions = new K8Api.Extensions(kubeConfig);

        return cb(null, kubernetes);
    }
};

let engine = {

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
                //TODO: implement



                //TODO: update to match kubernetes api response
                // let record = {
                //     id: node.ID,
                //     hostname: node.Description.Hostname,
                //     ip: '',
                //     version: node.Version.Index,
                //     role: node.Spec.Role,
                //     state: '', //TODO: add state value
                //     spec: {
                //         role: node.Spec.Role,
                //         availability: node.Spec.Availability
                //     },
                //     resources: {
                //         cpus: node.Description.Resources.NanoCPUs / 1000000000,
                //         memory: node.Description.Resources.MemoryBytes
                //     }
                // };

                // if (record.role === 'manager') {
                //     record.managerStatus = {
                //         leader: node.ManagerStatus.Leader,
                //         reachability: node.ManagerStatus.Reachability,
                //         address: node.ManagerStatus.Addr
                //     };
                // }
                //
                // return cb(null, record);
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
                deployer.core.nodes.get({}, (error, nodes) => {
                    checkError(error, 521, cb, () => {
                        //normalize response
                        let record = {};
                        async.map(nodes, (oneNode, callback) => {
                            record = {
                                id: oneNode.metadata.providerID,
                                hostname: oneNode.metadata.name,
                                ip: '', //only set the ip address of the node
                                version: oneNode.metadata.resourceVersion,
                                role: '', //TODO: add role value, set to 'manager' or 'worker'
                                state: '', //TODO: add state value, set to 'ready' or ?
                                spec: {
                                    //todo: find out the two specs
                                    role: '',
                                    availability: ''
                                },
                                resources: oneNode.status.capacity
                            };

                            //TODO: add manager status if this node is a manager
                            //NOTE: kubernetes calls mnanager nodes 'masters'
                            // if (record.role === 'manager') {
							// 	record.managerStatus = {
							// 		leader: node.ManagerStatus.Leader, if yes, set value to true (boolean)
							// 		reachability: node.ManagerStatus.Reachability, if 'master', set value to 'manager'
							// 		address: node.ManagerStatus.Addr, ip_address:port
							// 	};
							// }
                            return callback(null, record);
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
    removeNode (options, cb) { //options should include backgroundCB
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.node.delete({name: options.params.name}, (error, res) => {
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
        let updateValue;
        if (options.params.Availability === 'active') updateValue = false;
        else if (options.params.Availability === 'drain') updateValue = true;

        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.node.get({name: options.params.nodeName}, (error, node) => {
                    checkError(error, cb, () => {
                        node.spec.unschedulable = updateValue;
                        deployer.core.nodes.put({name: options.params.nodeName, body: node}, (error, res) => {
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
        let kubernetesServiceParams = {};
        let template = utils.cloneObj(require(__dirname + '../schemas/kubernetes/service.template.js'));
        let serviceName = options.context.dockerParams.env + '-' + options.context.dockerParams.name;
        //service params if deploying a service or a controller
        if (options.context.origin === 'service' || options.context.origin === 'controller') {
            serviceName += '-v' + options.soajs.inputmaskData.version;
        }
        //fill service params
        //service params if deploying Nginx
        if (options.context.origin === 'nginx') {
            kubernetesServiceParams = template.service;
            kubernetesServiceParams.metadata.name = serviceName + '-service';
            kubernetesServiceParams.spec.type = "NodePort";
            kubernetesServiceParams.spec.selector = {
                "soajs.service.label": serviceName
            };
            kubernetesServiceParams.spec.ports.port = 80;
            kubernetesServiceParams.spec.ports.targetPort = 80;
            kubernetesServiceParams.spec.ports.nodePort = options.soajs.inputmaskData.exposedPort;
        }
        //service params if deploying a container a container
        else if (options.context.origin === 'controller') {
            kubernetesServiceParams = template.service;
            kubernetesServiceParams.metadata.name = serviceName + '-service';
            kubernetesServiceParams.spec.selector = {
                "soajs.service.label": "soajs-service"
            };
            kubernetesServiceParams.spec.ports.port = 4000;
            kubernetesServiceParams.spec.ports.targetPort = 4000;
        }

        //fill deployment parameters
        let deploymentParams = template.deployment;
        deploymentParams.metadata.name = serviceName;
        deploymentParams.metadata.labels = {
            "soajs.service": options.context.dockerParams.name,
            "soajs.env": options.context.dockerParams.env
        };
        deploymentParams.spec.replicas = options.soajs.inputmaskData.haCount;
        deploymentParams.spec.selector.matchLabels = {
            "soajs.service.label": serviceName
        };
        deploymentParams.spec.template.metadata.name = serviceName;
        deploymentParams.spec.template.metadata.labels = {
            "soajs.service.label": serviceName
        };
        deploymentParams.spec.spec.containers[0].name = serviceName;
        deploymentParams.spec.spec.containers[0].image = options.soajs.inputmaskData.imagePrefix + '/' + ((options.context.origin === 'service' || options.context.origin === 'controller') ? options.config.images.services : options.config.images.nginx);
        deploymentParams.spec.spec.containers[0].workingDir = options.config.imagesDir;
        deploymentParams.spec.spec.containers[0].command = options.config.imagesDir;
        deploymentParams.spec.spec.containers[0].args = options.context.dockerParams.Cmd.splice(1);
        deploymentParams.spec.spec.containers[0].env = buildEnvVariables();

        if (process.env.SOAJS_TEST) {
            //using lightweight image and commands to optimize travis builds
            //the purpose of travis builds is to test the dashboard api, not the containers
            deploymentParams.spec.template.spec.containers[0].image = 'alpine:latest';
            deploymentParams.spec.template.spec.containers[0].command = ['sh'];
            deploymentParams.spec.template.spec.containers[0].args = ['-c', 'sleep 36000'];
        }

        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                if (Object.keys(kubernetesServiceParams).length > 0) {
                    options.params = {body: kubernetesServiceParams};
                    engine.createKubeService(options, (error) => {
                        checkError(error, 525, cb, () => {
                            // options.soajs.log.debug('Deployer params: ' + JSON.stringify (deploymentParams));
                            deployer.extensions.namespaces.deployments.post({body: deploymentParams}, (error, res) => {
                                checkError(error, 526, cb, () => {
                                    return cb(null, true);
                                });
                            });
                        });
                    });
                }
                else {
                    // options.soajs.log.debug('Deployer params: ' + JSON.stringify (haDeploymentParams));
                    deployer.extensions.namespaces.deployments.post({body: deploymentParams}, (error, res) => {
                        checkError(error, 526, cb, () => {
                            return cb(null, true);
                        });
                    });
                }
            });
        });

        //Build the environment variable
        function buildEnvVariables () {
            var envs = [];
            options.context.dockerParams.variables.forEach(function (oneEnvVar) {
                envs.push({
                    name: oneEnvVar.split('=')[0],
                    value: oneEnvVar.split('=')[1]
                });
            });
            envs.push({ "name": "SOAJS_DEPLOY_HA", "value": "true" });
            envs.push({ "name": "SOAJS_DEPLOY_KUBE", "value": "true" });
            envs.push({
                "name": "SOAJS_KUBE_POD_IP",
                "valueFrom": {
                    "fieldRef": {
                        "fieldPath": "status.podIP"
                    }
                }
            });
            envs.push({
                "name": "SOAJS_KUBE_POD_NAME",
                "valueFrom": {
                    "fieldRef": {
                        "fieldPath": "metadata.name"
                    }
                }
            });

            return envs;
        }

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
                deployer.extensions.namespaces.deployments.get({name: options.params.serviceName}, (error, deployment) => {
					checkError(error, 536, cb, () => {
						deployment.spec.replicas = options.params.scale;
						deployer.extensions.namespaces.deployments.put({name: options.serviceName, body: deployment}, (error, result) => {
                            checkError(error, 527, cb, () => {
                                cb.bind(null, null, result);
                                return (null, true);
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
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployment.get(options.params.serviceName, (error, deployment) => {
                    checkError(error, 528, cb, () => {

                        let service = {
                            id: deploymentmetadata.uid,
                            version: deployment.metadata.resourceVersion,
                            name: deployment.metadata.name,
                            service: {
                                env: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.env.code'] : null),
                                name: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.name'] : null),
                                version: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.version'] : null)
                            },
                            ports: []
                        };

                        if (options.params.excludeTasks) {
                            return cb(null, {service: service});
                        }

                        deployer.core.namespaces.pods.get({qs: {labelSelector: 'soajs.service.label=' + options.params.serviceName}}, (error, podsList) => {
                            checkError(error, 529, cb, () => {
                                async.map(servicePods, (onePod, callback) => {
                                    let pod = {
                                        id: onePod.metadata.uid,
                                        version: onePod.metadata.resourceVersion,
                                        name: service.name + '.' + onePod.metadata.name, //might add extra value later
                                        ref: {
                                            //todo: slot: onePod.Slot,
                                            service: {
                                                name: service.name,
                                                id: onePod.metadata.uid
                                            },
                                            node: {
                                                id: onePod.nodeName
                                            },
                                            container: {
                                                id: onePod.status.containerStatus[0].containerID
                                            }
                                        },
                                        status: {
                                            ts: onePod.metadata.creationTimestamp, //timestamp of the pod creation
                                            state: onePod.status.phase, //current state of the pod, example: running
                                            message: onePod.status.message //current message of the pod, example: started or error,
                                        }
                                    };

                                    return callback(null, pod);
                                }, (error, pods) => {
                                    return cb(null, { service, pods });
                                });

                                return cb(null, {service, pods});
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
            checkError(error, 529, cb, () => {
                let runningPods = [];
                info.tasks.forEach((onePod) => {
                    if (onePod.metadata.labels['soajs.service.label'] === options.params.serviceName && onePod.status.phase === 'Running') {
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
                engine.getDeployment(options, (error, deployment) => {
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
                engine.getDeployment(options, (error, deployment) => {
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
     * Returns a kubernetes deployment
     * @param options
     * @param cb
     */
    getDeployment (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.extensions.namespaces.deployments.get(options.params, (error, deployment) => {
                    checkError(error, 536, cb, () => {
                        let service = {
                            id: deployment.metadata.uid,
                            version: deployment.metadata.resourceVersion,
                            name: deployment.metadata.name,
                            service: {
                                env: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.env.code'] : null),
                                name: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.name'] : null),
                                version: ((deployment.metadata.Labels) ? deployment.metadata.Labels['soajs.service.version'] : null)
                            },
                            ports: []
                        };
                        return cb(null, service);
                    });
                });
            });
        });
    },

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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {

                let params = {
                    name: options.params.taskname, //pod name
                    qs: {
                        tailLines: options.params.tail || 400
                    }
                };

                deployer.core.namespaces.pods.log(params, (error, res) => {
                    checkError(error, 537, cb, () => {
                        return cb(null, res);
                    });
                });
            });
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
            checkError(error, 520, () => {
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
            checkError(error, 520, () => {
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
