'use strict';

const async = require('async');
const utils = require("../utils/utils");
const config = require("../config");
const helper = require('../utils/helper.js');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const subnets = {
	
	/**
	 * List available subnets
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}listsub
	 */
	list: function (options, cb) {
		const aws = options.infra.api;
		
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			Filters: [
				{
					Name: "vpc-id",
					Values: [
						options.params.network
					]
				}
			]
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property
		ec2.describeSubnets(params, function (err, response) {
			if (err) {
				return cb(err);
			}
			if (response && response.Subnets && Array.isArray(response.Subnets) && response.Subnets.length > 0) {
				async.map(response.Subnets, function (subnet, callback) {
					return callback(null, helper.buildSubnetkRecord({subnet}));
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * Create a new subnet
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}listsub
	 */
	create: function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Update an existing subnet
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}listsub
	 */
	update: function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Delete a subnet
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}listsub
	 */
	delete: function (options, cb) {
		return cb(null, true);
	}
	
};

module.exports = subnets;
