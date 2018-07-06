'use strict';

const async = require('async');
const helper = require('./../helper');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

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
							return callback(null, helper.buildPublicIPsRecord({ publicIPAddresse: onepublicIPAddresse }));
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

    },

    /**
	* Update an ip address

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    update: function(options, cb) {

    },

    /**
	* Delete an ip address

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
    delete: function(options, cb) {

    }

};

module.exports = ips;
