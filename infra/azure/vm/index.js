'use strict';

const async = require('async');
const helper = require('./helper');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const groups = require('./lib/groups');
const ips = require('./lib/ips');
const loadBalancers = require('./lib/loadBalancers');
const networks = require('./lib/networks');
const images = require('./lib/images');
const maintenance = require('./lib/maintenance');

const driver = {

	/**
	* Get information about deployed vitual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	inspectService: function (options, cb) {
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
	listServices: function (options, cb) {
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
		return maintenance.restartService(options, cb);
	},

	/**
	* Redeploy a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	redeployService: function (options, cb) {
		return maintenance.redeployService(options, cb);
	},

	/**
	* Turn off a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	powerOffVM: function (options, cb) {
		return maintenance.powerOffVM(options, cb);
	},

	/**
	* Start a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	startVM: function (options, cb) {
		return maintenance.startVM(options, cb);
	},

	/**
	* List available resource groups

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listGroups: function(options, cb) {
		return groups.listGroups(options, cb);
	},

	/**
	* Create a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	createGroup: function (options, cb) {
		return groups.createGroup(options, cb);
	},

	/**
	* Update a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateGroup: function (options, cb) {
		return groups.updateGroup(options, cb);
	},

	/**
	* Delete a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteGroup: function (options, cb) {
		return groups.deleteGroup(options, cb);
	},

	/**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmSizes: function (options, cb) {
		options.soajs.log.debug(`Listing available virtual machine sizes in ${options.params.region} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineSizes.list(options.params.region, function (error, vmSizes) {
					utils.checkError(error, 709, cb, () => {
						async.map(vmSizes, function(onevmSize, callback) {
							return callback(null, helper.buildVmSizes({ vmSize: onevmSize }));
						}, function(error, vmSizesList) {
							return cb(null, vmSizesList);
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machine image publishers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublishers: function (options, cb) {
		return images.listVmImagePublishers(options, cb);
	},

	/**
	* List available virtual machine image publisher images

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublisherOffers: function (options, cb) {
		return images.listVmImagePublisherOffers(options, cb);
	},

	/**
	* List available virtual machine image versions

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImageVersions: function (options, cb) {
		return images.listVmImageVersions(options, cb);
	},

	/**
	* List available Networks

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/

	listNetworks: function (options, cb) {
		options.soajs.log.debug(`Listing Networks for resourcegroup ${options.params.group} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.virtualNetworks.list(options.params.group, function (error, networks) {
					utils.checkError(error, 731, cb, () => {
						async.map(networks, function(oneNetwork, callback) {
							return callback(null, helper.buildNetworkRecord({ network: oneNetwork }));
						}, function(error, networksList) {
							return cb(null, networksList);
						});
					});
				});
			});
		});
	},

	/**
	* List available loadbalancers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/

	listLoadBalancers: function (options, cb) {
		options.soajs.log.debug(`Listing laod balancers for resourcegroup ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.loadBalancers.list(options.params.group, function (error, loadBalancers) {
					utils.checkError(error, 732, cb, () => {
						async.map(loadBalancers, function(oneloadBalancer, callback) {
							return callback(null, helper.buildLoadBalancerRecord({ loadBalancer: oneloadBalancer }));
						}, function(error, loadBalancersList) {
							return cb(null, loadBalancersList);
						});

					});
				});
			});
		});
	},

	/**
	* List available subnets

	* @param  {Object}   options  Data passed to function listsubas params
	* @param  {Function} cb    Callback fspub
	* @return {void}listsub
	*/
	listSubnets: function (options, cb) {
		options.soajs.log.debug(`Listing subnets for  ${options.params.group} and virtual network name ${options.params.virtualNetworkName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.subnets.list(options.params.group, options.params.virtualNetworkName, function (error, subnets) {
					utils.checkError(error, 733, cb, () => {
						async.map(subnets, function(oneSubnet, callback) {
							return callback(null, helper.bulidSubnetsRecord({ subnet: oneSubnet }));
						}, function(error, subnetsList) {
							return cb(null, subnetsList);
						});
					});
				});
			});
		});
	},

	/**
	* List available securitygroups

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/

	listSecurityGroups: function (options, cb) {
		options.soajs.log.debug(`Listing securityGroups for resourcegroup ${options.params.group} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId

				});
				networkClient.networkSecurityGroups.list(options.params.group,function (error, networkSecurityGroups) {
					utils.checkError(error, 734, cb, () => {
						async.map(networkSecurityGroups, function(oneNetworkSecurityGroup, callback) {
							return callback(null, helper.buildSecurityGroupsRecord({ networkSecurityGroups: oneNetworkSecurityGroup }));
						}, function(error, securityGroupsList) {
							return cb(null, securityGroupsList);
						});
					});
				});
			});
		});
	},


	/**
	* List available public ips

	* @param  {Object}   options
	* @param  {Function} cb
	* @return {void}
	*/
	listPublicIps: function (options, cb) {
		options.soajs.log.debug(`Listing public ips for resourcegroup ${options.params.group} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.publicIPAddresses.list(options.params.group,function (error, publicIPAddresses) {
					utils.checkError(error, 735, cb, () => {

						async.map(publicIPAddresses, function(onepublicIPAddresse, callback) {
							return callback(null, helper.buildPublicIPsRecord({ publicIPAddresse: onepublicIPAddresse }));
						}, function(error, PublicIpsList) {
							return cb(null, PublicIpsList);
						});
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
		return maintenance.runCommand(options, cb);
	},

	/**
	* Get logs of a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	getLogs: function(options, cb) {
		return maintenance.getLogs(options, cb);
	},
	
	/**
	* List data/os disks of a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listDisks: function (options, cb){
		options.soajs.log.debug(`Listing Data Disks for resourcegroup ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.disks.list(options.params.group, function (error, disks) {
					utils.checkError(error, 737, cb, () => {
						async.concat(disks, function(oneDisk, callback) {
							if(options.params && options.params.type) {
								// only return disks of type os
								if(options.params.type === 'os' && oneDisk.osType) {
									return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
								}
								// only return disks of type data
								else if (options.params.type === 'data' && !oneDisk.osType) {
									return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
								}
								// ignore disk
								else {
									return callback(null, []);
								}
							}

							// return all disks if no type is specified
							return callback(null, [helper.buildDiskRecord({ disk: oneDisk })]);
						}, function(error, disksList) {
							return cb(null, disksList);
						});
					});
				});
			});
		});
	}


};

module.exports = driver;
