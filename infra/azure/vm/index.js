'use strict';

const async = require('async');
const helper = require('./helper');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const driver = {
	/**
	* Create a virtual machine on MS Azure

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deployService: function (options, cb) {
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
				const storageClient = driverUtils.getConnector({
					api: 'storage',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				const resourceClient = driverUtils.getConnector({
					api: 'resource',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});

				async.auto({

					createResourceGroup: function (callback) {
						let opts = {
							resourceGroupName: options.env,
							location: options.params.location,
							// tags: options.params.resourceGroup.tags || {}
						};
						options.soajs.log.debug(`Creating resource group ${opts.resourceGroupName}`);
						return helper.createResourceGroup(resourceClient, opts, function (error, resourceGroup) {
							if (error) return callback({error, code: 714});
							return callback(null, resourceGroup);
						});
					},
					createStorageAccount: ['createResourceGroup', function (result, callback) {
						//NOTE: if not a managed disk, need to create a storage account manually and link it to vm
						return callback();
						// let opts = {
						//     resourceGroupName: result.createResourceGroup.name,
						//     location: options.params.location,
						//     accountName: 'storageaccount', //TODO: make dynamic, must be between 3 and 24 characters in length and use numbers and lower-case letters only
						//     accountType: 'Standard_LRS', //TODO: make dynamic
						//     accountKind: (options.params.storageAccount && options.params.storageAccount.accountType) ? options.params.storageAccount.accountType: 'Storage',
						//     tags: (options.params.storageAccount && options.params.storageAccount.tags) ? options.params.storageAccount.tags : {}
						// };
						// options.soajs.log.debug(`Creating storage account ${options.params.accountName}`);
						// return helper.createStorageAccount(storageClient, opts, callback);
					}],
					createVirtualNetwork: ['createResourceGroup', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							location: options.params.location,
							vnetName: `${result.createResourceGroup.name}-${options.params.instance.name}-vnet`,
							addressPrefixes: (options.params.virtualNetwork && options.params.virtualNetwork.addressPrefixes) ? options.params.virtualNetwork.addressPrefixes : null,
							dhcpServers: (options.params.virtualNetwork && options.params.virtualNetwork.dhcpServers) ? options.params.virtualNetwork.dhcpServers : null,
							subnets: (options.params.virtualNetwork && options.params.virtualNetwork.subnets) ? options.params.virtualNetwork.subnets : null
						};
						options.soajs.log.debug(`Creating virtual network ${opts.vnetName}`);
						return helper.createVirtualNetwork(networkClient, opts, function (error, virtualNetwork) {
							if (error) return callback({error, code: 715});

							return callback(null, virtualNetwork);
						});
					}],
					getSubnetInfo: ['createResourceGroup', 'createVirtualNetwork', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							vnetName: result.createVirtualNetwork.name,
							subnetName: (result.createVirtualNetwork.subnets &&
								result.createVirtualNetwork.subnets[0] &&
								result.createVirtualNetwork.subnets[0].name) ? result.createVirtualNetwork.subnets[0].name : null
							};
							options.soajs.log.debug(`Getting subnet information ${opts.subnetName}`);
							return helper.getSubnetInfo(networkClient, opts, function (error, subnetInfo) {
								if (error) return callback({error, code: 716});

								return callback(null, subnetInfo);
							});
					}],
					createPublicIP: ['createResourceGroup', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							location: options.params.location,
							publicIPName: `${result.createResourceGroup.name}-${options.params.instance.name}-ip`,
							publicIPAllocationMethod: (options.params.publicIP && options.params.publicIP.allocationMethod) ? options.params.publicIP.allocationMethod : 'Dynamic',
							// domainNameLabel: options.params.publicIP.domainNameLabel
						};
						options.soajs.log.debug(`Creating public IP address ${opts.publicIPName}`);
						return helper.createPublicIP(networkClient, opts, function (error, publicIP) {
							if (error) return callback({error, code: 717});

							return callback(null, publicIP);
						});
					}],
					createNetworkSecurityGroup: ['createResourceGroup', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							location: options.params.location,
							networkSecurityGroupName: `${result.createResourceGroup.name}-${options.params.instance.name}-nsg`,

							//NOTE: azure package function not working properly, passing these options to make an api call direclty
							bearerToken: authData.credentials.tokenCache._entries[0].accessToken,
							subscriptionId: options.infra.api.subscriptionId,
						};

						if (options.params.instance && options.params.instance.ports) {
							opts.ports = options.params.instance.ports;
						}

						options.soajs.log.debug(`Creating network security group ${opts.networkSecurityGroupName}`);
						return helper.createNetworkSecurityGroup(networkClient, opts, function (error, networkSecurityGroup) {
							if (error) return callback({error, code: 718});

							return callback(null, networkSecurityGroup);
						});
					}],
					createNetworkInterface: ['createResourceGroup', 'getSubnetInfo', 'createPublicIP', 'createNetworkSecurityGroup', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							location: options.params.location,
							networkInterfaceName: `${result.createResourceGroup.name}-${options.params.instance.name}-ni`,
							ipConfigName: `${result.createResourceGroup.name}-${options.params.instance.name}-ipConfig`,
							subnetInfo: result.getSubnetInfo,
							publicIPInfo: result.createPublicIP,
							publicIPAllocationMethod: result.createPublicIP.publicIPAllocationMethod || 'Dynamic',
							networkSecurityGroupName: result.createNetworkSecurityGroup.id
						};
						options.soajs.log.debug(`Creating network interface ${opts.networkInterfaceName}`);
						return helper.createNetworkInterface(networkClient, opts, function (error, networkInterface) {
							if (error) return callback({error, code: 719});

							return callback(null, networkInterface);
						});
					}],
					getVMImage: function (callback) {
						let opts = {
							location: options.params.location,
							publisher: options.params.image.prefix,
							offer: options.params.image.name,
							sku: options.params.image.tag
						};
						options.soajs.log.debug(`Finding VM image ${opts.publisher} - ${opts.offer} - ${opts.sku}`);
						return helper.getVMImage(computeClient, opts, function (error, image) {
							if (error) return callback({error, code: 720});

							return callback(null, image);
						});
					},
					getNetworkInterfaceInfo: ['createResourceGroup', 'createNetworkInterface', function (result, callback) {
						//NOTE: might not be needed
						return callback();
						// let opts = {
						//     resourceGroupName: result.createResourceGroup.name,
						//     networkInterfaceName: result.createNetworkInterface.name
						// };
						// options.soajs.log.debug(`Getting network interface information ${opts.networkInterfaceName}`);
						// return helper.getNetworkInterfaceInfo(networkClient, opts, callback);
					}],
					createVirtualMachine: ['createResourceGroup', 'createStorageAccount', 'createVirtualNetwork', 'createPublicIP', 'createNetworkInterface', 'getVMImage', function (result, callback) {
						let opts = {
							resourceGroupName: result.createResourceGroup.name,
							location: options.params.location,
							vmName: options.params.instance.name,
							adminUsername: options.params.instance.admin.username,
							vmSize: options.params.instance.size,
							image: {
								publisher: options.params.image.prefix,
								offer: options.params.image.name,
								sku: options.params.image.tag,
								version: result.getVMImage.name
							},
							disk: {
								osDiskName: options.params.instance.osDiskName,
								storageAccountType: options.params.instance.storageAccountType || 'Standard_LRS'//result.createStorageAccount.name
							},
							network: {
								networkInterfaceId: result.createNetworkInterface.id
							},
							tags: options.params.labels
						};

						//check if password or SSH token
						if (options.params.instance.admin.password) {
							opts.adminPassword = options.params.instance.admin.password;
						}
						else if (options.params.instance.admin.token) {
							opts.adminPublicKey = options.params.instance.admin.token;
						}

						if (options.params.instance && options.params.instance.env) {
							opts.envs = options.params.instance.env;
						}

						if (options.params.instance && options.params.instance.command) {
							opts.command = options.params.instance.command;
						}

						options.soajs.log.debug(`Creating virtual machine ${opts.vmName}`);
						return helper.createVirtualMachine(computeClient, opts, function (error, vmInfo) {
							if (error) return callback({error, code: 721});
							return callback(null, vmInfo);
						});
					}]

				}, function (error, result) {
					utils.checkError(error && error.error, error && error.code, cb, () => {
						return cb(null, helper.buildVMRecord({vm: result.createVirtualMachine}));
					});
				});
			});
		});
	},

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

				resourceClient.resourceGroups.checkExistence(options.env, function (error, exists) {
					utils.checkError(error, 704, cb, () => {
						if (!exists) {
							return cb(null, []);
						}

						computeClient.virtualMachines.listAll(function (error, vms) {
							utils.checkError(error, 704, cb, () => {
								if (!(vms && Array.isArray(vms))) {
									return cb(null, []);
								}

								helper.filterVMs(options.env, vms, function (error, filteredVms) {
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
											}

											return callback(null, helper.buildVMRecord(vmRecordOptions));
										});
									}, cb);
								});
							});
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
		options.soajs.log.debug(`Deleting virtual machine ${options.params.serviceId} in resource group ${options.env}`);
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
						computeClient.virtualMachines.deleteMethod(options.env, options.params.id, mCb);
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
		options.soajs.log.debug(`Restarting virtual machine ${options.params.vmName} in resource group ${options.env}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.restart(options.env, options.params.vmName, function (error, result) {
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
						return cb(null, result);
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
		options.soajs.log.debug(`Powering Off virtual machine ${options.params.vmName} in resource group ${options.env}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.powerOff(options.env, options.params.vmName, function (error, result) {
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
		options.soajs.log.debug(`Starting virtual machine ${options.params.vmName} in resource group ${options.env}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachines.start(options.env, options.params.vmName, function (error, result) {
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
		options.soajs.log.debug(`Deleting resource group ${options.env}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const resourceClient = driverUtils.getConnector({
					api: 'resource',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				resourceClient.resourceGroups.deleteMethod(options.env, function (error, result) {
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
						return cb(null, vmSizes);
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
						return cb(null, imagePublishers);
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
						return cb(null, imageOffers);
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
						return cb(null, imageVersions);
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
						return cb(null, networks);

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
						return cb(null, loadBalancers);
					});
				});
			});
		});
	},

	/**
	* List available subnets

	* @param  {Object}   options  Data passed to function listsubas params
	* @param  {Function} cb    Callback functionlistsub
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
						return cb(null, subnets);
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
						return cb(null, networkSecurityGroups);
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

	listPublicIp: function (options, cb) {
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
						return cb(null, publicIPAddresses);
					});
				});
			});
		});
	},

	runCommand: function(options, cb) {
		options.soajs.log.debug(`Running command in virtual machine`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				let params =  {commandId: 'RunShellScript', script: [options.params.command]};
				computeClient.virtualMachines.runCommand(options.params.resourceGroupName, options.params.vmName, params, function(error, result) {
					utils.checkError(error, 736, cb, () => {
						return cb(null, result);
					});
				});
			});
		});
	},

	getLogs: function(options, cb) {
		options.params.command = "journalctl --lines 200";
		return driver.runCommand(options,cb);
	}


};

module.exports = driver;
