/* jshint esversion: 6 */

'use strict';

const utils = require('./utils.js');
const engine = require('../strategyFunctions/swarmServices.js');

const Grid = require('gridfs-stream');
const async = require('async');
const Docker = require('dockerode');

const gridfsColl = 'fs.files';

const lib = {
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
                            lib.ping({ deployer }, (error) => {
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
            lib.ping({ deployer }, (error) => {
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
};

module.exports = lib;
