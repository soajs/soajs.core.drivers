'use strict';

const async = require('async');

const config = require('./config');

const helper = {

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
				if(opts.vm.storageProfile.dataDisks) {
					record.voluming.volumes = [];
					opts.vm.storageProfile.dataDisks.forEach(function(oneDisk) {
						record.voluming.volumes.push({
							name: oneDisk.name,
							type: 'data',
							caching: oneDisk.caching,
							diskSizeGb: oneDisk.diskSizeGb,
							storageType: (oneDisk.managedDisk && oneDisk.managedDisk.storageAccountType) ? oneDisk.managedDisk.storageAccountType : ''
						});
					});
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

		if(opts.subnet && opts.subnet.name) {
			record.layer = opts.subnet.name;
		}

		if(opts.virtualNetworkName) {
			record.network = opts.virtualNetworkName;
		}

		// record.servicePortType = "";

		return record;
	},

	buildVmSizes:  function (opts) {
		let record = {};

        if(opts.vmSizes) {
            if (opts.vmSizes.name) record.name = opts.vmSizes.name;
			if (opts.vmSizes.numberOfCores) record.numberOfCores = opts.vmSizes.numberOfCores;
			if (opts.vmSizes.osDiskSizeInMB) record.osDiskSizeInMB = opts.vmSizes.osDiskSizeInMB;
			if (opts.vmSizes.resourceDiskSizeInMB) record.resourceDiskSizeInMB = opts.vmSizes.resourceDiskSizeInMB;
			if (opts.vmSizes.memoryInMB) record.memoryInMB = opts.vmSizes.memoryInMB;
    		if (opts.vmSizes.maxDataDiskCount) record.maxDataDiskCount = opts.vmSizes.maxDataDiskCount;


        }

		return record;

	},
	buildRunCommmand: function(opts){
		let record ={};

		if(opts.runCommand){
			if (opts.runCommand.name) record.name = opts.runCommand.name;
    		if (opts.runCommand.status) record.status = opts.runCommand.status;



		}
		return record;

	},

	buildVmImagePublisherssRecord: function (opts) {
		let record = {};

        if(opts.imagePublisher) {
            if (opts.imagePublisher.name) record.name = opts.imagePublisher.name;
    		if (opts.imagePublisher.id) record.id = opts.imagePublisher.id;
			if (opts.imagePublisher.location) record.region = opts.imagePublisher.location;

        }

		return record;

	},

	buildVmImagePublishersOffersRecord: function (opts) {
		let record = {};

        if(opts.imageOffer) {
            if (opts.imageOffer.name) record.name = opts.imageOffer.name;
    		if (opts.imageOffer.id) record.id = opts.imageOffer.id;
			if (opts.imageOffer.location) record.region = opts.imageOffer.location;
			if(opts.imageOffer.publisher) record.publisher = opts.imageOffer.publisher;
			if(opts.imageOffer.imageName) record.imageName = opts.imageOffer.imageName;

        }

		return record;

	},


	buildVmImageVersionsRecord: function (opts) {
		let record = {};

        if(opts.imageVersion) {
            if (opts.imageVersion.name) record.name = opts.imageVersion.name;
    		if (opts.imageVersion.id) record.id = opts.imageVersion.id;
			if (opts.imageVersion.location) record.region = opts.imageVersion.location;
			if(opts.imageVersion.publisher) record.publisher = opts.imageVersion.publisher;
			if(opts.imageVersion.imageName) record.imageName = opts.imageVersion.imageName;

        }

		return record;

	},

	buildDiskRecord: function (opts) {
		let record = {};

        if(opts.disk) {
            if (opts.disk.name) record.name = opts.disk.name;
    		if (opts.disk.id) record.id = opts.disk.id;
			if (opts.disk.location) record.region = opts.disk.location;
			if (opts.disk.diskSizeGb) record.diskSizeGb = opts.disk.diskSizeGb;
    		if (opts.disk.type) record.type = opts.disk.type;
			if (opts.disk.storageType) record.storageType = opts.disk.storageType;

        }

		return record;

	},

	buildNetworkRecord: function (opts) {
		let record = {};
		record.subnets = [];
        if(opts.network) {
            if (opts.network.name) record.name = opts.network.name;
    		if (opts.network.id) record.id = opts.network.id;
			if (opts.network.location) record.region = opts.network.location;
			if (opts.network.subnets) {

				for(let i = 0 ; i < opts.network.subnets.length ; i++){
					record.subnets.push(  helper.bulidSubnetsRecord({subnet :opts.network.subnets[i] }));


				}
			}
			if(opts.network.addressSpace) record.addressSpace = opts.network.addressSpace;
        }




		return record;

	},

	buildLoadBalancersRecord: function (opts) {
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
		if(opts.publicIPAddresse){
			if (opts.publicIPAddresse.name) record.name = opts.publicIPAddresse.name;
			if (opts.publicIPAddresse.id) record.id = opts.publicIPAddresse.id;
			if (opts.publicIPAddresse.location) record.region = opts.publicIPAddresse.location;
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

	filterVMs: function (group, vms, cb) {
		async.filter(vms, function (oneVm, callback) {
			let valid = false;
			if (!oneVm.tags || Object.keys(oneVm.tags).length === 0) valid = true;
			else if (group && oneVm.tags && oneVm.tags['soajs.content'] === 'true' && oneVm.tags['soajs.env.code'] === group) valid = true;
			else if (oneVm.tags && (!oneVm.tags['soajs.content'] || oneVm.tags['soajs.content'] !== 'true')) valid = true;

			return callback(null, valid);
		}, cb);
	},

	getVmNetworkInfo: function (networkClient, opts, cb) {
		let idInfo, resourceGroupName, networkInterfaceName, networkSecurityGroupName, ipName, subnetName, vnetName;
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
					if(networkInterface.ipConfigurations[i].primary) {
						if (networkInterface.ipConfigurations[i].publicIPAddress) {
							ipName = networkInterface.ipConfigurations[i].publicIPAddress.id.split('/').pop();
						}
						if(networkInterface.ipConfigurations[i].subnet) {
							// sample subnet id: /subscriptions/xxxxxxxxx/resourceGroups/test/providers/Microsoft.Network/virtualNetworks/test-vn/subnets/test-subnet
							let subnetInfo = networkInterface.ipConfigurations[i].subnet.id.split('/');
							subnetName = subnetInfo.pop();
							vnetName = subnetInfo[subnetInfo.indexOf('virtualNetworks') + 1];
						}

						break;
					}
				}
			}

			async.auto({
				getSecurityGroup: function(callback) {
					networkClient.networkSecurityGroups.get(resourceGroupName, networkSecurityGroupName, function (error, securityGroup) {
						if (error) return callback(error);
						return callback(null, securityGroup);
					});
				},
				getPublicIp: function(callback) {
					networkClient.publicIPAddresses.get(resourceGroupName, ipName, function (error, publicIp) {
						if (error) return cb(error);
						return callback(null, publicIp);
					});
				},
				getSubnet: function(callback) {
					networkClient.subnets.get(resourceGroupName, vnetName, subnetName, function(error, subnet) {
						if (error) return cb(error);
						return callback(null, subnet);
					});
				}
			}, function(error, results) {
				return cb(null, {
					networkInterface,
					securityGroup: results.getSecurityGroup,
					publicIp: results.getPublicIp,
					subnet: results.getSubnet,
					virtualNetworkName: vnetName
				});
			});
		});
	}
};

module.exports = helper;
