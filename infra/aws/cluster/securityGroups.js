'use strict';

const async = require('async');
const config = require('./../config');
const utils = require('../../../lib/utils/utils.js');
const helper = require('../utils/helper.js');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const securityGroups = {
	
	/**
	 * List available security groups
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function (options, cb) {
		const aws = options.infra.api;
		
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		ec2.describeSecurityGroups({}, (err, response) => {
			if (response && response.SecurityGroups && Array.isArray(response.SecurityGroups) && response.SecurityGroups.length > 0) {
				async.map(response.SecurityGroups, function (securityGroup, callback) {
					return callback(null, helper.computeVolumes({securityGroup, region: options.params.region}));
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * Create a new security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Update a security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Delete a security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function (options, cb) {
		return cb(null, true);
	}
};

module.exports = securityGroups;
