'use strict';

const async = require('async');
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const ips = {

    /**
    * List available ip addresses

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		ec2.describeAddresses({}, function (error, ips) {
			if (error) {
				return cb(error);
			}
			if (ips && ips.Addresses && Array.isArray(ips.Addresses)) {
				if (ips.Addresses.length > 0) {
					let ipList = [];

					ips.Addresses.forEach((oneIP) => {
						let tempObj = {};
						if (oneIP.PublicIp) tempObj.address = oneIP.PublicIp;
						if (oneIP.AllocationId) tempObj.id = oneIP.AllocationId;
						if (oneIP.Domain) tempObj.type = oneIP.Domain;
						tempObj.region = options.params.region;

						//TODO: confirm if the below parameters need to be mapped or not
						if (oneIP.InstanceId) tempObj.instanceId = oneIP.InstanceId;
						if (oneIP.NetworkInterfaceId) tempObj.network = oneIP.NetworkInterfaceId;
						if (oneIP.PrivateIpAddress) tempObj.privateAddress = oneIP.PrivateIpAddress;

						ipList.push(tempObj);
					});

					return cb(null, ipList);
				}
				else if (ips.Addresses.length === 0){
					return cb (null, []);
				}
		    }
		});
    },

    /**
    * Create a new ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			Domain: options.params.addressType
		};

		ec2.allocateAddress(params, function (error, response) {
			if (error) {
				return cb(error);
			}
			else {
				return cb(null, response);
			}
		});
    },

    /**
    * Update an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
		return cb(null, true);
    },

    /**
    * Delete an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			AllocationId: options.params.id
		};

		ec2.releaseAddress(params, function (error, response) {
			if (error) {
				return cb(error);
			}
			else {
				return cb(null, true);
			}
		});
    }
};

module.exports = ips;
