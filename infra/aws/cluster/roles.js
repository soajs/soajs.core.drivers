'use strict';
const async = require('async');
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const certificates = {
	
	/**
	 * List available roles
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function (options, cb) {
		const aws = options.infra.api;
		const iam = getConnector({
			api: 'iam',
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		iam.listRoles({PathPrefix: "/"}, function (err, data) {
			if (err) return cb(err);
			let roles = [];
			if (data && data.Roles){
				async.each(data.Roles, function (oneRole, callback) {
					try {
						let doc = decodeURIComponent(oneRole.AssumeRolePolicyDocument);
						doc = JSON.parse(doc);
						if (doc && doc.Statement) {
							async.detect(doc.Statement, function (statement, callback) {
								callback(null, statement.Principal && statement.Principal.Service && statement.Principal.Service === "ec2.amazonaws.com");
							}, (err, found) => {
								if (found) {
									roles.push({name: oneRole.RoleName});
								}
								return callback();
							});
						}
						else {
							return callback();
						}
					}
					catch (e) {
						return callback();
					}
				}, function () {
					return cb(null, roles);
				});
			}
			else {
				return cb(null, roles);
			}
		});
	},
	
	/**
	 * Create a new role
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function (options, cb) {
		return cb(null, true);
	},
	
	
	/**
	 * Update a role
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Delete a role
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function (options, cb) {
		return cb(null, true);
	},
	
};

module.exports = certificates;
