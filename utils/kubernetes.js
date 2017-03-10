/* jshint esversion: 6 */
'use strict';

const K8Api = require('kubernetes-client');
const config = require('../config.js');

const kubeLib = {
    buildNameSpace(options){
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

    getDeployer(options, cb) {
        let kubeURL = config.kubernetes.apiHost;

        if (process.env.SOAJS_TEST_KUBE_PORT) {
            //NOTE: unit testing requires the external port of the machine
            kubeURL += ':' + process.env.SOAJS_TEST_KUBE_PORT;
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

        kubeConfig.version = 'v1';
        kubernetes.core = new K8Api.Core(kubeConfig);

        kubeConfig.version = 'v1beta1';
        kubernetes.extensions = new K8Api.Extensions(kubeConfig);

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
            labels: options.deployment.metadata.labels,
            env: getEnvVariables(options.deployment.spec.template.spec),
            ports: getPorts(options.service),
            namespace: options.deployment.metadata.namespace,
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
