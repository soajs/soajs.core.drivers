'use strict';

const async = require('async');
const helper = require('../../utils/helper.js');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const sizes = {

    /**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	list: function (options, cb) {
		options.soajs.log.debug(`Listing available virtual machine sizes in ${options.params.region} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineSizes.list(options.params.region, function (error, vmSizes) {
					utils.checkError(error, 709, cb, () => {
						async.map(vmSizes, function(onevmSize, callback) {
							return callback(null, helper.buildVmSizes({ vmSize: onevmSize }));
						}, function(error, vmSizesList) {
							return cb(null, vmSizesList);
						});
					});
				});
			});
		});
	}

};

module.exports = sizes;
