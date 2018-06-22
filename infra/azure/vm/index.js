'use strict';

const async = require('async');
const helper = require('./helper');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const driver = {

	/**
	* Get information about deployed vitual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	inspectService: function (options, cb) {
		options.soajs.log.debug(`Inspecting virtual machine ${options.params.vmName} in resource group ${options.env}`);
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
				computeClient.virtualMachines.get(options.env, options.params.vmName, function (error, vmInfo) {
					utils.checkError(error, 701, cb, () => {
						let vmRecordOptions = {vm: vmInfo};
						helper.getVmNetworkInfo(networkClient, {vm: vmInfo}, function (error, networkInfo) {
							if (error) {
								options.soajs.log.error(`Unable to get network information for ${vmInfo.name} while inspecting`);
								options.soajs.log.error(error);
							}
							else {
								vmRecordOptions.securityGroup = networkInfo.securityGroup;
								vmRecordOptions.publicIp = networkInfo.publicIp;
								vmRecordOptions.subnet = networkInfo.subnet;
								vmRecordOptions.virtualNetworkName = networkInfo.virtualNetworkName;
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
		options.soajs.log.debug(`Listing all virtual machines in ${options.env} and all custom vms`);
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

				computeClient.virtualMachines.listAll(function (error, vms) {
					utils.checkError(error, 704, cb, () => {
						if (!(vms && Array.isArray(vms))) {
							return cb(null, []);
						}

						helper.filterVMs(group, vms, function (error, filteredVms) {
							//no error is returned by function
							async.map(filteredVms, function (oneVm, callback) {
								let vmRecordOptions = {vm: oneVm};
								helper.getVmNetworkInfo(networkClient, {vm: oneVm}, function (error, networkInfo) {
									if (error) {
										options.soajs.log.error(`Unable to get network information for ${oneVm.name} while inspecting`);
										options.soajs.log.error(error);
									}
									else {
										vmRecordOptions.securityGroup = networkInfo.securityGroup;
										vmRecordOptions.publicIp = networkInfo.publicIp;
										vmRecordOptions.subnet = networkInfo.subnet;
										vmRecordOptions.virtualNetworkName = networkInfo.virtualNetworkName;
									}

									return callback(null, helper.buildVMRecord(vmRecordOptions));
								});
							}, cb);
						});
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
						return cb(null, true);
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
		options.soajs.log.debug(`Redeploying virtual machine ${options.params.vmName} in resource group ${options.env}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.redeploy(options.env, options.params.vmName, function (error, result) {
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
	* Delete a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteResourceGroup: function (options, cb) {
		options.soajs.log.debug(`Deleting resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const resourceClient = driverUtils.getConnector({
					api: 'resource',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				resourceClient.resourceGroups.deleteMethod(options.params.group, function (error, result) {
					utils.checkError(error, 708, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
	},

	/**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmSizes: function (options, cb) {
		options.soajs.log.debug(`Listing available virtual machine sizes in ${options.params.location} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineSizes.list(options.params.location, function (error, vmSizes) {
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
		options.soajs.log.debug(`Listing virtual machine image publishers in ${options.params.location} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listPublishers(options.params.location, function (error, imagePublishers) {
					utils.checkError(error, 710, cb, () => {
						async.map(imagePublishers, function(oneimagePublisher, callback) {
							return callback(null, helper.buildVmImagePublisherssRecord({ imagePublisher: oneimagePublisher }));
						}, function(error, imagePublishersList) {
							return cb(null, imagePublishersList);
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machine image publisher images

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublisherOffers: function (options, cb) {
		options.soajs.log.debug(`Listing vm image offers for publisher ${options.params.publisher} in ${options.params.location} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listOffers(options.params.location, options.params.publisher, function (error, imageOffers) {
					utils.checkError(error, 711, cb, () => {
						async.map(imageOffers, function(oneimageOffer, callback) {
							return callback(null, helper.buildVmImagePublishersOffersRecord({ imageOffer: oneimageOffer }));
						}, function(error, imageOffersList) {
							return cb(null, imageOffersList);
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machine image versions

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImageVersions: function (options, cb) {
		options.soajs.log.debug(`Listing vm image versions for publisher ${options.params.publisher} and offer ${options.params.offer} in ${options.params.location} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listSkus(options.params.location, options.params.publisher, options.params.offer, function (error, imageVersions) {
					utils.checkError(error, 712, cb, () => {
						async.map(imageVersions, function(oneimageVersion, callback) {
							return callback(null, helper.buildVmImageVersionsRecord({ imageVersion: oneimageVersion }));
						}, function(error, imageVersionsList) {
							return cb(null, imageVersionsList);
						});
					});
				});
			});
		});
	},


	/**
	* List available Networks

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/

	listNetworks: function (options, cb) {
		options.soajs.log.debug(`Listing Networks for resourcegroup ${options.params.resourceGroupName} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.virtualNetworks.list(options.params.resourceGroupName, function (error, networks) {
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
		options.soajs.log.debug(`Listing laod balancers for resourcegroup ${options.params.resourceGroupName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.loadBalancers.list(options.params.resourceGroupName, function (error, loadBalancers) {
					utils.checkError(error, 732, cb, () => {
						async.map(loadBalancers, function(oneloadBalancer, callback) {
							return callback(null, helper.buildLoadBalancersRecord({ loadBlanacer: oneloadBalancer }));
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
		options.soajs.log.debug(`Listing subnets for  ${options.params.resourceGroupName} and virtual network name ${options.params.virtualNetworkName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.subnets.list(options.params.resourceGroupName, options.params.virtualNetworkName, function (error, subnets) {
					utils.checkError(error, 733, cb, () => {
						async.map(subnets, function(oneSubnet, callback) {
							return callback(null, helper.bulidSubnetsRecord({ subnets: oneSubnet }));
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
		options.soajs.log.debug(`Listing securityGroups for resourcegroup ${options.params.resourceGroupName} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId

				});
				networkClient.networkSecurityGroups.list(options.params.resourceGroupName,function (error, networkSecurityGroups) {
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
		options.soajs.log.debug(`Listing public ips for resourcegroup ${options.params.resourceGroupName} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				networkClient.publicIPAddresses.list(options.params.resourceGroupName,function (error, publicIPAddresses) {
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
			return driver.runCommand(options,cb);
		});
	},
	/**
	* List data/os disks of a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listDisks: function (options, cb){
		options.soajs.log.debug(`Listing Data Disks for resourcegroup ${options.params.resourceGroupName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.disks.list(options.params.resourceGroupName, function (error, disks) {
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
