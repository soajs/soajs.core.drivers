/*jshint esversion: 6 */

"use strict";

const K8Api = require('kubernetes-client');
const async = require('async');
const request = require('request');
const util = require('util'); //NOTE: util is a native package in node, no need to include it in package.json

const utils = require('../utils/utils.js');
const errorFile = require('../utils/errors.js');

function checkError(error, code, cb, scb) {
    if(error) {
        util.log(error);

        return cb({
			source: 'driver',
			value: error,
			code: code,
			msg: errorFile[code]
		});
    }
    else
        return scb();
}

const lib = {
    getDeployer(options, cb) {
        let ports = options.soajs.registry.serviceConfig.ports;
        let controllerProxyHost = ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller';
        let kubernetes = {};
        let kubeProxyURL = 'http://' + controllerProxyHost + ':' + (ports.controller + ports.maintenanceInc) + '/proxySocket';
        let kubeConfig = { url: kubeProxyURL };

        kubeConfig.version = 'v1';
        kubernetes.core = new K8Api.Core(kubeConfig);

        kubeConfig.version = 'v1beta1';
        kubernetes.extensions = new K8Api.Extensions(kubeConfig);

        return cb(null, kubernetes);
    },

    buildNodeRecord (options) {
        let record = {
            id: options.node.metadata.name, //setting id = name | kuberenetes api depends on name unlike swarm
            hostname: options.node.metadata.name,
            ip: getIP(options.node.status.addresses),
            version: options.node.metadata.resourceVersion,
            state: getStatus(options.node.status.conditions),
            spec: {
                role: 'manager', //NOTE: set to manager by default for now
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
            env: getEnvVariables(options.deployment.spec.template.spec),
            ports: getPorts(options.service),
            tasks: []
        };

        return record;

        function getEnvVariables(podSpec) {
            //current deployments include only one container per pod, variables from the first container are enough
            let envs = [];

            if (podSpec && podSpec.containers && podSpec.containers.length > 0 && podSpec.containers[0].env) {
                podSpec.containers[0].env.forEach((oneEnv) => {
                    if (oneEnv.value) {
                        envs.push(oneEnv.name + '=' + oneEnv.value)
                    }
                    else {
                        //automatically generated values are delected here, actual values are not included
                        if (oneEnv.valueFrom && oneEnv.valueFrom.fieldRef && oneEnv.valueFrom.fieldRef.fieldPath) {
                            envs.push(oneEnv.name + '=' + oneEnv.valueFrom.fieldRef.fieldPath);
                        }
                        else {
                            envs.push(oneEnv.name + '=' + JSON.stringify (oneEnv.valueFrom, null, 0));
                        }
                    }
                });
            }

            return envs;
        }

        function getPorts (service) {
            if (!service) return [];

            let deploymentPorts = [];
            service.spec.ports.forEach((onePortConfig) => {
                deploymentPorts.push({
                    protocol: onePortConfig.protocol,
                    target: onePortConfig.targetPort || onePortConfig.port,
                    published: onePortConfig.nodePort || null
                });
            });

            return deploymentPorts;
        }

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
                container: { //only one container runs per pod in the current setup
                    id: ((options.pod.status &&
                        options.pod.status.containerStatuses &&
                        options.pod.status.containerStatuses[0] &&
                        options.pod.status.containerStatuses[0].containerID) ? options.pod.status.containerStatuses[0].containerID.split('//')[1] : null)
                }
            },
            status: {
                ts: options.pod.metadata.creationTimestamp,
                state: options.pod.status.phase.charAt(0).toLowerCase() + options.pod.status.phase.slice(1),
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
                let filter = {};
                if (options.params && options.params.env) {
                    filter = {
                        labelSelector: 'soajs.env.code=' + options.params.env
                    };
                }

                deployer.extensions.namespaces.deployments.get({qs: filter}, (error, deploymentList) => {
                    checkError(error, 536, cb, () => {
                        deployer.extensions.namespaces.daemonsets.get({qs: filter}, (error, daemonsetList) => {
                            checkError(error, 663, cb, () => {
                                let deployments = deploymentList.items.concat(daemonsetList.items);

                                async.map(deployments, (oneDeployment, callback) => {
                                    filter = {
                                        labelSelector: 'soajs.env.code=' + options.params.env + ', soajs.service.label= ' + oneDeployment.metadata.name
                                    };
                                    deployer.core.namespaces.services.get({qs: filter}, (error, serviceList) => {
                                        if (error) {
                                            return callback(error);
                                        }

                                        let record = lib.buildDeploymentRecord({ deployment: oneDeployment , service: serviceList.items[0] });

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
                                    });
                                }, cb);
                            });
                        });
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
        service.metadata.name = options.params.name;
        if (options.params.labels['soajs.service.name'] !== 'controller') {
            service.metadata.name += '-service';
        }
        service.metadata.labels = options.params.labels;
        service.spec.selector = { 'soajs.service.label': options.params.labels['soajs.service.label'] };

        if (options.params.ports && options.params.ports.length > 0) {
            options.params.ports.forEach((onePortEntry, portIndex) => {
                let portConfig = {
                    protocol: 'TCP',
                    name: onePortEntry.name || 'port-' + portIndex,
                    port: onePortEntry.target,
                    targetPort: onePortEntry.target
                };

                if (onePortEntry.isPublished) {
                    if (!service.spec.type || service.spec.type !== 'NodePort') {
                        service.spec.type = 'NodePort';
                    }
                    portConfig.nodePort = onePortEntry.published;
                    portConfig.name = onePortEntry.name || 'published-' + portConfig.name;
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

        //NOTE: add kubectl container only for controller deployments, required tp proxy requests
        //NOTE: static values are set for kubectl container, no need to make it dynamic for now
        if (options.params.labels['soajs.service.name'] === 'controller') {
            payload.spec.template.spec.containers.push({
                "name": "kubectl-proxy",
                "image": "lachlanevenson/k8s-kubectl",
                "imagePullPolicy": "IfNotPresent",
                "args": ["proxy", "-p", "8001"],
                "ports": [
                    {

                        "containerPort": 8001
                    }
                ]
            });
        }

        //NOTE: only one volume is supported for now
        if (options.params.volume) {
            payload.spec.volumes.push({
                name: options.params.volume.name,
                hostPath: {
                    path: options.params.volume.source
                }
            });

            payload.spec.template.spec.containers[0].volumeMounts.push({
                mountPath: options.params.volume.target,
                name: options.params.volume.name
            });
        }

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

                        if (options.params.ui) { //in case of rebuilding nginx, pass custom ui environment variables
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_REPO', value: options.params.ui.repo });
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_OWNER', value: options.params.ui.owner });
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_BRANCH', value: options.params.ui.branch });
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_COMMIT', value: options.params.ui.commit });
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_COMMIT', value: options.params.ui.commit });
							deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_PROVIDER', value: options.params.ui.provider });
							deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_DOMAIN', value: options.params.ui.domain });

							if (options.params.ui.token) {
								deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_TOKEN', value: options.params.ui.token });
							}
						}

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
    findService (options, cb) { //TODO: test
        lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env + ', soajs.service.name=' + options.params.serviceName
                };

                if (options.params.version) {
                    filter.labelSelector += ', soajs.service.version=' + options.params.version;
                }

                deployer.extensions.namespaces.deployments.get({qs: filter}, (error, deploymentList) => {
                    checkError(error, 549, cb, () => {
                        checkError(deploymentList.items.length === 0, 657, cb, () => {
                            deployer.core.namespaces.services.get({qs: filter}, (error, serviceList) => {
                                checkError(error, 533, cb, () => {
                                    return cb(null, lib.buildDeploymentRecord ({ deployment: deploymentList.items[0], service: serviceList.items[0] }));
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
        options.params.scale = 0;
        engine.scaleService(options, (error) => {
            checkError(error, 527, cb, () => {
                lib.getDeployer(options, (error, deployer) => {
                    checkError(error, 520, cb, () => {
                        deployer.extensions.namespaces.deployments.delete({name: options.params.id, qs: { gracePeriodSeconds: 0 }}, (error) => {
                            checkError(error, 534, cb, () => {
                                let filter = {
                                    labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
                                };
                                deployer.core.namespaces.services.get({qs: filter}, (error, servicesList) => { //only one service for a given service can exist
                                    checkError(error, 533, cb, () => {
                                        if (servicesList && servicesList.items.length > 0) {
                                            async.each(servicesList.items, (oneService, callback) => {
                                                deployer.core.namespaces.services.delete({name: oneService.metadata.name}, callback);
                                            }, (error) => {
                                                checkError(error, 534, cb, () => {
                                                    cleanup(deployer, filter);
                                                })
                                            });
                                        }
                                        else {
                                            cleanup(deployer, filter);
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        function cleanup(deployer, filter) {
            deployer.extensions.namespaces.replicasets.delete({qs: filter}, (error) => {
                checkError(error, 532, cb, () => {
                    deployer.core.namespaces.pods.delete({qs: filter}, (error) => {
                        checkError(error, 660, cb, cb.bind(null, null, true));
                    });
                });
            });
        }
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

                deployer.core.namespaces.pods.get({name: options.params.taskId}, (error, pod) => {
                    check(error, 656, () => {
                        //NOTE: controllers have two containers per pod, kubectl and controller service
                        //NOTE: filter out the kubectl container and only get logs of controller
                        if (pod.spec && pod.spec.containers && pod.spec.containers.length > 0) {
                            let controllerContainer = {};
                            for (let i = 0; i < pod.spec.containers.length; i++) {
                                if (pod.spec.containers[i].name.indexOf('controller') !== -1) {
                                    controllerContainer = pod.spec.containers[i];
                                    break;
                                }
                            }

                            if (controllerContainer) {
                                params.qs.container = controllerContainer.name;
                            }


                            deployer.core.namespaces.pods.log(params, (error, logs) => {
                                check(error, 537, () => {
                                    return res.jsonp(options.soajs.buildResponse(null, { data: logs }));
                                });
                            });
                        }
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
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
                };
                deployer.core.namespaces.pods.get({qs: filter}, (error, podsList) => {
                    checkError(error, 659, cb, () => {
                        async.map(podsList.items, (onePod, callback) => {
                            let podInfo = {
                                id: onePod.metadata.name,
                                ipAddress: ((onePod.status && onePod.status.podIP) ? onePod.status.podIP : null)
                            };
                            return callback(null, podInfo);
                        }, (error, targets) => {
                            async.map(targets, (oneTarget, callback) => {
                                if (!oneTarget.ipAddress) {
                                    return callback(null, {
                                        result: false,
                                        ts: new Date().getTime(),
                                        error: {
                                            msg: 'Unable to get the ip address of the pod'
                                        }
                                    });
                                }

                                let requestOptions = {
                                    uri: 'http://' + oneTarget.ipAddress + ':' + options.params.maintenancePort + '/' + options.params.operation,
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
	 * Get the latest version of a deployed service
	 * Returns integer: service version
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getLatestVersion (options, cb) {
        let latestVersion = 0;
		lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env + ', soajs.service.name=' + options.params.serviceName
                };

                deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
                    checkError(error, 536, cb, () => {
                        deploymentList.items.forEach((oneDeployment) => {
                            if (oneDeployment.metadata && oneDeployment.metadata.labels) {
                                let v = oneDeployment.metadata.labels['soajs.service.version'];

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
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getServiceHost (options, cb) {
		lib.getDeployer(options, (error, deployer) => {
            checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env + ', soajs.service.name=' + options.params.serviceName
                };

                if (options.params.version) {
                    filter.labelSelector += ', soajs.service.version=' + options.params.version;
                }

                deployer.core.services.get({qs: filter}, (error, serviceList) => {
                    checkError(error, 549, cb, () => {
                        if (serviceList.items.length === 0) {
                            return cb({message: 'Service not found'});
                        }

                        //only one service must match the filter, therefore serviceList will contain only one item
                        return cb(null, serviceList.items[0].metadata.name);
                    });
                });
            });
        });
	}
};

module.exports = engine;
