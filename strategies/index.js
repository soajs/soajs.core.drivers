"use strict";

let fs = require('fs');
let cache = {};

function checkError(error, cb, fcb) {
    return (error) ? cb(error) : true;
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
    * Adds a node to a cluster
    *
    * @param {Object} options
    * @param {Function} cb
    * @returns {*}
    */
    addNode (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'addNode'}, cb, () => {
                strategy.addNode(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'removeNode'}, cb, () => {
                strategy.removeNode(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'updateNode'}, cb, () => {
                strategy.updateNode(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'inspectNode'}, cb, () => {
                strategy.inspectNode(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'listNodes'}, cb, () => {
                strategy.listNodes(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'buildNodeRecord'}, cb, () => {
                strategy.buildNodeRecord(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'listServices'}, cb, () => {
                strategy.listServices(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deployService'}, cb, () => {
                strategy.deployService(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'scaleService'}, cb, () => {
                strategy.scaleService(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'inspectService'}, cb, () => {
                strategy.inspectService(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getServiceComponents'}, cb, () => {
                strategy.getServiceComponents(options, cb);
            });
        });
    },

    /**
     * Returns a kubernetes deployment
     * @param options
     * @param cb
     */
    getDeployment (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getDeployment'}, cb, () => {
                strategy.getDeployment(options, cb);
            });
        });
    },

    /**
     * Deletes a kubernetes deployment
     * @param options
     * @param cb
     */
    deleteDeployment (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteDeployment'}, cb, () => {
                strategy.deleteDeployment(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'inspectTask'}, cb, () => {
                strategy.inspectTask(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteService'}, cb, () => {
                strategy.deleteService(options, cb);
            });
        });
    },

    /**
     * Returns a kubernetes replica set
     * @param options
     * @param cb
     */
    getReplicaSet (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getReplicaSet'}, cb, () => {
                strategy.getReplicaSet(options, cb);
            });
        });
    },

    /**
     * Deletes a kubernetes replica set
     * @param options
     * @param cb
     */
    deleteReplicaSet (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteReplicaSet'}, cb, () => {
                strategy.deleteReplicaSet(options, cb);
            });
        });
    },

    /**
     * updates a kubernetes replica set
     * @param options
     * @param cb
     */
    updateReplicaSet (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'updateReplicaSet'}, cb, () => {
                strategy.updateReplicaSet(options, cb);
            });
        });
    },

    /**
     * Injects the certificates
     * @param options
     * @returns {*}
     */
    injectCerts (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'injectCerts'}, cb, () => {
                strategy.injectCerts(options, cb);
            });
        });
    },

    /**
     * Deletes a kubernetes pod
     * @param options
     * @param cb
     */
    deletePod (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deletePod'}, cb, () => {
                strategy.deletePod(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'listContainers'}, cb, () => {
                strategy.listContainers(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'inspectContainer'}, cb, () => {
                strategy.inspectContainer(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteContainer'}, cb, () => {
                strategy.deleteContainer(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getContainerLogs'}, cb, () => {
                strategy.getContainerLogs(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'buildContainerRecords'}, cb, () => {
                strategy.buildContainerRecords(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getNewInstances'}, cb, () => {
                strategy.getNewInstances(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getRemovedInstances'}, cb, () => {
                strategy.getRemovedInstances(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'listNetworks'}, cb, () => {
                strategy.listNetworks(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'inspectNetwork'}, cb, () => {
                strategy.inspectNetwork(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'createNetwork'}, cb, () => {
                strategy.createNetwork(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'createKubeService'}, cb, () => {
                strategy.createKubeService(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'listKubeServices'}, cb, () => {
                strategy.listKubeServices(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteKubeService'}, cb, () => {
                strategy.deleteKubeService(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteServices'}, cb, () => {
                strategy.deleteServices(options, cb);
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
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'deleteTasksOrPods'}, cb, () => {
                strategy.deleteTasksOrPods(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getLatestVersion'}, cb, () => {
                strategy.getLatestVersion(options, cb);
            });
        });
    },

    /**
    * Get the domain/host name of a deployed service (per version)
    * Sample response: {"1":"DOMAIN","2":"DOMAIN"}
    * @param {Object} options
    * @param {Function} cb
    * @returns {*}
    */
    getServiceHost (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getServiceHost'}, cb, () => {
                strategy.getServiceHost(options, cb);
            });
        });
    },

    /**
    * Get the domain/host names of controllers per environment for all environments
    * {"dev":{"1":"DOMAIN","2":"DOMAIN"}}
    * @param {Object} options
    * @param {Function} cb
    * @returns {*}
    */
    getControllerEnvHost (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, cb);
            checkIfSupported({strategy: strategy, function: 'getControllerEnvHost'}, cb, () => {
                strategy.getControllerEnvHost(options, cb);
            });
        });
    }

};
