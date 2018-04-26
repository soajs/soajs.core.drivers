/* jshint esversion: 6 */
'use strict';

const utils = require('../../utils/utils');
const lib = require('./utils');
const async = require('async');

var engine = {
    /**
     * Inspect cluster, returns general cluster info + list of manager nodes
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    'inspectCluster': function (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                deployer.swarmInspect((error, swarm) => {
                    utils.checkError(error, 541, cb, () => {
                        deployer.info((error, info) => {
                            utils.checkError(error, 542, cb, cb.bind(null, null, {swarm, info}));
                        });
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
    'addNode': function (options, cb) {
        let payload = {};
        engine.inspectCluster(options, (error, cluster) => {
            utils.checkError(error, 543, cb, () => {
                buildManagerNodeList(cluster.info.Swarm.RemoteManagers, (error, remoteAddrs) => {
                    //error is null, no need to check it
                    let swarmPort = cluster.info.Swarm.RemoteManagers[0].Addr.split(':')[1]; //swarm port is being copied from any of the manger nodes in the swarm
                    payload.ListenAddr = '0.0.0.0:' + swarmPort;
                    payload.AdverstiseAddr = options.params.host + ':' + swarmPort;
                    payload.RemoteAddrs = remoteAddrs;
                    payload.JoinToken = ((options.params.role === 'manager') ? cluster.swarm.JoinTokens.Manager : cluster.swarm.JoinTokens.Worker);

                    options.params.targetHost = options.params.host;
                    options.params.targetPort = options.params.port;
                    lib.getDeployer(options, (error, deployer) => {
                        utils.checkError(error, 540, cb, () => {
                            deployer.swarmJoin(payload, (error, res) => {
                                utils.checkError(error, 544, cb, () => {
                                    return cb(null, true);
                                });
                            });
                        });
                    });
                });
            });
        });

        //this function takes a list of manager nodes and returns an array in the format required by the swarm api
        function buildManagerNodeList (nodeList, cb) {
            async.map(nodeList, (oneNode, callback) => {
                return callback(null, oneNode.Addr);
            }, cb);
        }
    },

    /**
     * Removes a node from a cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    'removeNode': function (options, cb) {
         //get master node deployer
         lib.getDeployer(options, (error, deployer) => {
             utils.checkError(error, 540, cb, () => {
                 let node = deployer.getNode(options.params.nodeId);
                 node.inspect((error, targetNode) => {
                     utils.checkError(error, 547, cb, () => {
                         options.params.targetHost = targetNode.Status.Addr;
                         //get target node deployer
                         lib.getDeployer(options, (error, targetDeployer) => {
                             utils.checkError(error, 540, cb, () => {
                                 //leave swarm at target node level
                                 targetDeployer.swarmLeave((error) => {
                                     utils.checkError(error, 545, cb, () => {
                                         //remove node from swarm at master node level
                                         node.remove({ force: true }, (error) => {
                                             utils.checkError(error, 654, cb, cb.bind(null, null, true));
                                         });
                                     });
                                 });
                             });
                         });
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
    'updateNode': function (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let node = deployer.getNode(options.params.id);
                //need to inspect node in order to get its current version and pass it to update call
                node.inspect((error, nodeInfo) => {
                    utils.checkError(error, 547, cb, () => {
                        let update = nodeInfo.Spec;
                        update.version = nodeInfo.Version.Index;

                        delete options.params.id;
                        Object.keys(options.params).forEach((oneUpdateParam) => {
                            update[oneUpdateParam.charAt(0).toUpperCase() + oneUpdateParam.slice(1)] = options.params[oneUpdateParam];
                        });
                        node.update(update, (error) => {
                            utils.checkError(error, 546, cb, () => {
                                return cb(null, true);
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Inspect a node that is already part of the cluster, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    'inspectNode': function (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let node = deployer.getNode(options.params.id);
                node.inspect((error, node) => {
                    utils.checkError(error, 547, cb, () => {
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
    'listNodes': function (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                deployer.listNodes((error, nodes) => {
                    utils.checkError(error, 548, cb, () => {
                        async.map(nodes, (node, callback) => {
                            return callback(null, lib.buildNodeRecord({ node }));
                        }, cb);
                    });
                });
            });
        });
    }
};

module.exports = engine;
