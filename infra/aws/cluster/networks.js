'use strict';

const async = require('async');
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');
const subnetDriver = require('./subnets.js');

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const networks = {
	
	/**
	 * List available networks
	 
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
		
		ec2.describeVpcs({}, function (err, networks) {
			if (err) {
				return cb(err);
			}
			if (networks && networks.Vpcs && Array.isArray(networks.Vpcs) && networks.Vpcs.length > 0) {
				async.map(networks.Vpcs, function (network, callback) {
					options.params.network = network.VpcId;
					subnetDriver.list(options, (err, subnets) => {
						return callback(err, helper.buildNetworkRecord({
							network,
							region: options.params.region,
							subnets
						}));
					});
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * Create a new network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
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
			AmazonProvidedIpv6CidrBlock: options.params.Ipv6Address || false,
			DryRun: false,
			InstanceTenancy: options.params.InstanceTenancy || "default", // "host" || "dedicated" || "default"
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#createVpc-property
		ec2.createVpc(params, function (err, response) {
			if (err) {
				return cb(err);
			}
			return cb(null, response);
		});
	},
	
	/**
	 * Update a network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		//update tenancy to default
		//associate a new address
		//disassociate an address other than primary
		return cb(null, true);
	},
	
	/**
	 * Delete a network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
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
			network: options.params.network, /* required */
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteVpc-property
		ec2.deleteVpc(params, function (err, response) {
			if (err) {
				return cb(err);
			}
			return cb(null, response);
		});
	}
	
};

module.exports = networks;
