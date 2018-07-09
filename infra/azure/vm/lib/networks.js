'use strict';

const async = require('async');
const helper = require('./../helper');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const networks = {

    /**
    * List available networks

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing Networks for resourcegroup ${options.params.group} `);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.virtualNetworks.list(options.params.group, function (error, networks) {
                    utils.checkError(error, 731, cb, () => {
                        async.map(networks, function(oneNetwork, callback) {
                            return callback(null, helper.buildNetworkRecord({ network: oneNetwork }));
                        }, function(error, networksList) {
                            return cb(null, networksList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating/Updating network ${options.params.networkName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                //TODO: if options.params.subnets is found, add subnets to network
                let params = {
                    location: options.params.region,
                    addressSpace: {
                        addressPrefixes: options.params.addressPrefixes || ['10.0.0.0/16']
                    },
                    tags: options.params.labels || {}
                };

                if(options.params.dnsServers && Array.isArray(options.params.dnsServers) && options.params.dnsServers.length > 0) {
                    params.dhcpOptions = { dnsServers: options.params.dnsServers };
                }

                resourceClient.virtualNetworks.createOrUpdate(options.params.group, options.params.networkName, options.params, function (error, result) {
                    utils.checkError(error, 747, cb, () => {
                        return cb(null, result);
                    });
                });
            });
        });
    },

    /**
    * Update a network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return networks.create(options, cb);
    },

    /**
    * Delete a network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting network ${options.params.networkName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.virtualNetworks.deleteMethod(options.params.group, options.params.networkName, function (error, result) {
                    utils.checkError(error, 742, cb, () => {
                        return cb(null, result);
                    });
                });
            });
        });
    },

    /**
    * List available subnets

    * @param  {Object}   options  Data passed to function listsubas params
    * @param  {Function} cb    Callback fspub
    * @return {void}listsub
    */
    listSubnets: function (options, cb) {
        options.soajs.log.debug(`Listing subnets for ${options.params.group} and virtual network name ${options.params.virtualNetworkName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.subnets.list(options.params.group, options.params.virtualNetworkName, function (error, subnets) {
                    utils.checkError(error, 733, cb, () => {
                        async.map(subnets, function(oneSubnet, callback) {
                            return callback(null, helper.bulidSubnetsRecord({ subnet: oneSubnet }));
                        }, function(error, subnetsList) {
                            return cb(null, subnetsList);
                        });
                    });
                });
            });
        });
    }
}
module.exports = networks;
