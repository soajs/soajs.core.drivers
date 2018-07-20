'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const ips = {

    /**
    * List available ip addresses

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing public ips for resourcegroup ${options.params.group} `);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.publicIPAddresses.list(options.params.group,function (error, publicIPAddresses) {
                    utils.checkError(error, 735, cb, () => {

                        async.map(publicIPAddresses, function(onepublicIPAddresse, callback) {
                            return callback(null, helper.buildPublicIPRecord({ publicIPAddress: onepublicIPAddresse }));
                        }, function(error, PublicIpsList) {
                            return cb(null, PublicIpsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating/Updating public ip ${options.params.name} in group ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                let params = {
                    location: options.params.region,
                    publicIPAllocationMethod: helper.capitalize(options.params.publicIPAllocationMethod, 'Dynamic'), // Static || Dynamic
                    publicIPAddressVersion: options.params.ipAddressVersion || 'IPv4',
                    sku: {
                        name: helper.capitalize(options.params.type, 'Basic'), // Basic or Standard
                    },
                    tags: options.params.labels || {}
                };

                if(options.params.idleTimeout){
                	params.idleTimeoutInMinutes = Math.round(options.params.idleTimeout/60);
                }
                else {
	               params.idleTimeoutInMinutes = 30;
                }
                return networkClient.publicIPAddresses.createOrUpdate(options.params.group, options.params.name, params, function(error, response) {
                    utils.checkError(error, 717, cb, () => {
                        async.map(response, function(onePublicIPAddress, callback) {
                            return callback(null, helper.buildPublicIPRecord({ publicIPAddress: onePublicIPAddress }));
                        }, function(error, PublicIpsList) {
                            return cb(null, PublicIpsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Update an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return ips.create(options, cb);
    },

    /**
    * Delete an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting Public IP ${options.params.name}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.publicIPAddresses.deleteMethod(options.params.group, options.params.name, function (error) {
                    utils.checkError(error, 743, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }

};

module.exports = ips;
