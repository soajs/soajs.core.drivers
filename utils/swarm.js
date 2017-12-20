/* jshint esversion: 6 */

'use strict';

const utils = require('./utils.js');
const errors = require('./errors.js');

const Grid = require('gridfs-stream');
const async = require('async');
const Docker = require('dockerode');

const gridfsColl = 'fs.files';

const certsCache = {};

const lib = {
    getDeployer (options, cb) {
        let deployer = {};

        if(!options.env) {
            if(options.params && options.params.env) {
                options.env = options.params.env;
            }
            else if(options.soajs && options.soajs.registry && options.soajs.registry.code) {
                options.env = options.soajs.registry.code.toLowerCase();
            }
            else {
                return cb({ source: 'driver', value: 'No environment code passed to driver', code: 686, msg: errors[686] });
            }
        }

        if(!options.soajs || !options.soajs.registry) {
            return cb({ source: 'driver', value: 'No environment registry passed to driver', code: 687, msg: errors[687] });
        }

        if(options && options.driver && options.driver.split('.')[1] === 'local') {
            return redirectToProxy();
        }

        let protocol = 'https://',
            domain = `${options.soajs.registry.apiPrefix}.${options.soajs.registry.domain}`,
            port = (options.deployerConfig && options.deployerConfig.apiPort) ? options.deployerConfig.apiPort : '2376';

        //if manager node ip is set in deployer config, use it instead of environment domain
        if(options.deployerConfig && options.deployerConfig.nodes) {
            domain = options.deployerConfig.nodes;
        }

        if(options && options.params && options.params.targetHost) {
            domain = options.params.targetHost;
            if(options.params.targetPort) {
                port = options.params.targetPort;
            }
        }
        let host = `${protocol}${domain}:${port}`;

        if(options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
            return useApiWithToken();
        }

        if(!options.model || Object.keys(options.model).length === 0) {
            options.model = require('../models/mongo.js');
        }

        findCerts(options, (error, certs) => {
            //NOTE: error is handled in function
            deployer = new Docker(buildDockerConfig(host, port, certs));
            return cb(null, deployer);
        });

        function findCerts(options, fcb) {
            checkCertsCache(options, (error, certs) => {
                if(certs && Object.keys(certs).length > 0) {
                    return fcb(null, certs);
                }

                let opts = {
                    collection: gridfsColl,
                    conditions: {
                        ['metadata.env.' + options.env.toUpperCase()]: options.driver
                    }
                };

                options.model.findEntries(options.soajs, opts, (error, certs) => {
                    utils.checkError(error, 684, cb, () => {
                        utils.checkError(!certs || certs.length === 0, 685, cb, () => {
                            options.model.getDb(options.soajs).getMongoDB((error, db) => {
                                utils.checkError(error, 684, cb, () => {
                                    let gfs = Grid(db, options.model.getDb(options.soajs).mongodb);
                                    return pullCerts(certs, gfs, db, fcb);
                                });
                            });
                        });
                    });
                });
            });
        }

        function checkCertsCache(options, fcb) {
            if(certsCache && certsCache[domain] && typeof(certsCache[domain]) === 'object' && Object.keys(certsCache[domain]).length > 0) {
                options.deployer = new Docker(buildDockerConfig(host, port, certsCache[domain]));
                lib.ping(options, (error, response) => {
                    if(error || response !== 'OK') {
                        console.log('Cached certificates are not valid, pulling certs again ...');
                        certsCache[domain] = {};

                        return fcb();
                    }

                    console.log('Using certificates from cache');
                    return fcb(null, certsCache[domain]);
                });
            }
            else {
                console.log('No certificates found in cache');
                return fcb();
            }
        }

        function pullCerts(certs, gfs, db, fcb) {
            var certBuffers = {};
            async.each(certs, (oneCert, callback) => {
                var gs = new gfs.mongo.GridStore(db, oneCert._id, 'r', {
                    root: 'fs',
                    w: 1,
                    fsync: true
                });

                gs.open((error, gstore) => {
                    if(error) return callback(error);

                    gstore.read((error, filedata) => {
                        if(error) return callback(error);

                        gstore.close();
                        certBuffers[oneCert.metadata.certType] = filedata;
                        return callback(null, true);
                    });
                });
            }, (error, result) => {
                options.model.closeConnection(options.soajs);
                utils.checkError(error, 684, cb, () => {
                    //add certificates to cache
                    certsCache[domain] = certBuffers;

                    return fcb(null, certBuffers);
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

        function redirectToProxy() {
            let ports = options.soajs.registry.serviceConfig.ports;
            deployer = new Docker({
                host: ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller',
                port: ports.controller + ports.maintenanceInc,
                version: 'proxySocket'
            });

            return cb(null, deployer);
        }

        function useApiWithToken() {
            if(options.returnApiInfo) {
                return cb(null, { host, token: options.deployerConfig.auth.token });
            }

            deployer = new Docker({
                protocol: 'https',
                host: `${domain}`,
                port: `${port}`,
                headers: {
                    'token': options.deployerConfig.auth.token
                }
            });

            return cb(null, deployer);
        }
    },

    ping (options, cb) {
        options.deployer.ping(cb);
    },

    buildNodeRecord (options) {
        let record = {
            id: '',
            hostname: '',
            ip: '',
            version: '',
            state: '',
            spec: {
                role: '',
                availability: ''
            },
            resources: {
                cpus: '',
                memory: ''
            }
        };

        if (options && options.node) {
            if (options.node.ID) {
                record.id = options.node.ID;
            }

            if (options.node.Description) {
                if (options.node.Description.Hostname) {
                    record.hostname = options.node.Description.Hostname;
                }
                if (options.node.Description.Resources) {
                    if (options.node.Description.Resources && options.node.Description.Resources.NanoCPUs) {
                        record.resources.cpus = options.node.Description.Resources.NanoCPUs / 1000000000;
                    }
                    if (options.node.Description.Resources.MemoryBytes) {
                        record.resources.memory = options.node.Description.Resources.MemoryBytes;
                    }
                }
            }

            if (options.node.Status) {
                if (options.node.Status.Addr) {
                    record.ip = options.node.Status.Addr;
                }
                if (options.node.Status.State) {
                    record.state = options.node.Status.State;
                }
            }

            if (options.node.Version && options.node.Version.Index) {
                record.version = options.node.Version.Index;
            }

            if (options.node.Spec) {
                if (options.node.Spec.Role) {
                    record.spec.role = options.node.Spec.Role;
                }
                if (options.node.Spec.Availability) {
                    record.spec.availability = options.node.Spec.Availability;
                }
            }

            if (record.spec.role === 'manager') {
                record.managerStatus = {
                    leader: '',
                    reachability: '',
                    address: ''
                };

                if (options.node.ManagerStatus) {
                    if (options.node.ManagerStatus.Leader) {
                        record.managerStatus.leader = options.node.ManagerStatus.Leader;
                    }
                    if (options.node.ManagerStatus.Reachability) {
                        record.managerStatus.reachability = options.node.ManagerStatus.Reachability;
                    }
                    if (options.node.ManagerStatus.Addr) {
                        record.managerStatus.address = options.node.ManagerStatus.Addr;
                    }
                }
            }
        }


        return record;
    },

    buildServiceRecord (options) {
        let record = {
            id: '',
            version: '',
            name: '',
            labels: {},
            env: [],
            ports: [],
            tasks: []
        };

        if (options && options.service) {
            if (options.service.ID) {
                record.id = options.service.ID;
            }
            if (options.service.Version && options.service.Version.Index) {
                record.version = options.service.Version.Index;
            }

            if (options.service.Spec) {
                if (options.service.Spec.Name) {
                    record.name = options.service.Spec.Name;
                }
                if (options.service.Spec.Labels) {
                    record.labels = options.service.Spec.Labels;
                }
                if (options.service.Spec.TaskTemplate && options.service.Spec.TaskTemplate.ContainerSpec && options.service.Spec.TaskTemplate.ContainerSpec.Env) {
                    record.env = options.service.Spec.TaskTemplate.ContainerSpec.Env;
                }
            }

            if (options.service.Endpoint && options.service.Endpoint.Ports && options.service.Endpoint.Ports.length > 0) {
                options.service.Endpoint.Ports.forEach((onePortConfig) => {
                    let port = {
                        protocol: onePortConfig.Protocol,
                        target: onePortConfig.TargetPort,
                        published: onePortConfig.PublishedPort
                    };

                    if(onePortConfig.PublishMode && onePortConfig.PublishMode === 'host') {
                        port.preserveClientIP = true;
                    }

                    record.ports.push(port);
                });
            }
        }

        return record;
    },

    buildTaskRecord (options) {
        let record = {
            id: '',
            version: '',
            name: '',
            ref: {
                slot: '',
                service: {
                    name: '',
                    id: ''
                },
                node: {
                    id: ''
                },
                container: {
                    id: ''
                }
            },
            status: {
                ts: '',
                state: '',
                desiredState: '',
                message: ''
            }
        };

        if (options) {
            if (options.serviceName) {
                record.ref.service.name = options.serviceName;
            }
            if (options.task) {
                if (options.task.ID) {
                    record.id = options.task.ID;
                }
                if (options.task.Version && options.task.Version.Index) {
                    record.version = options.task.Version.Index;
                }

                if (options.serviceName) {
                    record.name = options.serviceName + ((options.task.Slot) ? '.' + options.task.Slot : ''); //might add extra value later
                }
                if (options.task.Slot) {
                    record.ref.slot = options.task.Slot;
                }
                if (options.task.ServiceID) {
                    record.ref.service.id = options.task.ServiceID;
                }
                if (options.task.NodeID) {
                    record.ref.node.id = options.task.NodeID;
                }

                if (options.task.Status) {
                    if (options.task.Status.ContainerStatus && options.task.Status.ContainerStatus.ContainerID) {
                        record.ref.container.id = options.task.Status.ContainerStatus.ContainerID;
                    }

                    if (options.task.Status.Timestamp) {
                        record.status.ts = options.task.Status.Timestamp; //timestamp of the last status update
                    }
                    if (options.task.Status.State) {
                        record.status.state = options.task.Status.State; //current state of the task, example: running
                    }
                    if (options.task.Status.Message) {
                        record.status.message = options.task.Status.Message; //current message of the task, example: started or error,
                    }
                }

                if (options.task.DesiredState) {
                    record.status.desiredState = options.task.DesiredState; //desired state of the task, example: running
                }
            }
        }

        return record;
    }
};

module.exports = lib;
