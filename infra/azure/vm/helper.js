'use strict';

const request = require('request');
const async = require('async');

const config = require('./config');

const helper = {

	createResourceGroup: function (resourceClient, opts, cb) {
		let groupParameters = {location: opts.location, tags: opts.tags || {}};

		return resourceClient.resourceGroups.createOrUpdate(opts.resourceGroupName, groupParameters, cb);
	},

	createStorageAccount: function (storageClient, opts, cb) {
		let params = {
			location: opts.location,
			sku: {
				name: opts.accountType,
			},
			kind: opts.storageKind || 'Storage',
			tags: opts.tags || {}
		};

		return storageClient.storageAccounts.create(opts.resourceGroupName, opts.accountName, params, cb);
	},

	createVirtualNetwork: function (networkClient, opts, cb) {
		if (!(opts.addressPrefixes && Array.isArray(opts.addressPrefixes))) {
			opts.addressPrefixes = ['10.0.0.0/24'];
		}

		if (!(opts.dhcpServers && Array.isArray(opts.dhcpServers))) {
			// opts.dhcpServers = ['10.1.1.1', '10.1.2.4'];
		}

		if (!(opts.subnets && Array.isArray(opts.subnets))) {
			opts.subnets = [
				{name: 'subnet', addressPrefix: '10.0.0.0/24'}
			];
		}

		let params = {
			location: opts.location,
			addressSpace: {
				addressPrefixes: opts.addressPrefixes
			},
			dhcpOptions: {
				dnsServers: opts.dhcpServers || []
			},
			subnets: opts.subnets
		};
		return networkClient.virtualNetworks.createOrUpdate(opts.resourceGroupName, opts.vnetName, params, cb);
	},

	getSubnetInfo: function (networkClient, opts, cb) {
		return networkClient.subnets.get(opts.resourceGroupName, opts.vnetName, opts.subnetName, cb);
	},

	createPublicIP: function (networkClient, opts, cb) {
		let params = {
			location: opts.location,
			publicIPAllocationMethod: opts.publicIPAllocationMethod || 'Dynamic',
			// dnsSettings: {
			//     domainNameLabel: opts.domainNameLabel
			// }
		};

		return networkClient.publicIPAddresses.createOrUpdate(opts.resourceGroupName, opts.publicIPName, params, cb);
	},

	createNetworkSecurityGroup: function (networkClient, opts, cb) {
		let requestOptions = {
			method: 'PUT',
			uri: `https://management.azure.com/subscriptions/${opts.subscriptionId}/resourceGroups/${opts.resourceGroupName}/providers/Microsoft.Network/networkSecurityGroups/${opts.networkSecurityGroupName}?api-version=${config.apiVersion2018}`,
			headers: {Authorization: `Bearer ${opts.bearerToken}`},
			json: true,
			body: {
				location: opts.location,
				properties: {
					securityRules: helper.buildSecurityRules(opts.ports)
				}
			}
		};

		request(requestOptions, function (error, response, body) {
			if (error) return cb(error);
			if (body && body.error) return cb(body.error);

			return cb(null, body);
		});
	},

	createNetworkInterface: function (networkClient, opts, cb) {
		let params = {
			location: opts.location,
			ipConfigurations: [
				{
					name: opts.ipConfigName,
					privateIPAllocationMethod: opts.publicIPAllocationMethod || 'Dynamic',
					subnet: opts.subnetInfo,
					publicIPAddress: opts.publicIPInfo
				}
			],
			networkSecurityGroup: {
				id: opts.networkSecurityGroupName
			}
		};

		return networkClient.networkInterfaces.createOrUpdate(opts.resourceGroupName, opts.networkInterfaceName, params, cb);
	},

	getVMImage: function (computeClient, opts, cb) { //TODO: check get image instead of list images
		return computeClient.virtualMachineImages.list(opts.location, opts.publisher, opts.offer, opts.sku, {top: 1}, (error, imageList) => {
			if (error) return cb(error);

			return cb(null, (imageList && imageList[0]) ? imageList[0] : {});
		});
	},

	getNetworkInterfaceInfo: function (networkClient, opts, cb) {
		return networkClient.networkInterfaces.get(opts.resourceGroupName, opts.networkInterfaceName, cb);
	},

	createVirtualMachine: function (computeClient, opts, cb) {
		let params = {
			location: opts.location,
			osProfile: {
				computerName: opts.vmName,
				adminUsername: opts.adminUsername
			},
			hardwareProfile: {
				vmSize: opts.vmSize
			},
			storageProfile: {
				imageReference: {
					publisher: opts.image.publisher,
					offer: opts.image.offer,
					sku: opts.image.sku,
					version: opts.image.version
				},
				osDisk: {
					createOption: opts.disk.createOption || 'fromImage',
					managedDisk: {
						stoageAccountType: opts.disk.accountType
					}
					// name: opts.disk.osDiskName,
					// caching: opts.disk.caching || 'None',
					// vhd: { uri: 'https://' + opts.disk.storageAccountName + '.blob.core.windows.net/nodejscontainer/osnodejslinux.vhd' } //TODO
				}
			},
			networkProfile: {
				networkInterfaces: [
					{
						id: opts.network.networkInterfaceId,
						primary: true
					}
				]
			},
			tags: opts.tags
		};

		//check if password or SSH public key
		if (opts.adminPassword) {
			params.osProfile.adminPassword = opts.adminPassword;
		}
		else if (opts.adminPublicKey) {
			params.osProfile.linuxConfiguration = {
				"ssh": {
					"publicKeys": [
						{
							"path": "/home/" + opts.adminUsername + "/.ssh/authorized_keys",
							"keyData": opts.adminPublicKey
						}
					]
				},
				"disablePasswordAuthentication": true
			};
		}

		if (opts.command) {
			let commandOutput = helper.buildCommands(opts.command, opts.envs || []);
			params.osProfile.customData = Buffer.from(commandOutput).toString('base64');
		}

		return computeClient.virtualMachines.createOrUpdate(opts.resourceGroupName, opts.vmName, params, cb);
	},

	buildCommands: function (command, envs) {
		let output = '';

		if (command.command) {
			output += command.command.join(' ');
			output += '\n';
		}

		output += helper.buildEnvVars(envs);

		if (command.args) {
			output += command.args.join('\n');
		}

		return output;
	},

	buildEnvVars: function (envs) {
		let output = '';

		if (envs && Array.isArray(envs) && envs.length > 0) {
			envs.forEach((oneEnv) => {
				output += `export ${oneEnv};\n`;
			});
		}

		return output;
	},

	buildVMRecord: function (opts) {
		let record = {};

		if (opts.vm) {
			if (opts.vm.name) record.name = opts.vm.name;
			if (opts.vm.name) record.id = opts.vm.name;

			record.labels = {};
			if (opts.vm.tags) record.labels = opts.vm.tags;
			if (opts.vm.location) record.labels['soajs.service.vm.location'] = opts.vm.location;
			if (opts.vm.id) {
				let idInfo = opts.vm.id.split('/');
				record.labels['soajs.service.vm.group'] = idInfo[idInfo.indexOf('resourceGroups') + 1];
			}
			if (opts.vm.hardwareProfile && opts.vm.hardwareProfile.vmSize) record.labels['soajs.service.vm.size'] = opts.vm.hardwareProfile.vmSize;

			record.ports = [];
			record.voluming = {};

			record.tasks = [];
			record.tasks[0] = {};
			if (opts.vm.name) record.tasks[0].id = opts.vm.name;
			if (opts.vm.name) record.tasks[0].name = opts.vm.name;

			record.tasks[0].status = {};
			if (opts.vm.provisioningState) record.tasks[0].status.state = opts.vm.provisioningState.toLowerCase();
			if (opts.vm.provisioningState) record.tasks[0].status.ts = new Date().getTime();

			record.tasks[0].ref = {os: {}};
			if (opts.vm.storageProfile) {
				if (opts.vm.storageProfile.osDisk) {
					if (opts.vm.storageProfile.osDisk.osType) record.tasks[0].ref.os.type = opts.vm.storageProfile.osDisk.osType;
					if (opts.vm.storageProfile.osDisk.diskSizeGB) record.tasks[0].ref.os.diskSizeGB = opts.vm.storageProfile.osDisk.diskSizeGB;
				}
			}
		}

		record.env = [];

		if (opts.publicIp && opts.publicIp.ipAddress) {
			record.ip = opts.publicIp.ipAddress;
		}

		if (opts.securityGroup && opts.securityGroup.securityRules) {
			record.ports = helper.buildPortsArray(opts.securityGroup.securityRules);
		}

		// record.servicePortType = "";

		return record;
	},

	buildVmSizes:  function (opts) {
		let record = {};

        if(opts.vmSizes) {
            if (opts.vmSizes.name) record.name = opts.vmSizes.name;
    		if (opts.vmSizes.numberOfCores) record.numberOfCores = opts.vmSizes.numberOfCores;


        }

		return record;

	},


	buildVmImagePublisherssRecord: function (opts) {
		let record = {};

        if(opts.vmImagePublishers) {
            if (opts.vmImagePublishers.name) record.name = opts.vmImagePublishers.name;
    		if (opts.vmImagePublishers.id) record.id = opts.vmImagePublishers.id;
			if (opts.vmImagePublishers.location) record.region = opts.vmImagePublisherss.location;

        }

		return record;

	},

	buildVmImagePublishersOffersRecord: function (opts) {
		let record = {};

        if(opts.vmImagePublisherOffer) {
            if (opts.vmImagePublisherOffer.name) record.name = opts.vmImagePublisherOffer.name;
    		if (opts.vmImagePublisherOffer.id) record.id = opts.vmImagePublisherOffer.id;
			if (opts.vmImagePublisherOffer.location) record.region = opts.vmImagePublisherOffer.location;

        }

		return record;

	},


	buildVmImageVersionsRecord: function (opts) {
		let record = {};

        if(opts.vmImageVersion) {
            if (opts.vmImageVersion.name) record.name = opts.vmImageVersion.name;
    		if (opts.vmImageVersion.id) record.id = opts.vmImageVersion.id;
			if (opts.vmImageVersion.location) record.region = opts.vmImageVersion.location;

        }

		return record;

	},


	buildDataDiskRecord: function (opts) {
		let record = {};

        if(opts.dataDisk) {
            if (opts.dataDisk.name) record.name = opts.dataDisk.name;
    		if (opts.dataDisk.id) record.id = opts.dataDisk.id;
			if (opts.dataDisk.location) record.region = opts.dataDisk.location;

        }

		return record;

	},

	buildNetworkRecord: function (opts) {
		let record = {};

        if(opts.network) {
            if (opts.network.name) record.name = opts.network.name;
    		if (opts.network.id) record.id = opts.network.id;
			if (opts.network.location) record.region = opts.network.location;
			if (opts.network.subnets) record.subnets = opts.network.subnets;
			if(opts.network.addressSpace) record.addressSpace = opts.network.addressSpace;
        }

		return record;

	},

	buildLOadBalancersRecord: function (opts) {
		let record = {};
		if(opts.loadBlanacer){
			if (opts.loadBlanacer.name) record.name = opts.loadBlanacer.name;
			if (opts.loadBlanacer.id) record.id = opts.loadBlanacer.id;
			if (opts.loadBlanacer.location) record.region = opts.loadBlanacer.location;
		}
		return record;
	},

	bulidSubnetsRecord: function (opts) {
		let record = {};

		if(opts.subnets){
			if (opts.subnets.name) record.name = opts.subnets.name;
			if (opts.subnets.id) record.id = opts.subnets.id;
			if (opts.subnets.location) record.region = opts.subnets.location;
			if (opts.subnets.addressPrefix) record.addressPrefix = opts.subnets.addressPrefix;
		}
		return record;
	},

	buildPublicIPsRecord: function (opts) {
		let record = {}
		if(opts.publicIPs){
			if (opts.publicIPAddresses.name) record.name = opts.publicIPAddresses.name;
			if (opts.publicIPAddresses.id) record.id = opts.id;
			if (opts.publicIPAddresses.location) record.region = opts.publicIPAddresses.location;
		}
		return record;
	},
	buildSecurityGroupsRecord: function (opts) {

		let record = {};
		if(opts.networkSecurityGroups){
			if (opts.networkSecurityGroups.name) record.name = opts.networkSecurityGroups.name;
			if (opts.networkSecurityGroups.id) record.id = opts.networkSecurityGroups.id;
			if (opts.networkSecurityGroups.location) record.region = opts.networkSecurityGroups.location;
		}
		return record;
	},

	buildSecurityRules: function (ports) {
		let securityRules = [];
		let priority = 100;

		if (Array.isArray(ports)) {
			ports.forEach(onePort => {
				securityRules.push({
					name: onePort.name,
					properties: {
						priority: priority,
						protocol: "*",
						access: "Allow",
						direction: "Inbound",
						sourceAddressPrefix: "*",
						sourcePortRange: "*",
						destinationAddressPrefix: "*",
						destinationPortRange: (onePort.published) ? onePort.published : (Math.floor(Math.random() * 2768) + 30000)
					}
				});
				priority += 10;
			});
		}

		return securityRules;
	},

	buildPortsArray: function (securityRules) {
		let output = [];

		securityRules.forEach(function (oneSecurityRule) {
			output.push({
				protocol: (oneSecurityRule.protocol && oneSecurityRule.protocol === '*') ? 'tcp/udp' : oneSecurityRule.protocol,
				target: oneSecurityRule.sourcePortRange,
				published: oneSecurityRule.destinationPortRange,
				isPublished: (oneSecurityRule.destinationPortRange) ? true : false
			});
		});

		return output;
	},

	filterVMs: function (env, vms, cb) {
		async.filter(vms, function (oneVm, callback) {
			let valid = false;
			if (!oneVm.tags || Object.keys(oneVm.tags).length === 0) valid = true;
			else if (oneVm.tags && oneVm.tags['soajs.content'] === 'true' && oneVm.tags['soajs.env.code'] === env) valid = true;
			else if (oneVm.tags && (!oneVm.tags['soajs.content'] || oneVm.tags['soajs.content'] !== 'true')) valid = true;

			return callback(null, valid);
		}, cb);
	},

	getVmNetworkInfo: function (networkClient, opts, cb) {
		let idInfo, resourceGroupName, networkInterfaceName, networkSecurityGroupName, ipName;
		if (opts.vm.id) {
			idInfo = opts.vm.id.split('/');
			resourceGroupName = idInfo[idInfo.indexOf('resourceGroups') + 1];
		}

		if (opts.vm.networkProfile && opts.vm.networkProfile.networkInterfaces && Array.isArray(opts.vm.networkProfile.networkInterfaces)) {
			for (let i = 0; i < opts.vm.networkProfile.networkInterfaces.length; i++) {
				if (opts.vm.networkProfile.networkInterfaces[i].primary) {
					networkInterfaceName = opts.vm.networkProfile.networkInterfaces[i].id.split('/').pop();
					break;
				}
			}
			//if no primary interface was found, use the first in the array
			if (!networkInterfaceName && opts.vm.networkProfile.networkInterfaces[0] && opts.vm.networkProfile.networkInterfaces[0].id) {
				networkInterfaceName = opts.vm.networkProfile.networkInterfaces[0].id.split('/').pop();
			}
		}

		networkClient.networkInterfaces.get(resourceGroupName, networkInterfaceName, function (error, networkInterface) {
			if (error) return cb(error);

			if (networkInterface && networkInterface.networkSecurityGroup && networkInterface.networkSecurityGroup.id) {
				networkSecurityGroupName = networkInterface.networkSecurityGroup.id.split('/').pop();
			}

			if (networkInterface && networkInterface.ipConfigurations && Array.isArray(networkInterface.ipConfigurations)) {
				for (let i = 0; i < networkInterface.ipConfigurations.length; i++) {
					if (networkInterface.ipConfigurations[i].primary && networkInterface.ipConfigurations[i].publicIPAddress) {
						ipName = networkInterface.ipConfigurations[i].publicIPAddress.id.split('/').pop();
						break;
					}
				}
			}

			networkClient.networkSecurityGroups.get(resourceGroupName, networkSecurityGroupName, function (error, securityGroup) {
				if (error) return cb(error);

				networkClient.publicIPAddresses.get(resourceGroupName, ipName, function (error, publicIp) {
					if (error) return cb(error);

					return cb(null, {networkInterface, securityGroup, publicIp});
				});
			});
		});
	}
};

module.exports = helper;
