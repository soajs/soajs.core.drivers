'use strict';

const async = require('async');
const helper = require('../../utils/helper.js');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const disks = {

    /**
	* List available disks

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    list: function(options, cb) {
        options.soajs.log.debug(`Listing Data Disks for resourcegroup ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.disks.list(options.params.group, function (error, disks) {
					utils.checkError(error, 737, cb, () => {
						async.concat(disks, function(oneDisk, callback) {
							if(options.params && options.params.type) {
								// only return disks of type os
								if(options.params.type === 'os' && oneDisk.osType) {
									return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
								}
								// only return disks of type data
								else if (options.params.type === 'data' && !oneDisk.osType) {
									return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
								}
								// ignore disk
								else {
									return callback(null, []);
								}
							}

							// return all disks if no type is specified
							return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
						}, function(error, disksList) {
							return cb(null, disksList);
						});
					});
				});
			});
		});
    },

    /**
	* Create a new disk

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    create: function(options, cb) {
		return cb(null, true);
    },

    /**
	* Update a disk

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    update: function(options, cb) {
	    return cb(null, true);
    },

    /**
	* Delete a disk

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    delete: function(options, cb) {
	    return cb(null, true);
    }

};

module.exports = disks;
