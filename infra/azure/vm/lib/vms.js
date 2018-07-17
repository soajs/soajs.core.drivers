'use strict';

const async = require('async');
const helper = require('../../utils/helper.js');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const vms = {

    /**
	* Get information about deployed vitual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	inspect: function (options, cb) {
		options.soajs.log.debug(`Inspecting virtual machine ${options.params.vmName} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				async.auto({

					getVirtualMachine: function(callback) {
						computeClient.virtualMachines.get(options.params.group, options.params.vmName, function (error, vmInfo) {
							if(error) return callback(error);
							return callback(null, vmInfo);
						});
					},

					listNetworkExtras: function(callback) {
						return helper.listNetworkExtras(networkClient, { log: options.soajs.log }, callback);
					}

				}, function(error, results) {
					utils.checkError(error, 701, cb, () => {
						let opts = {
							vm: results.getVirtualMachine,
							log: options.soajs.log,
							extras: results.listNetworkExtras
						};
						let vmRecordOptions = { vm: results.getVirtualMachine };
						helper.getVmNetworkInfo(networkClient, opts, function (error, networkInfo) {
							if (error) {
								options.soajs.log.error(`Unable to get network information for ${results.getVirtualMachine.name} while inspecting`);
								options.soajs.log.error(error);
							}
							else {
								vmRecordOptions = Object.assign(vmRecordOptions, networkInfo);
								if(results.listNetworkExtras && results.listNetworkExtras.publicIps) {
									vmRecordOptions.publicIpsList = results.listNetworkExtras.publicIps;
								}
							}

							return cb(null, helper.buildVMRecord(vmRecordOptions));
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machines by subscription

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	list: function (options, cb) {
		options.soajs.log.debug(`Listing all virtual machines in ${options.params.group ? options.params.group : 'all environments'} and all custom vms`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				const resourceClient = driverUtils.getConnector({
					api: 'resource',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				let group = options.params && options.params.group ? options.params.group.toLowerCase() : null;

				async.auto({

					listVirtualMachines: function(callback) {
						computeClient.virtualMachines.listAll(function (error, vms) {
							if(error) return callback(error);
							if (!vms || vms.length === 0) return callback(null, []);
							return helper.filterVMs(group, vms, callback);
						});
					},

					listNetworkExtras: function(callback) {
						return helper.listNetworkExtras(networkClient, { log: options.soajs.log }, callback);
					}

				}, function(error, results) {
					utils.checkError(error, 704, cb, () => {
						async.map(results.listVirtualMachines, function (oneVm, callback) {
							let opts = {
								vm: oneVm,
								log: options.soajs.log,
								extras: results.listNetworkExtras
							};

							let vmRecordOptions = { vm: oneVm };
							helper.getVmNetworkInfo(networkClient, opts, function (error, networkInfo) {
								if (error) {
									options.soajs.log.error(`Unable to get network information for ${oneVm.name} while inspecting`);
									options.soajs.log.error(error);
								}
								else {
									vmRecordOptions = Object.assign(vmRecordOptions, networkInfo);
									if(results.listNetworkExtras && results.listNetworkExtras.publicIps) {
										vmRecordOptions.publicIpsList = results.listNetworkExtras.publicIps;
									}
								}

								return callback(null, helper.buildVMRecord(vmRecordOptions));
							});
						}, cb);
					});
				});
			});
		});
	},

	/**
	* Update labels of one or more vm instances

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateVmLabels: function(options, cb) {
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				async.each(options.params.vmNames, (vmName, callback) => {
					computeClient.virtualMachines.get(options.params.group, vmName, function (error, vmInfo) {
						if(error) return callback(error);
						let tags = options.params.labels ? options.params.labels : {};
						if(!vmInfo.tags) vmInfo.tags = {};

						if (Object.keys(tags).length === 0) {
                            if (Object.keys(vmInfo.tags).length > 0) {
                            	if (vmInfo.tags['soajs.env.code']) {
                            		delete vmInfo.tags['soajs.env.code']
								}
								if (vmInfo.tags['soajs.layer.name']) {
                            		delete vmInfo.tags['soajs.layer.name']
								}
								if (vmInfo.tags['soajs.network.name']) {
                            		delete vmInfo.tags['soajs.network.name']
								}
								if (vmInfo.tags['soajs.vm.name']) {
                            		delete vmInfo.tags['soajs.vm.name']
								}
							}
                            computeClient.virtualMachines.createOrUpdate(options.params.group, vmName, vmInfo , function (error, response) {
                                if(error) return callback(error);
                                return callback();
                            });
						} else {
                            // check if tags are already set, return callback and do no update
                            async.every(Object.keys(tags), function(oneTag, callback) {
                                return callback(null, vmInfo.tags[oneTag] && vmInfo.tags[oneTag] === tags[oneTag]);
                            }, function(error, tagsAlreadyFound) {
                                if(tagsAlreadyFound) return callback();

                                vmInfo.tags = Object.assign(vmInfo.tags, tags);
                                if(options.params.setVmNameAsLabel) vmInfo.tags['soajs.vm.name'] = vmName;

                                computeClient.virtualMachines.createOrUpdate(options.params.group, vmName, vmInfo , function (error, response) {
                                    if(error) return callback(error);
                                    return callback();
                                });
                            });
						}
					});
				}, function(error) {
					utils.checkError(error, 759, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	}
};

module.exports = vms;
