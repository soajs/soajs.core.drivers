'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const maintenance = {

    /**
	* Delete a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteService: function (options, cb) {
		options.soajs.log.debug(`Deleting virtual machine ${options.params.serviceId} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				//todo: inspect service, get the needed details for the below if any
				async.series({
					"deleteVM": (mCb) =>{
						computeClient.virtualMachines.deleteMethod(options.params.group, options.params.id, mCb);
					}
					//todo: missing delete public ip address
					//todo: missing delete network interface
					//todo: missing delete network security group
					//todo: missing delete virtual network
					//todo: missing delete disk
				}, (error) => {
					if(error){
						options.soajs.log.error(error);
					}
				});
				return cb(null, true);
			});
		});
	},

    /**
	* Restart a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	restartService: function (options, cb) {
		options.soajs.log.debug(`Restarting virtual machine ${options.params.vmName} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.restart(options.params.group, options.params.vmName, function (error, result) {
					utils.checkError(error, 706, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
	},

	/**
	* Redeploy a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	redeployService: function (options, cb) {
		options.soajs.log.debug(`Redeploying virtual machine ${options.params.vmName} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.redeploy(options.params.group, options.params.vmName, function (error, result) {
					utils.checkError(error, 706, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},

	/**
	* Turn off a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	powerOffVM: function (options, cb) {
		options.soajs.log.debug(`Powering Off virtual machine ${options.params.vmName} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.powerOff(options.params.group, options.params.vmName, function (error, result) {
					utils.checkError(error, 702, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
	},

	/**
	* Start a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	startVM: function (options, cb) {
		options.soajs.log.debug(`Starting virtual machine ${options.params.vmName} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.start(options.params.group, options.params.vmName, function (error, result) {
					utils.checkError(error, 703, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
	},

    /**
	* Execute a command inside a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	runCommand: function(options, cb) {
		options.soajs.log.debug(`Running command in virtual machine`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				let script = [];
				if(options.params.env && Array.isArray(options.params.env)) script = script.concat(options.params.env.map(oneEnv => `export ${oneEnv}`)); // export environment variables
				if(options.params.command && Array.isArray(options.params.command)) script = script.concat(options.params.command); // add command
				if(options.params.args && Array.isArray(options.params.args)) script = script.concat(options.params.args); // add command arguments

				let params = { commandId: 'RunShellScript', script: script };
				computeClient.virtualMachines.runCommand(options.params.group, options.params.vmName, params, function(error, result) {
					utils.checkError(error && error.body && error.body.code === 'Conflict'
						&& error.body.message.includes("Run command extension execution is in progress. Please wait for completion before invoking a run command."),
						766, cb, () => {
						utils.checkError(error, 736, cb, () => {
							return cb(null, result);
						});
					});
				});
			});
		});
	},

	/**
	* Get logs of a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	getLogs: function(options, cb) {
		utils.checkError(!options.params, 736, cb, () => {
			let numberOfLines = options.params.numberOfLines || 200;
			options.params.command = [ `journalctl -r --lines ${numberOfLines}` ];
			return maintenance.runCommand(options,cb);
		});
	},

};

module.exports = maintenance;
