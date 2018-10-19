'use strict';

const async = require('async');
const helper = require('../../utils/helper.js');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');
const hash = require('object-hash');

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

				if(!options.params.group){
					return cb(new Error("Unable to list Virtual Machines, missing group value"));
				}

				async.auto({

					getVirtualMachine: function(callback) {
						computeClient.virtualMachines.get(options.params.group, options.params.vmName, function (error, vmInfo) {
							if(error) return callback(error);
							return callback(null, vmInfo);
						});
					},

					listNetworkExtras: function(callback) {
						return helper.listNetworkExtras(networkClient, {group: options.params.group.toLowerCase(), log: options.soajs.log }, callback);
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
							if(options.params.raw === true ){
                                vmRecordOptions.raw = true;
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

				if(!options.params.group){
					return cb(new Error("Unable to list Virtual Machines, missing group value"));
				}

				let group = options.params.group.toLowerCase();
				let network = options.params.network ? options.params.network: null;
				async.auto({
					listVirtualMachines: function(callback) {
						computeClient.virtualMachines.list(group, function (error, vms) {
							if (error) return callback(error);
							if (!vms || vms.length === 0) return callback(null, []);
							else {
								return callback(null, vms);
							}
						});
					},

					listNetworkExtras: function(callback) {
						return helper.listNetworkExtras(networkClient, { group, log: options.soajs.log }, callback);
					}

				}, function(error, results) {
					utils.checkError(error, 704, cb, () => {
						async.concat(results.listVirtualMachines, function (oneVm, callback) {
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
								if (network && vmRecordOptions.virtualNetworkName !== network){
									return callback();
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
				async.map(options.params.ids, (oneId, callback) => {
					options.params.vmName = oneId;
					options.params.raw = true;
                    vms.inspect(options, function (error, vmInfo) {
                        if(error) return callback(error);
                        callback(null, vmInfo);
					})
				}, (err, vms) => {
					if(err) return cb(err);

					async.series({
						'validateVm' : (mCb) => {
							let images = [];
							let valid = true;
							if (options.params.release) {
								return mCb();
							}
							async.forEach(vms, (oneVm, iCb) => {
								if (!oneVm.executeCommand) {
                                    valid = false;
                                    return iCb('Cannot execude command in this virtual machine')
								}

                                let image = hash(oneVm.raw.storageProfile.imageReference);
                                if (images.length === 0) {
                                    images.push(image);
                                }
                                else {
                                    valid = images.indexOf(image) !== -1;
                                    images.push(image);
                                }
								if (!valid) {
									return iCb('We are unable to onBoard your VM instance because we detected a mismatch between the Operating Systems of the Virtual Machine Instance.')
								}

								return iCb();
							}, mCb)
						},
						'updateTags' : (mCb) => {
                            async.each(vms, (oneVm, lCb) => {
                            	let vmInfo = oneVm.raw;

                            	if(!vmInfo.tags) vmInfo.tags = {};
                            	let vmName = vmInfo.name;
                                if (options.params.release) {
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
                                        if (vmInfo.tags['soajs.onBoard']) {
                                            delete vmInfo.tags['soajs.onBoard']
                                        }
                                    }
                                    computeClient.virtualMachines.createOrUpdate(options.params.group, vmName, vmInfo, function (error, response) {
                                        if (error) {
                                            return lCb(error);
                                        }
                                        return lCb();
                                    });
                                } else {
                                	let tags = {
                                		'soajs.env.code' : options.params.env,
                                		'soajs.layer.name' : options.params.layerName,
										'soajs.network.name': oneVm.network,
                                		'soajs.onBoard' : 'true',
									};
                                    async.every(Object.keys(tags), function (oneTag, callback) {
                                        return callback(null, vmInfo.tags[oneTag] && vmInfo.tags[oneTag] === tags[oneTag]);
                                    }, function (error, tagsAlreadyFound) {
                                        if (tagsAlreadyFound) {
                                            return lCb()
                                        }

                                        vmInfo.tags = Object.assign(vmInfo.tags, tags);
                                        if (options.params.setVmNameAsLabel) vmInfo.tags['soajs.vm.name'] = vmName;
                                        computeClient.virtualMachines.createOrUpdate(options.params.group, vmName, vmInfo, function (error, response) {
                                            if (error) return lCb(error);
                                            return lCb();
                                        });
                                    });
								}

							}, function (error) {
                                utils.checkError(error, 759, mCb, () => {
                                    return mCb();
                                });
                            });
						}
					},cb)
				});
			});
		});
	}
};

module.exports = vms;
