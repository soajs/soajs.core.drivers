'use strict';

const utils = require('../../utils/utils.js');
const async = require('async');
const config = require("../../config");
const _ = require('lodash');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const maintenance = {

	/**
	 * Delete a virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteService: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string") {
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0) {
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.terminateInstances(params, cb);
	},

	/**
	 * Restart a virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	restartService: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string") {
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0) {
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.rebootInstances(params, cb);
	},

	/**
	 * Redeploy a virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	redeployService: function (options, cb) {
		return cb(null, true);
	},

	/**
	 * Turn off a virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	powerOffVM: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string") {
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0) {
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.stopInstances(params, cb);
	},

	/**
	 * Start a virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	startVM: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string") {
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0) {
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.startInstances(params, cb);
	},

	/**
	 * Execute a command inside a running virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	runCommand: function (options, cb) {
		//vmName
		//.env
		//command
		//args
		//region
		let script = [];
		if (options.params.command && Array.isArray(options.params.command)) script = script.concat(options.params.command); // add command
		if (options.params.args && Array.isArray(options.params.args)) script = script.concat(options.params.args); // add command arguments
		if (options.params.env && Array.isArray(options.params.env)) script = script.concat(options.params.env.map(oneEnv => `export ${oneEnv}`)); // export environment variables
		if (script.length === 0) {
			return cb(null, true);
		}
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const iam = getConnector({
			api: 'iam',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const ssm = getConnector({
			api: 'ssm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		ec2.describeInstances({
			InstanceIds: [
				options.params.vmName
			]
		}, (err, response) => {
			if (err) {
				return cb(err);
			}
			if (response && response.Reservations && response.Reservations[0] && response.Reservations[0].Instances && response.Reservations[0].Instances[0]) {
				let vm = response.Reservations[0].Instances[0];
				if (!vm.IamInstanceProfile || !vm.IamInstanceProfile.Arn) {
					return cb(new Error(`${options.params.vmName} machine does not have the required policy: ${config.aws.ssmSupportedPolicy.join(",")}`));
				}
				else {
					let arn = vm.IamInstanceProfile.Arn.split("/");
					let role = arn[arn.length - 1];
					iam.listAttachedRolePolicies({
						RoleName: role, /* required */
					}, function (err, policies) {
						if (err) return cb(err);
						let instancePolicies = [];
						if (policies && policies.AttachedPolicies && policies.AttachedPolicies.length > 0) {
							async.each(policies.AttachedPolicies, function (onePolicy, callback) {
								instancePolicies.push(onePolicy.PolicyName);
								callback();
							}, function () {
								let notFound = _.differenceBy(config.aws.ssmSupportedPolicy, instancePolicies);
								if (notFound.length > 0) {
									return cb(new Error(`${options.params.vmName} machine does not have the required policy: ${config.aws.ssmSupportedPolicy.join(",")}`));
								}
								let params = {
									DocumentName: vm.Platform && vm.Platform === "windows" ? 'RunPowerShellScript' : 'AWS-RunShellScript', /* required */
									InstanceIds: [
										options.params.vmName
									],
									Parameters: {
										'commands': script,
										"executionTimeout": ["60"]
									},
									TimeoutSeconds: 60
								};
								ssm.sendCommand(params, cb);
							});
						}
					});
				}
			}
			else {
				return cb(new Error("VM not found!"));
			}
		});
	},

	/**
	 * Get logs of a running virtual machine

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	getLogs: function (options, cb) {
		return cb(null, true);
	},

};

module.exports = maintenance;
