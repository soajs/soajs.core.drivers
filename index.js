/*jshint esversion: 6 */

"use strict";

let fs = require('fs');
let cache = {};
let errorFile = require('./utils/errors.js');

function checkError(error, code, cb, scb) {
    if(error)
        return cb({
            "error": error,
            "code": code,
            "msg": errorFile[code]
        });
    else
        return scb();
}

function checkIfSupported(options, cb, fcb) {
    let isSupported = ((options.strategy[options.function] && typeof (options.strategy[options.function]) === 'function') ? true : false);

    if (isSupported) return fcb();
    else return cb({
        "error": "error",
        "code": 519,
        "msg": errorFile[519]
    });
}

function getStrategy(options, cb) {
    checkCache(options, (error, strategy) => {
        if (strategy) return cb(null, strategy);

        let path = __dirname + "/strategies/" + options.strategy + ".js";

        checkStrategy(path, (error) => {
            if (error) return cb(error);

            try {
                cache[options.strategy] = require(path);
            }
            catch (e) {
                console.log("Error");
                console.log(e);
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
     * Inspect cluster
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectCluster (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectCluster'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'addNode'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'removeNode'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'updateNode'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectNode'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listNodes'}, cb, () => {
                    strategy.listNodes(options, cb);
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'listServices'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deployService'}, cb, () => {
                    strategy.deployService(options, cb);
                });
            });
        });
    },

    /**
     * Redeploy a service/deployment (sync)
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    redeployService (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'redeployService'}, cb, () => {
                    strategy.redeployService(options, cb);
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'scaleService'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectService'}, cb, () => {
                    strategy.inspectService(options, cb);
                });
            });
        });
    },

    /**
     * Takes environment code and
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    findService (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'findService'}, cb, () => {
                    strategy.findService(options, cb);
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'inspectTask'}, cb, () => {
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'deleteService'}, cb, () => {
                    strategy.deleteService(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getContainerLogs'}, cb, () => {
                    strategy.getContainerLogs(options, cb);
                });
            });
        });
    },

    /**
    * Perform a SOAJS maintenance operation on a given service
    *
    * @param {Object} options
    * @param {Function} cb
    * @returns {*}
    */
    maintenance (options, cb) {
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'maintenance'}, cb, () => {
                    strategy.maintenance(options, cb);
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
        getStrategy(options, (error, strategy) => {
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getLatestVersion'}, cb, () => {
                    strategy.getLatestVersion(options, cb);
                });
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
            checkError(error, 518, cb, () => {
                checkIfSupported({strategy: strategy, function: 'getServiceHost'}, cb, () => {
                    strategy.getServiceHost(options, cb);
                });
            });
        });
    }

};
