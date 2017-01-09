/*jshint esversion: 6 */

"use strict";

let K8Api = require('kubernetes-client');
let async = require('async');
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
     * List nodes in a cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listNodes (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                deployer.core.nodes.get({}, (error, res) => {
                    checkError(error, 521, cb, () => {
                        return cb(null, res);
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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                engine.listNodes(options, (error, nodeList) => {
                    checkError(error, 521, cb, () => {
                        async.detect(nodeList.items, (oneNode, callback) => {
                            for (var i = 0; i < oneNode.status.addresses.length; i++) {
                                if (oneNode.status.addresses[i].type === 'LegacyHostIP') {
                                    return callback(oneNode.status.addresses[i].address === soajs.inputmaskData.host);
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
                        return cb(null, res);
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
                                return cb(null, res);
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
        let template = clone(require(__dirname + '../schemas/kubernetes/service.template.js'));
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
                "soajs-app": serviceName
            }
            kubernetesServiceParams.spec.ports.port = 80;
            kubernetesServiceParams.spec.ports.targetPort = 80;
            kubernetesServiceParams.spec.ports.nodePort = options.soajs.inputmaskData.exposedPort;
        }
        //service params if deploying a container a container
        else if (options.context.origin === 'controller') {
            kubernetesServiceParams = template.service;
            kubernetesServiceParams.metadata.name = serviceName + '-service';
            kubernetesServiceParams.spec.selector = {
                "soajs-app": "soajs-service"
            }
            kubernetesServiceParams.spec.ports.port = 4000;
            kubernetesServiceParams.spec.ports.targetPort = 4000;
        }

        //fill deployment parameters
        let deploymentParams = template.deployment;
        deploymentParams.metadata.name = serviceName;
        deploymentParams.metadata.labels = {
            "soajs.service": options.context.dockerParams.name,
            "soajs.env": options.context.dockerParams.env
        }
        deploymentParams.spec.replicas = soajs.inputmaskData.haCount;
        deploymentParams.spec.selector.matchLabels = {
            "soajs-app": serviceName
        }
        deploymentParams.spec.template.metadata.name = serviceName;
        deploymentParams.spec.template.metadata.labels = {
            "soajs-app": serviceName
        }
        deploymentParams.spec.spec.containers[0].name = serviceName;
        deploymentParams.spec.spec.containers[0].image = soajs.inputmaskData.imagePrefix + '/' + ((options.context.origin === 'service' || options.context.origin === 'controller') ? options.config.images.services : options.config.images.nginx);
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

        lib.getDeployer(soajs, deployerConfig, model, function (error, deployer) {
            checkError(error, 520, cb, () => {
                if (Object.keys(kubernetesServiceParams).length > 0) {
                    options.params = {body: kubernetesServiceParams};
                    engine.createKubeService(options, (error) => {
                        checkError(error, 525, cb, () => {
                            soajs.log.debug('Deployer params: ' + JSON.stringify (deploymentParams));
                            deployer.extensions.namespaces.deployments.post({body: deploymentParams}, (error, res) => {
                                checkError(error, 526, cb, () => {
                                    return cb(null, res);
                                });
                            });
                        });
                    });
                }
                else {
                    soajs.log.debug('Deployer params: ' + JSON.stringify (haDeploymentParams));
                    deployer.extensions.namespaces.deployments.post({body: haDeploymentParams}, (error, res) => {
                        checkError(error, 526, cb, () => {
                            return cb(null, res);
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
                deployer.extensions.namespaces.deployments.put({name: options.params.serviceName, body: deployment}, (error, res) => {
                    checkError(error, 527, cb, () => {
                        return cb(null, res);
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
                deployer.extensions.namespaces.deployments.get(options.params.serviceName, (error, deployment) => {
                    checkError(error, 528, cb, () => {
                        if (options.params.excludeTasks) {
                            return cb(null, {service: deployment});
                        }

                        deployer.core.namespaces.pods.get({qs: {labelSelector: 'soajs-app=' + options.params.serviceName}}, (error, podsList) => {
                            checkError(error, 529, cb, () => {
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
            checkError(error, 529, cb, () => {
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
                                                                                            labelSelector: 'soajs-app=' + options.serviceName
                                                                                        }
                                                                                    };
                                                                                    engine.deletePods(options, (error) => {
                                                                                        checkError(error, 539, cb, () => {
                                                                                            soajs.log.debug('Pods of ' + options.serviceName + ' deleted successfully');
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
                            setTimeout(function () {
                                return ensureDeployment(deployer, callback);
                            }, 500);
                        }
                    });
                });
            }

            function ensureReplicaSet(deployer, requestOptions, callback) {
                options.requestOptions = requestOptions;
                engine.getReplicaSet(opyions, function (error, replicaSet) {
                    if (error) {
                        return callback(error);
                    }

                    if (!replicaSet) {
                        return callback(null, true)
                    }

                    if (replicaSet.spec.replicas === 0) {
                        return callback(null, true)
                    }
                    else {
                        setTimeout(function () {
                            return ensureReplicaSet(deployer, requestOptions, callback);
                        }, 500);
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
            labelSelector: 'soajs-app=' + options.serviceName
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
                return cb(error, body);
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
        }
        request.put(options.requestOptions, function (error, response, body) {
            checkError(error, 531, cb, () => {
                return cb(error, body);
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
            checkError(error, 520, cb, () => {
                options.requestOptions.ca = deployer.extensions.requestOptions.ca;
                options.requestOptions.cert = deployer.extensions.requestOptions.cert;
                options.requestOptions.key = deployer.extensions.requestOptions.key;
                return options;
            });
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
                        return cb(null, res);
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
                deployer.extensions.namespaces.deployments.get(options.params, (error, res) => {
                    checkError(error, 536, cb, () => {
                        return cb(null, res);
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
                        return cb(null, res);
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
                       return cb(null, res);
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
                        return cb(null, res);
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
                        return cb(null, res);
                    });
                });
            });
        });
    }

};

module.exports = engine;
