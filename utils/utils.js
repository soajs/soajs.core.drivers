"use strict";
const util = require('util'); //NOTE: util is a native package in node, no need to include it in package.json
const errorFile = require('../utils/errors.js');

const gridfsColl = 'fs.files';

const Docker = require('dockerode');
const Grid = require('gridfs-stream');

const K8Api = require('kubernetes-client');
var utils = {
    "checkError": function (error, code, cb, scb) {
        if(error) {
            util.log(error);

            return cb({
                source: 'driver',
                value: error,
                code: code,
                msg: errorFile[code]
            });
        }
        else {
            return scb();
        }
    },
    'cloneObj': function (obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        if (obj instanceof Array && Object.keys(obj).every(function (k) {
                return !isNaN(k);
            })) {
            return obj.slice(0);
        }
        var _obj = {};
        for (var attr in obj) {
            if (Object.hasOwnProperty.call(obj, attr)) {
                _obj[attr] = utils.cloneObj(obj[attr]);
            }
        }
        return _obj;
    },

    'validProperty': function (object, propertyName) {
        return !(
            !Object.hasOwnProperty.call(object, propertyName) || object[propertyName] === undefined || object[propertyName] === null ||
            ( typeof object[propertyName] === "string" && object[propertyName].length === 0 ) ||
            ( typeof object[propertyName] === "object" && Object.keys(object[propertyName]).length === 0 )
        );
    },

    'swarmLib': {
        getDeployer (options, cb) {
            let config = options.deployerConfig, deployer;

            if (!config.flags || (config.flags && !config.flags.targetNode)) {
                redirectToProxy();
            }

            //remote deployments should use certificates if function requires connecting to a worker node
            if (config.flags && config.flags.targetNode) {
                getTargetNode(options, (error, target) => {
                    utils.checkError(error, 600, cb, () => {
                        //target object in this case contains ip/port of target node
                        findCerts(options, (error, certs) => {
                            utils.checkError(error, 600, cb, () => {
                                deployer = new Docker(buildDockerConfig(target.host, target.port, certs));
                                utils.swarmLib.ping({ deployer }, (error) => {
                                    utils.checkError(error, 600, cb, () => { //TODO: fix
                                        return cb(null, deployer);
                                    });
                                });
                            });
                        });
                    });
                });
            }

            function redirectToProxy() {
                let ports = options.soajs.registry.serviceConfig.ports;
                deployer = new Docker({
                    host: ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller',
                    port: ports.controller + ports.maintenanceInc,
                    version: 'proxySocket'
                });
                utils.swarmLib.ping({ deployer }, (error) => {
                    utils.checkError(error, 600, cb, () => { //TODO: fix params
                        return cb(null, deployer);
                    });
                });
            }

            function getTargetNode(options, cb) {
                /**
                 * This function is triggered whenever a connection to a specific node is required. Three options are available:
                 * 1. The target node is a member of the cluster, query the swarm to get its address and return it (example: get logs of a container deployed on cluster member x)
                 * 2. The target node is not a member of the cluster, such as when adding a new node to the cluster
                 */
                if (config.flags.swarmMember) {
                    if (options.driver.split('.')[1] === 'local') { //local deployment means the cluster has one manager node only
                        return redirectToProxy();
                    }

                    let customOptions = utils.cloneObj(options);
                    delete customOptions.deployerConfig.flags.targetNode;

                    //node is already part of the swarm, inspect it to obtain its address
                    engine.inspectNode(customOptions, (error, node) => {
                        utils.checkError(error, 600, cb, () => { //TODO: wrong error code, update
                            if (node.role === 'manager') { //option number one
                                return cb(null, {host: node.managerStatus.address.split(':')[0], port: '2376'}); //TODO: get port from env record, deployer object
                            }
                            else {
                                return cb(null, {host: node.ip, port: '2376'}); //TODO: get port from env record, deployer object
                            }
                        });
                    });
                }
                else { //option number two
                    //swarmMember = false flag means the target node is a new node that should be added to the cluster, invoked by addNode()
                    //we only need to return the host/port provided by the user, the ping function will later test if a connection can be established
                    return cb(null, {host: options.params.host, port: options.params.port});
                }
            }

            function findCerts(options, cb) {
                if (!options.env) {
                    return cb(600);
                }

                let opts = {
                    collection: gridfsColl,
                    conditions: {
                        ['metadata.env.' + options.env.toUpperCase()]: options.driver
                    }
                };

                options.model.findEntries(options.soajs, opts, (error, certs) => {
                    utils.checkError(error, 600, cb, () => {
                        if (!certs || certs.length === 0) {
                            return cb(600);
                        }

                        options.model.getDb(options.soajs).getMongoDB((error, db) => {
                            utils.checkError(error, 600, cb, () => {
                                let gfs = Grid(db, options.model.getDb(options.soajs).mongodb);
                                return pullCerts(certs, gfs, db, cb);
                            });
                        });
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
                        utils.checkError(error, 600, callback, () => {
                            gstore.read((error, filedata) => {
                                utils.checkError(error, 600, callback, () => {
                                    gstore.close();

                                    var certName = oneCert.filename.split('.')[0];
                                    certBuffers[oneCert.metadata.certType] = filedata;
                                    return callback(null, true);
                                });
                            });
                        });
                    });
                }, (error, result) => {
                    utils.checkError(error, 600, cb, () => {
                        return cb(null, certBuffers);
                    });
                });
            }

            function buildDockerConfig(host, port, certs) {
                let dockerConfig = { host, port };

                let certKeys = Object.keys(certs);
                certKeys.forEach((oneCertKey) => {
                    dockerConfig[oneCertKey] = certs[oneCertKey];
                });

                return dockerConfig;
            }
        },

        ping (options, cb) {
            options.deployer.ping(cb);
        },

        buildNodeRecord (options) {
            let record = {
                id: options.node.ID,
                hostname: options.node.Description.Hostname,
                ip: options.node.Status.Addr,
                version: options.node.Version.Index,
                state: options.node.Status.State,
                spec: {
                    role: options.node.Spec.Role,
                    availability: options.node.Spec.Availability
                },
                resources: {
                    cpus: options.node.Description.Resources.NanoCPUs / 1000000000,
                    memory: options.node.Description.Resources.MemoryBytes
                }
            };

            if (record.spec.role === 'manager') {
                record.managerStatus = {
                    leader: options.node.ManagerStatus.Leader,
                    reachability: options.node.ManagerStatus.Reachability,
                    address: options.node.ManagerStatus.Addr
                };
            }

            return record;
        },

        buildServiceRecord (options) {
            let record = {
                id: options.service.ID,
                version: options.service.Version.Index,
                name: options.service.Spec.Name,
                labels: options.service.Spec.Labels,
                env: options.service.Spec.TaskTemplate.ContainerSpec.Env || [],
                ports: [],
                tasks: []
            };

            if (options.service.Endpoint && options.service.Endpoint.Ports && options.service.Endpoint.Ports.length > 0) {
                options.service.Endpoint.Ports.forEach((onePortConfig) => {
                    record.ports.push({
                        protocol: onePortConfig.Protocol,
                        target: onePortConfig.TargetPort,
                        published: onePortConfig.PublishedPort
                    });
                });
            }

            return record;
        },

        buildTaskRecord (options) {
            let record = {
                id: options.task.ID,
                version: options.task.Version.Index,
                name: options.serviceName + ((options.task.Slot) ? '.' + options.task.Slot : ''), //might add extra value later
                ref: {
                    slot: options.task.Slot,
                    service: {
                        name: options.serviceName,
                        id: options.task.ServiceID
                    },
                    node: {
                        id: options.task.NodeID
                    },
                    container: {
                        id: options.task.Status.ContainerStatus.ContainerID
                    }
                },
                status: {
                    ts: options.task.Status.Timestamp, //timestamp of the last status update
                    state: options.task.Status.State, //current state of the task, example: running
                    desiredState: options.task.DesiredState, //desired state of the task, example: running
                    message: options.task.Status.Message //current message of the task, example: started or error,
                }
            };

            return record;
        }
    },

    'kubeLib': {
        buildNameSpace(options){
            let namespace = options.deployerConfig.namespace.default;

            if(options.deployerConfig.namespace.perService){
                let serviceName = options.params.serviceName || options.params.name || options.params.id;
                //In case of service creation, the service name already contains the env code embedded to it
                if(options.params.serviceCreation)
                    namespace += "-" + serviceName;
                else
                    namespace += "-" + options.params.env + "-" + serviceName;
            }

            return namespace;
        },

        getDeployer(options, cb) {
            let ports = options.soajs.registry.serviceConfig.ports;
            let controllerProxyHost = ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller';

            let namespace = options.deployerConfig.namespace.default;
            if (options.deployerConfig.namespace.perService) namespace += '-' + controllerProxyHost;
            controllerProxyHost += '.' + namespace;

            let kubernetes = {};
            let kubeProxyURL = 'http://' + controllerProxyHost + ':' + (ports.controller + ports.maintenanceInc) + '/proxySocket';
            let kubeConfig = { url: kubeProxyURL };

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
            }

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
    }
};

module.exports = utils;
