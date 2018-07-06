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
const securityGroups = require('./lib/securityGroups');
const disks = require('./lib/disks');
const sizes = require('./lib/sizes');

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
		return maintenance.deleteService(options, cb);
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
		return sizes.list(options, cb);
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
		return networks.list(options, cb);
	},

	/**
	* Create network

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	createNetwork: function (options, cb) {
		return networks.create(options, cb);
	},

	/**
	* Update network

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateNetwork: function (options, cb) {
		return networks.update(options, cb);
	},

	/**
	* Delete network

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteNetwork: function (options, cb) {
		return networks.delete(options, cb);
	},

	/**
	* List available loadbalancers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listLoadBalancers: function (options, cb) {
		return loadBalancers.list(options, cb);
	},

	/**
	* Create loadbalancer

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	createLoadBalancer: function (options, cb) {
		return loadBalancers.create(options, cb);
	},

	/**
	* Update loadbalancer

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateLoadBalancer: function (options, cb) {
		return loadBalancers.update(options, cb);
	},

	/**
	* Delete loadbalancer

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteLoadBalancer: function (options, cb) {
		return loadBalancers.delete(options, cb);
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
		return securityGroups.list(options, cb);
	},

	/**
	* Create security group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	createSecurityGroup: function (options, cb) {
		return securityGroups.create(options, cb);
	},

	/**
	* Update security group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateSecurityGroup: function (options, cb) {
		return securityGroups.update(options, cb);
	},

	/**
	* Delete security group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteSecurityGroup: function (options, cb) {
		return securityGroups.delete(options, cb);
	},

	/**
	* List available public ips

	* @param  {Object}   options
	* @param  {Function} cb
	* @return {void}
	*/
	listPublicIps: function (options, cb) {
		return ips.list(options, cb);
	},

	/**
	* Create public ip

	* @param  {Object}   options
	* @param  {Function} cb
	* @return {void}
	*/
	createPublicIp: function (options, cb) {
		return ips.create(options, cb);
	},

	/**
	* Update public ip

	* @param  {Object}   options
	* @param  {Function} cb
	* @return {void}
	*/
	updatePublicIp: function (options, cb) {
		return ips.update(options, cb);
	},

	/**
	* Delete public ip

	* @param  {Object}   options
	* @param  {Function} cb
	* @return {void}
	*/
	deletePublicIp: function (options, cb) {
		return ips.delete(options, cb);
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
		return disks.list(options, cb);
	}


};

module.exports = driver;
