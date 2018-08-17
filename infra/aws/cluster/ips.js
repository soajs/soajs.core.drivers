'use strict';

const utils = require("../utils/utils");
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
			if (ips && ips.Addresses && Array.isArray(ips.Addresses) && ips.Addresses.length > 0) {
				let ipList = [];

				ips.Addresses.forEach((oneIP) => {
					let tempObj = {};
					if (oneIP.PublicIp) tempObj.address = oneIP.PublicIp;
					if (oneIP.AllocationId) tempObj.id = oneIP.AllocationId;
					if (oneIP.Domain) tempObj.type = oneIP.Domain;
					if (oneIP.InstanceId) tempObj.instanceId = oneIP.InstanceId;
					if (oneIP.PrivateIpAddress) tempObj.privateAddress = oneIP.PrivateIpAddress;

					tempObj.region = options.params.region;

					ipList.push(tempObj);
				});

				return cb(null, ipList);
			}
			else {
				return cb (null, []);
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

		ec2.allocateAddress(params, cb);
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
			AllocationId: options.params.name
		};

		ec2.releaseAddress(params, cb);
    }
};

module.exports = ips;
