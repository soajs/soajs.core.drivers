'use strict';

const async = require('async');
const helper = require('./../helper');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const groups = {

    /**
	* List available resource groups

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    listGroups: function(options, cb) {
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
    createGroup: function(options, cb) {
      options.soajs.log.debug(`Listing available resource groups`);
      driverUtils.authenticate(options, (error, authData) => {
        utils.checkError(error, 700, cb, () => {
          const resourceClient = driverUtils.getConnector({
            api: 'resource',
            credentials: authData.credentials,
            subscriptionId: options.infra.api.subscriptionId
          });
          resourceClient.resourceGroups.createOrUpdate(options.params.name, params, options, function (error, response) {
            utils.checkError(error, 753, cb, () => {
            function(error, response) {
                return cb(null, response);
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
    updateGroup: function(options, cb) {

    },

    /**
	* Delete a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    deleteGroup: function(options, cb) {
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
              return cb(null, result);
            });
          });
        });
      });

    }

};

module.exports = groups;
