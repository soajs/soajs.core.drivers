'use strict';

const utils = require("../utils/utils");

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const keyPairs = {

    /**
    * List available keypairs

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

		ec2.describeKeyPairs({}, function (error, keyPairs) {
			if (error) {
				return cb(error);
			}
			if (keyPairs && keyPairs.KeyPairs && Array.isArray(keyPairs.KeyPairs) && keyPairs.KeyPairs.length > 0) {
				let keyPairList = [];

				keyPairs.KeyPairs.forEach((oneKeyPair) => {
					let tempObj = {};
					if (oneKeyPair.KeyName) tempObj.name = oneKeyPair.KeyName;
					if (oneKeyPair.KeyFingerprint) tempObj.fingerprint = oneKeyPair.KeyFingerprint;
					tempObj.region = options.params.region;

					if (Object.keys(tempObj).length > 1) {
						keyPairList.push(tempObj);
					}
				});

				return cb(null, keyPairList);
			}
			else {
				return cb (null, []);
			}
		});
    },

    /**
    * Create a new keypair

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
			KeyName: options.params.name
		};

		ec2.createKeyPair(params, function (error, response) {
			if (error) {
				return cb(error);
			}
			else {
				let keyPair = {};

				if (response.KeyFingerprint) keyPair.fingerprint = response.KeyFingerprint;
				if (response.KeyName) keyPair.name = response.KeyName;
				keyPair.region = options.params.region;

				if (response.KeyMaterial) keyPair.privateKey = response.KeyMaterial;

				if (Object.keys(keyPair).length > 2) {
					return cb(null, keyPair);
				}
				else {
					return cb(null, {});
				}
			}
		});
    },

    /**
    * Update a keypair

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
		return cb(null, true);
    },

    /**
    * Delete a keypair

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
			KeyName: options.params.name
		};

		ec2.deleteKeyPair(params, cb);
    }
};

module.exports = keyPairs;
