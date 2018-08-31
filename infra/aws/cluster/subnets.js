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
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			CidrBlock: options.params.address, /* required */
			VpcId: options.params.network, /* required */
			DryRun: false,
		};
		if (options.params.zone) {
			params.AvailabilityZone = options.params.zone
		}
		if (options.params.ipv6Address) {
			params.Ipv6CidrBlock = options.params.ipv6Address
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#createSubnet-property
		ec2.createSubnet(params, (err, response) => {
			if (err) {
				return cb(err);
			}
			if (response.Subnet &&  response.Subnet.SubnetId && options.params.name){
				params = {
					Resources: [
						response.Subnet.SubnetId
					],
					Tags: [
						{
							Key: "Name",
							Value: options.params.name
						}
					]
				};
				ec2.createTags(params, function(err) {
					options.soajs.log.error(err);
					return cb(null, response);
				});
			}
			else {
				return cb(null, response);
			}
		});
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
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			SubnetId: options.params.subnet, /* required */
			DryRun: false,
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#createSubnet-property
		ec2.deleteSubnet(params, cb);
	}
	
};

module.exports = subnets;
