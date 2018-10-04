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
            project : project
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
                        id : oneResponse.id,
                        name: oneResponse.name,
                        autoCreateSubnetworks: true,
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
                                    record.subnetworks.push({
                                        region: region,
                                        name: name,
                                        address: subs.ipCidrRange,
                                        gateway: subs.gatewayAddress
                                    });
                                    iCb();
                                }
                            });
                        }, (err) => {
                            if (err) {
                                return nCb(err);
                            }
                            records.push(record);
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
                name: options.soajs.inputmaskData.params.name,
                autoCreateSubnetworks: true,
                description:options.soajs.inputmaskData.params.description,
                routingConfig: {
                    routingMode: 'REGIONAL'
                },
            },
            project: options.infra.api.project

        };
        v1Compute().networks.insert(request, function (err, response) {
            if (err) {
                return cb(err);
            } else {
                return cb(null, "This is for testing -- insert")
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
            filter : `network eq .*${options.soajs.inputmaskData.name}`, // from options
            project: options.infra.api.project
        };
        let request = {
            auth: jwtClient,
            network: options.soajs.inputmaskData.name,
            project: options.infra.api.project

        };
        v1Compute().firewalls.list(firewall, function (err, firewalls) {
            if (err) {
                return cb(err);
            } else {
                if (!firewalls || !firewalls.items) {
                    firewalls = {
                        items: []
                    }
                }
                options.soajs.log.debug("Removing Firewalls from network: ", options.soajs.inputmaskData.name);
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
                            request.network = options.soajs.inputmaskData.name;
                            options.soajs.log.debug("Removing Network: ", options.network);
                            v1Compute().networks.delete(request, (error, res) => {
                                if (error) {
                                    return cb(error);
                                } else {
                                    options.soajs.log.debug("Firewalls and Network Deleted Successfully.");
                                    return cb(null, "Firewall and Network Deleted Successfully.");
                                }
                            });
                        }
                    });
                });
            }
        });
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
    }
};

module.exports = networks;