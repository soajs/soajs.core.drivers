'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

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
        options.soajs.log.debug(`Creating/Updating network ${options.params.name}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                let params = {
                    location: options.params.region,
                    addressSpace: {
                        addressPrefixes: options.params.address || ['10.0.0.0/16']
                    },
                    tags: options.params.labels || {}
                };

                if(options.params.dnsServers && Array.isArray(options.params.dnsServers) && options.params.dnsServers.length > 0) {
                    params.dhcpOptions = { dnsServers: options.params.dnsServers };
                }

                if(options.params.subnets && Array.isArray(options.params.subnets) && options.params.subnets.length > 0) {
	                params.subnets = [];
	                options.params.subnets.forEach(function (oneSubnet) {
		                params.subnets.push({
			                addressPrefix: oneSubnet.address,
			                name: oneSubnet.name
		                });
	                });
                }

                resourceClient.virtualNetworks.createOrUpdate(options.params.group, options.params.name, params, function (error, network) {
                    utils.checkError(error, 747, cb, () => {
                        return cb(null, helper.buildNetworkRecord({ network }));
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
        options.soajs.log.debug(`Deleting network ${options.params.name}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.virtualNetworks.deleteMethod(options.params.group, options.params.name, function (error, result) {
                    utils.checkError(error, 742, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }

};

module.exports = networks;
