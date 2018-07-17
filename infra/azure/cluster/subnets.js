'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const subnets = {

    /**
    * List available subnets

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    list: function (options, cb) {
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
                            return callback(null, helper.buildSubnetRecord({ subnet: oneSubnet }));
                        }, function(error, subnetsList) {
                            return cb(null, subnetsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating subnet for ${options.params.group} and virtual network name ${options.params.virtualNetworkName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                let params = {
                    addressPrefix: options.params.addressPrefix || '10.0.0.0/24'
                };

                networkClient.subnets.createOrUpdate(options.params.group, options.params.virtualNetworkName, options.params.subnetName, params, function (error, subnet) {
                    utils.checkError(error, 756, cb, () => {
                        return cb(null, helper.buildSubnetRecord({ subnet }));
                    });
                });
            });
        });
    },

    /**
    * Update an existing subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    update: function(options, cb) {
        return subnets.create(options, cb);
    },

    /**
    * Delete a subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting subnet ${options.params.subnetName} in network ${options.params.virtualNetworkName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                networkClient.subnets.deleteMethod(options.params.group, options.params.virtualNetworkName, options.params.subnetName, function (error, subnet) {
                    utils.checkError(error, 757, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }

};

module.exports = subnets;
