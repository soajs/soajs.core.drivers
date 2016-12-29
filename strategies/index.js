"use strict";

let fs = require('fs');
let cache = {};

function checkError(error, cb, fcb) {
    if (error) return cb(error);

    return fcb();
}

function checkIfSupported(options, cb, fcb) {
    let isSupported = ((options.strategy[options.function] && typeof (options.strategy[options.function]) === 'function') ? true : false);

    if (isSupported) return fcb();
    else return cb({'message': 'Function is not supported by strategy'});
}

function getStrategy(options, cb) {
    checkCache(options, function (error, strategy) {
        if (strategy) return strategy;

        let path = "./" + options.strategy + ".js";
        checkStrategy(path, (error) => {
            if (error) return cb(error);

            try {
                cache[options.strategy] = require(path);
            }
            catch (e) {
                return cb(e);
            }

            return cb(null, cache[options.strategy]);
        });
    });

    function checkCache(options, cb) {
        if (cache[options.strategy]) {
            return cb(null, cache[options.strategy]);
        }
        return cb();
    }

    function checkStrategy(path, cb) {
        fs.access(path, fs.constants.F_OK | fs.constants.R_OK, cb);
    }
}

module.exports = {

    /**
     * Inspect a swarm cluster, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectCluster (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectCluster'}, cb, function () {
                    strategy.inspectCluster(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'addNode'}, cb, function () {
                    strategy.addNode(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'removeNode'}, cb, function () {
                    strategy.removeNode(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'updateNode'}, cb, function () {
                    strategy.updateNode(options, cb);
                });
            });
        });
    },

    /**
     * Inspect a node, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectNode (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectNode'}, cb, function () {
                    strategy.inspectNode(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listNodes'}, cb, function () {
                    strategy.listNodes(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'buildNodeRecord'}, cb, function () {
                    strategy.buildNodeRecord(options, cb);
                });
            });
        });
    },

    /**
     * List services/deployments currently available
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listServices (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listServices'}, cb, function () {
                    strategy.listServices(options, cb);
                });
            });
        });
    },

    /**
     * Creates a new deployment for a SOAJS scaleHAService
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deployService (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deployService'}, cb, function () {
                    strategy.deployService(options, cb);
                });
            });
        });
    },

    /**
     * Scales a deployed services up/down depending on current replica count and new one
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    scaleService (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'scaleService'}, cb, function () {
                    strategy.scaleService(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectService'}, cb, function () {
                    strategy.inspectService(options, cb);
                });
            });
        });
    },

    /**
     * Recursively fetches a service's tasks/pods and returns the same output as inspectHAService() only when the desired number of tasks/pods is available
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getServiceComponents (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getServiceComponents'}, cb, function () {
                    strategy.getServiceComponents(options, cb);
                });
            });
        });
    },

    /**
     * Inspects and returns information about a specified task/pod
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectTask (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectTask'}, cb, function () {
                    strategy.inspectTask(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteService'}, cb, function () {
                    strategy.deleteService(options, cb);
                });
            });
        });
    },

    /**
     * Lists containers on a specified node, strategy is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listContainers (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listContainers'}, cb, function () {
                    strategy.listContainers(options, cb);
                });
            });
        });
    },

    /**
     * Inspects and returns information about a container
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectContainer (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectContainer'}, cb, function () {
                    strategy.inspectContainer(options, cb);
                });
            });
        });
    },

    /**
     * Delete container, strategy is this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteContainer (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteContainer'}, cb, function () {
                    strategy.deleteContainer(options, cb);
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
    getContainerLogs (options, res) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getContainerLogs'}, cb, function () {
                    strategy.getContainerLogs(options, cb);
                });
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'buildContainerRecords'}, cb, function () {
                    strategy.buildContainerRecords(options, cb);
                });
            });
        });
    },

    /**
     * Loops over current saved container records and returns any new instances not yet saved in docker collection
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getNewInstances (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getNewInstances'}, cb, function () {
                    strategy.getNewInstances(options, cb);
                });
            });
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getRemovedInstances'}, cb, function () {
                    strategy.getRemovedInstances(options, cb);
                });
            });
        });
    },

    /**
     * List available networks, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listNetworks (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listNetworks'}, cb, function () {
                    strategy.listNetworks(options, cb);
                });
            });
        });
    },

    /**
     * Inspect network, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectNetwork (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectNetwork'}, cb, function () {
                    strategy.inspectNetwork(options, cb);
                });
            });
        });
    },

    /**
     * Create new network, strategy in this case is restricted to swarm
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    createNetwork (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'createNetwork'}, cb, function () {
                    strategy.createNetwork(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'createKubeService'}, cb, function () {
                    strategy.createKubeService(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listKubeServices'}, cb, function () {
                    strategy.listKubeServices(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteKubeService'}, cb, function () {
                    strategy.deleteKubeService(options, cb);
                });
            });
        });
    },

    /**
     * Delete all deployed services
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteServices (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteServices'}, cb, function () {
                    strategy.deleteServices(options, cb);
                });
            });
        });
    },

    /** //TODO: review
     * Delete all tasks or pods
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteTasksOrPods (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteTasksOrPods'}, cb, function () {
                    strategy.deleteTasksOrPods(options, cb);
                });
            });
        });
    }
};
