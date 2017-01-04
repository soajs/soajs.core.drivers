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
    getDeployer (options, cb) {
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
                        kubernetes.namespaces.pods.get({}, (error, response) => { //TODO: find better ping call
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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                engine.listNodes(options, (error, nodeList) => {
                    checkError(error, cb, function () {
                        async.detect(nodeList.items, (oneNode, callback) => {
                            for (var i = 0; i < oneNode.status.addresses.length; i++) {
                                if (oneNode.status.addresses[i].type === 'LegacyHostIP') {
                                    return callback(oneNode.status.addresses[i].address === soajs.inputmaskData.host);
                                }
                            }

                            return callback(false);
                        }, (targetNodeRecord) => {
                            if (!targetNodeRecord) {
                                return cb({'message': 'ERROR: Could not find node in cluster, aborting ...'});
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
     * Generates an object that contains all required information about a node
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    buildNodeRecord (options, cb) {
        function calcMemory (memory) {
            var value = memory.substring(0, options.node.status.capacity.memory.length - 2);
            var unit = memory.substring(memory.length - 2);

            if (unit === 'Ki') value += '000';
            else if (unit === 'Mi') value += '000000';

            return parseInt(value);
        }

        function getIP (addresses) {
            var ip = '';
            for (var i = 0; i < addresses.length; i++) {
                if (addresses[i].type === 'LegacyHostIP') {
                    ip = addresses[i].address;
                }
            }

            return ip;
        }

        var record = {
            recordType: 'node',
            id: options.node.metadata.uid,
            name: options.node.metadata.name,
            availability: ((!options.node.spec.unschedulable) ? 'active' : 'drained'),
            role: ((options.node.metadata.labels['kubeadm.alpha.kubernetes.io/role'] === 'master') ? 'manager' : 'worker'),
            ip: getIP (options.node.status.addresses),
            port: options.node.status.daemonEndpoints.kubeletEndpoint.Port,
            resources: {
                cpuCount: options.node.status.capacity.cpu,
                memory: calcMemory(options.node.status.capacity.memory)
            },
            tokens: options.managerNodes[0].tokens || {}
        };

        return cb(record);
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
            checkError(error, cb, function () {
                if (Object.keys(kubernetesServiceParams).length > 0) {
                    options.params = {body: kubernetesServiceParams};
                    engine.createKubeService(options, (error) => {
                        checkError(error, cb, function () {
                            soajs.log.debug('Deployer params: ' + JSON.stringify (deploymentParams));
                            deployer.extensions.namespaces.deployments.post({body: deploymentParams}, cb);
                        });
                    });
                }
                else {
                    soajs.log.debug('Deployer params: ' + JSON.stringify (haDeploymentParams));
                    deployer.extensions.namespaces.deployments.post({body: haDeploymentParams}, cb);
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
            checkError(error, cb, () => {
                deployer.extensions.namespaces.deployments.put({name: options.params.serviceName, body: deployment}, cb);
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


    getDeployments (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                deployer.extensions.namespaces.deployments.get(options.params, cb);
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
            checkError(error, cb, function () {
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
                engine.getDeployments(options, (error, deployment) => {
                    checkError(error, cb, () => {
                        deployment.spec.replicas = 0;
                        options.params = {name: options.serviceName, body: deployment};
                        engine.scaleService(options, (error) => {
                            checkError(error, cb, () => {
                                ensureDeployment(deployer, (error) => {
                                    checkError(error, cb, function () {
                                        options.requestOptions = utils.cloneObj(requestOptions);
                                        engine.getReplicaSet(options, (error, replicaSet) => {
                                            checkError(error, cb, () => {
                                                options.requestOptions = utils.cloneObj(requestOptions);
                                                engine.updateReplicaSet(options, replicaSet, {replicas: 0}, (error) => {
                                                    checkError(error, cb, function () {
                                                        ensureReplicaSet(deployer, utils.cloneObj(requestOptions), (error) => {
                                                            checkError(error, cb, () => {
                                                                options.requestOptions = utils.cloneObj(requestOptions);
                                                                options.params = {rsName: replicaSet.metadata.name};
                                                                engine.deleteReplicaSet(options, (error) => {
                                                                    checkError(error, cb, () => {
                                                                        getDeleteKubeService(deployer, (error) => {
                                                                            checkError(error, cb, () => {
                                                                                options.params = {name: options.serviceName, body: body};
                                                                                engine.deleteDeployment(options, (error) => {
                                                                                    checkError(error, cb, () => {

                                                                                        cb(null, true);
                                                                                        //delete pods in background
                                                                                        options.params = {
                                                                                            qs: {
                                                                                                labelSelector: 'soajs-app=' + options.serviceName
                                                                                            }
                                                                                        };
                                                                                        engine.deletePods(options, (error) => {
                                                                                            if (error) {
                                                                                                soajs.log.error('Unable to delete pods of ' + options.serviceName);
                                                                                            }
                                                                                            else {
                                                                                                soajs.log.debug('Pods of ' + options.serviceName + ' deleted successfully');
                                                                                            }
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
                        checkError(error, cb, function () {
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
                            checkError(error, cb, function () {
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
        });
    },

    /**
     * Returns a kubernetes replica set
     * @param options
     * @param cb
     */
    getReplicaSet(options, cb) {
        options.requestOptions = injectCerts(options);
        options.requestOptions.qs = {
            labelSelector: 'soajs-app=' + options.serviceName
        };

        request.get(options.requestOptions, (error, response, body) => {
            var rs = ((body && body.items && body.items[0]) ? body.items[0] : null); //replicaset list must contain only one item in this case
            return cb(error, rs);
        });
    },

    /**
     * Deletes a kubernetes replica set
     * @param options
     * @param cb
     */
    deleteReplicaSet(options, cb) {
        options.requestOptions = injectCerts(options);
        options.requestOptions.uri += '/' + options.params.rsName;
        options.requestOptions.body = {
            gracePeriodSeconds: 0
        };

        request.delete(options.requestOptions, (error, response, body) => {
            return cb(error, body);
        });
    },

    /**
     * updates a kubernetes replica set
     * @param options
     * @param cb
     */
    updateReplicaSet(options, cb) {
        options.requestOptions = injectCerts(options);
        options.requestOptions.uri += '/' + options.replicaSet.metadata.name;
        options.requestOptions.body.replicaSet.spec = {
            replicas : options.params.replicas
        }
        request.put(options.requestOptions, function (error, response, body) {
            return cb(error, body);
        });
    },

    /**
     * Injects the certificates
     * @param options
     * @returns {*}
     */
    injectCerts (options) {
        lib.getDeployer(options, (error, deployer) => {
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
            checkError(error, cb, () => {
                deployer.core.namespaces.pods.delete(options.params, cb);
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
            checkError(error, cb, () => {
                deployer.extensions.namespaces.deployments.get(options.params, cb);
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
            checkError(error, cb, () => {
                deployer.extensions.namespaces.deployments.delete(options.params, cb);
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
            for (let i = 0; i < options.params.dockerRecords.length; i++) {
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
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, cb, () => {
                checkError(error, cb, () => {
                    deployer.core.namespaces.services.post(options.params, cb);
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
            checkError(error, cb, () => {
                checkError(error, cb, () => {
                    deployer.core.namespaces.services.get(options.params, cb);
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
            checkError(error, cb, () => {
                checkError(error, cb, () => {
                    deployer.core.namespaces.services.delete(options.params, cb);
                });
            });
        });
    }

};

module.exports = engine;
