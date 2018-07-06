'use strict';

const async = require('async');
const helper = require('./../helper');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const securityGroups = {

    /**
    * List available security groups

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing securityGroups for resourcegroup ${options.params.group} `);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId

                });
                networkClient.networkSecurityGroups.list(options.params.group,function (error, networkSecurityGroups) {
                    utils.checkError(error, 734, cb, () => {
                        async.map(networkSecurityGroups, function(oneNetworkSecurityGroup, callback) {
                            return callback(null, helper.buildSecurityGroupsRecord({ networkSecurityGroups: oneNetworkSecurityGroup }));
                        }, function(error, securityGroupsList) {
                            return cb(null, securityGroupsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {

    },

    /**
    * Update a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {

    },

    /**
    * Delete a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting security group ${options.params.securityGroupName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.networkSecurityGroups.deleteMethod(options.params.group, options.params.securityGroupName, function (error, response) {
                    utils.checkError(error, 744, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }
};

module.exports = securityGroups;
