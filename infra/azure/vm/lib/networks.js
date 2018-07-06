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
		options.soajs.log.debug(`Creating network ${options.params.networkName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const resourceClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
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
		options.soajs.log.debug(`Updating network ${options.params.networkName} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const resourceClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				resourceClient.virtualNetworks.createOrUpdate(options.params.group, options.params.networkName, options.params, function (error, result) {
					utils.checkError(error, 748, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
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
}
module.exports = networks;
