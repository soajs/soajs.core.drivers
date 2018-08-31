'use strict';

const async = require('async');
const utils = require("../../utils/utils");
const helper = require('../../utils/helper.js');
const config = require("../../config");
function getConnector(opts) {
	return utils.getConnector(opts, config);
}
const disks = {

	/**
	 * List available disks

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
		//todo
		ec2.describeVolumes({}, (err, response)=>{
			if(err){
				return cb(err);
			}
			if (response && response.Volumes && Array.isArray(response.Volumes) && response.Volumes.length > 0) {
				async.map(response.Volumes, function (volumes, callback) {
					return callback(null, helper.computeVolumes({volumes}));
				}, cb);
			}
			else {
				return cb (null, []);
			}
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
