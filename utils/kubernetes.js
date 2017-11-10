/* jshint esversion: 6 */
'use strict';

const K8Api = require('kubernetes-client');
const config = require('../config.js');
const errors = require('./errors.js');

const kubeLib = {
    buildNameSpace(options){
        //if a namespace is already passed, override registry config and use it
        if(options.namespace) {
            return options.namespace;
        }

        let namespace = options.deployerConfig.namespace.default;

        if(options.deployerConfig.namespace.perService){
            //In case of service creation, the service name already contains the env code embedded to it
            if(options.params.id)
                namespace += "-" + options.params.id ;

            else if(options.params.serviceName)
                namespace += "-" + options.params.env + "-" + options.params.serviceName;
        }

        return namespace;
    },

    getDeployment(options, deployer, cb) {
        let type = options.params.mode || 'deployment';
        let namespace = kubeLib.buildNameSpace(options);
        deployer.extensions.namespaces(namespace)[type].get({ name: options.params.id }, (error, deployment) => {
            if(error && error.code !== 404) return cb(error);

            if(deployment && deployment.metadata && deployment.metadata.name) return cb(null, deployment);

            //remaining option is error 404, check daemonsets
            type = 'daemonset';
            deployer.extensions.namespaces(namespace)[type].get({ name: options.params.id }, (error, daemonset) => {
                if(error) return cb(error);

                if(daemonset && daemonset.metadata && daemonset.metadata.name) return cb(null, daemonset);

                return cb();
            });
        });
    },

    getDeployer(options, cb) {
        let kubeURL = '';

        if(!options.soajs || !options.soajs.registry) {
            return cb({ source: 'driver', value: 'No environment registry passed to driver', code: 687, msg: errors[687] });
        }

        if(options && options.driver && options.driver.split('.')[1] === 'local') {
            kubeURL = config.kubernetes.apiHost;
        }
        else {
            let protocol = 'https://',
                domain = `${options.soajs.registry.apiPrefix}.${options.soajs.registry.domain}`,
                port = (options.deployerConfig && options.deployerConfig.apiPort) ? options.deployerConfig.apiPort : '6443'

            kubeURL = `${protocol}${domain}:${port}`;
        }

        let kubernetes = {};
        let kubeConfig = {
            url: kubeURL,
            auth: {
                bearer: ''
            },
            request: {
                strictSSL: false
            }
        };

        if (options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
            kubeConfig.auth.bearer = options.deployerConfig.auth.token;
        }

        if (process.env.SOAJS_TEST_KUBE_PORT) {
            //NOTE: unit testing on travis requires a different setup
            kubeConfig.url = 'http://localhost:' + process.env.SOAJS_TEST_KUBE_PORT;
            delete kubeConfig.auth;
        }

        kubeConfig.version = 'v1';
        kubernetes.core = new K8Api.Core(kubeConfig);

        kubeConfig.version = 'v1beta1';
        kubernetes.extensions = new K8Api.Extensions(kubeConfig);

        kubeConfig.version = 'v1';
        kubernetes.autoscaling = new K8Api.Autoscaling(kubeConfig);

	    kubeConfig.version = 'v1alpha1';
	    kubernetes.metrics = new K8Api.Metrics(kubeConfig);

        delete kubeConfig.version;
        kubernetes.api = new K8Api.Api(kubeConfig);

        //add the configuration used to connect to the api
        kubernetes.config = kubeConfig;

        return cb(null, kubernetes);
    },

    buildNameSpaceRecord (options) {
        let record = {
            "id": options.metadata.name,
            "name": options.metadata.name,
            "version": options.metadata.resourceVersion,
            "status": options.status,
            "labels": options.metadata.labels
        };

        return record;
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
            namespace: options.deployment.metadata.namespace,
            labels: options.deployment.metadata.labels,
            env: getEnvVariables(options.deployment.spec.template.spec),
            ports: getPorts(options.service),
            resources: getResources(options.deployment.spec.template.spec),
            tasks: []
        };

        return record;

        function getEnvVariables(podSpec) {
            //current deployments include only one container per pod, variables from the first container are enough
            let envs = [];

            if (podSpec && podSpec.containers && podSpec.containers.length > 0 && podSpec.containers[0].env) {
                podSpec.containers[0].env.forEach((oneEnv) => {
                    if (oneEnv.value) {
                        envs.push(oneEnv.name + '=' + oneEnv.value);
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
            if (!service || !service.hasOwnProperty('spec') || !service.spec.hasOwnProperty('ports')) return [];

            let deploymentPorts = [];
            service.spec.ports.forEach((onePortConfig) => {
                let port = {
                    protocol: onePortConfig.protocol,
                    target: onePortConfig.targetPort || onePortConfig.port,
                    published: onePortConfig.nodePort || null
                };

                if(service.spec && service.spec.externalTrafficPolicy === 'Local') {
                    port.preserveClientIP = true;
                }

                deploymentPorts.push(port);
            });

            return deploymentPorts;
        }

        function getResources (podSpec) {
            //current deployments include one container per pod, resources from the first container are enough
            let resources = { limits: {} };

            if (podSpec && podSpec.containers && podSpec.containers.length > 0 && podSpec.containers[0].resources) {
                if (podSpec.containers[0].resources.limits) {
                    if (podSpec.containers[0].resources.limits.memory) resources.limits.memory = podSpec.containers[0].resources.limits.memory;
                    if (podSpec.containers[0].resources.limits.cpu) resources.limits.cpu = podSpec.containers[0].resources.limits.cpu;
                }
            }

            return resources;
        }

        return record;
    },

    buildPodRecord (options) {
        let serviceName = '';
        if (!options.pod || !options.pod.metadata || !options.pod.metadata.labels || !options.pod.metadata.labels['soajs.service.label']) {
            if (options.deployment && options.deployment.metadata && options.deployment.metadata.name) {
                serviceName = options.deployment.metadata.name;
            }
        }
        else {
            serviceName = options.pod.metadata.labels['soajs.service.label'];
        }

        let record = {
            id: options.pod.metadata.name,
            version: options.pod.metadata.resourceVersion,
            name: options.pod.metadata.name,
            ref: {
                service: {
                    name: serviceName,
                    id: serviceName
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

    buildAutoscalerRecord (options) {
        let record = { replicas: {}, metrics: {} };

        if(options.hpa) {
            if(options.hpa.spec) {
                if(options.hpa.spec.minReplicas) record.replicas.min = options.hpa.spec.minReplicas;
                if(options.hpa.spec.maxReplicas) record.replicas.max = options.hpa.spec.maxReplicas;

                if(options.hpa.apiVersion === 'autoscaling/v2alpha1') {
                    if(options.hpa.spec.metrics) {
                        options.hpa.spec.metrics.forEach((oneMetric) => {
                            //NOTE: only supported metric for now is CPU
                            if(oneMetric.resource && oneMetric.resource.name === 'cpu') {
                                record.metrics[oneMetric.resource.name] = { percent: oneMetric.resource.targetAverageUtilization };
                            }
                        });
                    }
                }
                else if(options.hpa.apiVersion === 'autoscaling/v1') {
                    //NOTE: only supported metric for now is CPU
                    if(options.hpa.spec.targetCPUUtilizationPercentage) {
                        record.metrics['cpu'] = { percent: options.hpa.spec.targetCPUUtilizationPercentage };
                    }
                }
            }
        }

        return record;
    },

    buildEnvList (options) {
        let envs = [];
        options.envs.forEach((oneVar) => {

        	let envVariable = oneVar.split('=');
        	if(envVariable[1] === '$SOAJS_HA_NAME'){
		        envs.push({
			        name: envVariable[0],
			        valueFrom: {
				        fieldRef: {
					        fieldPath: 'metadata.name'
				        }
			        }
		        });
	        }
	        else{
                envs.push({ name: envVariable[0], value: envVariable[1] });
	        }
        });

        return envs;
    },

    buildLabelSelector (options) {
        let labelSelector = '';

        if (!options || !options.matchLabels || Object.keys(options.matchLabels).length === 0) return labelSelector;

        let labels = Object.keys(options.matchLabels);

        for (let i = 0; i < labels.length; i++) {
            if (labelSelector.length > 0) labelSelector += ', ';
            labelSelector += labels[i] + '=' + options.matchLabels[labels[i]];
        }

        return labelSelector;
    }
};

module.exports = kubeLib;
