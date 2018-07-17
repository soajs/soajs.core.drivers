'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const groups = {

    /**
    * List available resource groups

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing available resource groups`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'resource',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.resourceGroups.list(function (error, resourceGroups) {
                    utils.checkError(error, 714, cb, () => {
                        async.map(resourceGroups, function(oneResourceGroup, callback) {
                            return callback(null, helper.buildResourceGroupRecord({ resourceGroup: oneResourceGroup }));
                        }, function(error, resourceGroupsList) {
                            return cb(null, resourceGroupsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new resource group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating/Updating resource group ${options.params.group}`);
        let groupNameRegex = /^[-\w\._\(\)]+$/;
        utils.checkError(!options.params.group.match(groupNameRegex), 755, cb, () => {
            driverUtils.authenticate(options, (error, authData) => {
                utils.checkError(error, 700, cb, () => {
                    const resourceClient = driverUtils.getConnector({
                        api: 'resource',
                        credentials: authData.credentials,
                        subscriptionId: options.infra.api.subscriptionId
                    });
                    let params = {
                        location: options.params.region,
                    };
	                if (options.params.labels) {
		                params.tags = options.params.labels
	                }
                    resourceClient.resourceGroups.createOrUpdate(options.params.group, params, function (error, response){
                        utils.checkError(error, 753, cb, () => {
                            return cb(null, helper.buildResourceGroupRecord({ resourceGroup: response }));
                        });
                    });
                });
            });
        });
    },

    /**
    * Update a resource group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return groups.create(options, cb);
    },

    /**
    * Delete a resource group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting resource group ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'resource',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.resourceGroups.deleteMethod(options.params.group, function (error, result) {
                    utils.checkError(error, 708, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }

};

module.exports = groups;
