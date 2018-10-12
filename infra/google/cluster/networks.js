'use strict';

const async = require('async');
const googleApi = require('../utils/utils.js');

const v1Compute = function () {
    return googleApi.compute();
};

function getConnector(opts) {
    return require('../utils/utils.js').connector(opts);
}

const networks = {
    /**
     * List networks

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    list: function (options, cb) {
        let project = options.infra.api.project;
        let jwtClient = getConnector(options.infra.api).auth;
        let request = {
            auth: jwtClient,
            project: project
        };
        let records = [];
        v1Compute().networks.list(request, function (err, response) {
            if (err) {
                return cb(err);
            }
            else {
                let opts = {
                    project: project,
                    subnetwork: '',
                    region: '',
                    auth: jwtClient
                };
                async.forEach(response.items, (oneResponse, nCb) => {
                    let record = {
                        id: oneResponse.id,
                        name: oneResponse.name,
                        autoCreateSubnetworks: oneResponse.autoCreateSubnetworks,
                        description: oneResponse.description,
                        type: oneResponse.routingConfig.routingMode,
                        subnetworks: []
                    };
                    if (oneResponse.subnetworks && oneResponse.subnetworks.length > 0) {
                        async.forEach(oneResponse.subnetworks, (subNetwork, iCb) => {
                            let region = '';
                            let name = '';

                            region = subNetwork.split('/regions/')[1];
                            region = region.split('/subnetworks/')[0];
                            name = subNetwork.split('/subnetworks/')[1];

                            opts.region = region;
                            opts.subnetwork = name;
                            v1Compute().subnetworks.get(opts, (err, subs) => {
                                if (err) {
                                    options.soajs.log.error(err);
                                    return iCb(err);
                                } else {
                                    if (options.params.region) {
                                        if (options.params.region.includes(region)) {
                                            record.subnetworks.push({
                                                region: region,
                                                name: name,
                                                address: subs.ipCidrRange,
                                                gateway: subs.gatewayAddress
                                            });
                                        }
                                    } else {
                                        record.subnetworks.push({
                                            region: region,
                                            name: name,
                                            address: subs.ipCidrRange,
                                            gateway: subs.gatewayAddress
                                        });
                                    }
                                    iCb();
                                }
                            });
                        }, (err) => {
                            if (err) {
                                return nCb(err);
                            }
                            if (record.subnetworks.length > 0) {
                                records.push(record);
                            }
                            nCb();
                        })
                    } else {
                        nCb()
                    }
                }, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, records);
                });
            }
        });
    },

    /**
     * insert network

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    add: function (options, cb) {
        let jwtClient = getConnector(options.infra.api).auth;
        let request = {
            auth: jwtClient,
            resource: {
                name: options.params.name,
                autoCreateSubnetworks: true,
                description: options.params.description,
                routingConfig: {
                    routingMode: 'REGIONAL'
                },
            },
            project: options.infra.api.project

        };
        //Ref: https://cloud.google.com/compute/docs/reference/latest/networks/insert
        v1Compute().networks.insert(request, function (err, response) {
            if (err) {
                return cb(err);
            } else {
                if(options.params.returnGlobalOperation) {
                    return cb(null, response);
                }
                else {
                    return cb(null, true);
                }
            }
        });
    },

    /**
     * delete network

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    delete: function (options, cb) {
        let jwtClient = getConnector(options.infra.api).auth;
        let firewall = {
            auth: jwtClient,
            filter: `network eq .*${options.params.name}`,
            project: options.infra.api.project
        };
        let request = {
            auth: jwtClient,
            network: options.params.name,
            project: options.infra.api.project

        };
        let sub = {};
        v1Compute().firewalls.list(firewall, function (err, firewalls) {
            if (err) {
                return cb(err);
            } else {
                if (!firewalls || !firewalls.items) {
                    firewalls = {
                        items: []
                    }
                }
                options.soajs.log.debug("Removing Firewalls from network: ", options.params.name);
                async.mapSeries(firewalls.items, function (oneFirewall, callback) {
                    delete request.network;
                    request.firewall = oneFirewall.name;

                    v1Compute().firewalls.delete(request, callback);
                }, function (err, operations) {
                    async.each(operations, function (oneOperation, callback) {
                        delete request.firewall;
                        globalOperations(request, oneOperation, "Firewall", callback);
                    }, function (err) {
                        if (err) {
                            options.soajs.log.error(err);
                            return cb(err);
                        } else {
                            request.network = options.params.name;
                            networks.list(options, (err, response) => {
                                if (err) {
                                    return cb(err);
                                } else {
                                    async.each(response, (oneNet, iCb) => {
                                        if (oneNet.name === options.params.name) {
                                            if (oneNet.autoCreateSubnetworks) {
                                                v1Compute().networks.delete(request, (error) => {
                                                    if (error) {
                                                        return iCb(error);
                                                    } else {
                                                        options.soajs.log.debug("Firewalls and Network Deleted Successfully.");
                                                        return iCb();
                                                    }
                                                });
                                            } else {
                                                async.mapSeries(oneNet.subnetworks, (oneSub, sCb) => {
                                                    sub = {
                                                        auth: jwtClient,
                                                        subnetwork: oneSub.name,
                                                        region: oneSub.region,
                                                        project: options.infra.api.project
                                                    };
                                                    v1Compute().subnetworks.delete(sub, sCb);
                                                }, (err, operations) => {
                                                    if (err) {
                                                        return iCb(err);
                                                    } else {
                                                        async.each(operations, function (oneOperation, callback) {
                                                            checksubnets(request, callback);
                                                        }, (err) => {
                                                            if (err) {
                                                                return iCb(err);
                                                            } else {
                                                                setTimeout(function () {
                                                                    //Ref: https://cloud.google.com/compute/docs/reference/latest/networks/delete
                                                                    v1Compute().networks.delete(request, (error) => {
                                                                        if (error) {
                                                                            return iCb(error);
                                                                        } else {
                                                                            options.soajs.log.debug("Network Deleted Successfully.");
                                                                            return iCb();
                                                                        }
                                                                    });
                                                                },(process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 20000)
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        } else {
                                            iCb();
                                        }
                                    }, (err) => {
                                        if (err) {
                                            return cb(err)
                                        }
                                        return cb();
                                    })
                                }
                            });
                        }
                    });
                });
            }
        });
        // check if firewalls deleted
        function globalOperations(request, operation, type, cb) {
            request.operation = operation.name;
            setTimeout(function () {
                v1Compute().globalOperations.get(request, (err, response) => {
                    if (err) {
                        return cb(err);
                    }
                    else {
                        if (response && response.status === "DONE") {
                            return cb(null, true);
                        }
                        else {
                            globalOperations(request, operation, type, cb);
                        }
                    }
                });
            });
        }
        // check if subnets deleted
        function checksubnets(request, cb) {
            v1Compute().networks.get(request, (err, response) => {
                if (err) {
                    return cb(err);
                }
                else {
                    if (response && (response.subnetworks && response.subnetworks.length === 0 || !response.subnetworks)) {
                        setTimeout(function () {
                            return cb(null, true);
                        }, 1000)
                    }
                    else {
                        options.soajs.log.debug("Checking Subnetworks");
                        setTimeout(function () {
                            checksubnets(request, cb);
                        }, 5000);
                    }
                }
            });
        }
    }
};

module.exports = networks;
