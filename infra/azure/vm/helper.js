'use strict';

const async = require('async');

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

		record.ip = [];

		if(opts.publicIp && opts.publicIp.ipAddress) {
			record.ip.push({
				type: 'public',
				allocatedTo: 'instance',
				address: opts.publicIp.ipAddress
			});
		}

		if(opts.networkInterface && opts.networkInterface.ipConfigurations){
			opts.networkInterface.ipConfigurations.forEach(function(oneIpConfig) {
				if(oneIpConfig.privateIPAddress) {
					record.ip.push({
						type: 'private',
						allocatedTo: 'instance',
						address: oneIpConfig.privateIPAddress
					});
				}
			});
		}

		if (opts.securityGroup && opts.securityGroup.securityRules) {
			record.ports = helper.buildPortsArray(opts.securityGroup.securityRules);
		}

		if(opts.subnetName) {
			record.layer = opts.subnetName;
		}

		if(opts.virtualNetworkName) {
			record.network = opts.virtualNetworkName;
		}

		if(opts.loadBalancers && Array.isArray(opts.loadBalancers) && opts.loadBalancers.length > 0) {
			record.loadBalancers = [];
			opts.loadBalancers.forEach(function(oneLoadBalancer) {
				let loadBalancerRecord = helper.buildLoadBalancerRecord({ loadBalancer: oneLoadBalancer, publicIpsList: opts.publicIpsList });
				record.loadBalancers.push(loadBalancerRecord);

				if(loadBalancerRecord.ipAddresses && Array.isArray(loadBalancerRecord.ipAddresses)) {
					loadBalancerRecord.ipAddresses.forEach(function(oneRecord) {
						record.ip.push({
							type: oneRecord.type || '',
							allocatedTo: 'loadBalancer',
							address: oneRecord.address || ''
						});
					});
				}
			});
		}

		return record;
	},

	buildVmSizes: function (opts) {
		let record = {};

        if(opts.vmSize) {
            if (opts.vmSize.name) record.name = opts.vmSize.name;
			if (opts.vmSize.numberOfCores) record.numberOfCores = opts.vmSize.numberOfCores;
			if (opts.vmSize.osDiskSizeInMB) record.osDiskSizeInMB = opts.vmSize.osDiskSizeInMB;
			if (opts.vmSize.resourceDiskSizeInMB) record.resourceDiskSizeInMB = opts.vmSize.resourceDiskSizeInMB;
			if (opts.vmSize.memoryInMB) record.memoryInMB = opts.vmSize.memoryInMB;
    		if (opts.vmSize.maxDataDiskCount) record.maxDataDiskCount = opts.vmSize.maxDataDiskCount;

	        record.label = record.name + ` / CPU: ${record.numberOfCores}`;
	        let memory = record.memoryInMB;
	        if(memory > 1024){
	        	memory = memory / 1024;
		        record.label += ` / RAM: ${memory}GB`;
	        }
	        else{
		        record.label += ` / RAM: ${memory}MB`;
	        }

	        let hd = record.resourceDiskSizeInMB;
	        if(hd > 1024){
	        	hd = hd / 1024;
		        record.label += ` / HD: ${hd}GB`;
	        }
	        else{
	            record.label += ` / HD: ${hd}MB`;
	        }
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
			if (opts.disk.diskSizeGB) record.diskSizeGB = opts.disk.diskSizeGB;
			if (opts.disk.type) record.type = opts.disk.type;
			if (opts.disk.storageType) record.storageType = opts.disk.storageType;
        }

		return record;
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
		let output = {};

		if (opts.vm.id) {
			idInfo = opts.vm.id.split('/');
			resourceGroupName = idInfo[idInfo.indexOf('resourceGroups') + 1];
		}

		// get the network interface of the instance
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

			if(networkInterfaceName) {
				output.networkInterface = helper.find('name', networkInterfaceName, opts.extras.networkInterfaces);
			}
		}

		// get the security group of the instance
		if(output.networkInterface && output.networkInterface.networkSecurityGroup && output.networkInterface.networkSecurityGroup.id) {
			networkSecurityGroupName = output.networkInterface.networkSecurityGroup.id.split('/').pop();
			output.securityGroup = helper.find('name', networkSecurityGroupName, opts.extras.securityGroups);
		}

		// get the public ip addresses, subnet and network name of the instance (if any)
		if(output.networkInterface && output.networkInterface.ipConfigurations && Array.isArray(output.networkInterface.ipConfigurations)) {
			for (let i = 0; i < output.networkInterface.ipConfigurations.length; i++) {
				if(output.networkInterface.ipConfigurations[i].primary) {
					if (output.networkInterface.ipConfigurations[i].publicIPAddress) {
						ipName = output.networkInterface.ipConfigurations[i].publicIPAddress.id.split('/').pop();
						output.publicIp = helper.find('name', ipName, opts.extras.publicIps);
					}

					if(output.networkInterface.ipConfigurations[i].subnet) {
						// sample subnet id: /subscriptions/xxxxxxxxx/resourceGroups/test/providers/Microsoft.Network/virtualNetworks/test-vn/subnets/test-subnet
						let subnetInfo = output.networkInterface.ipConfigurations[i].subnet.id.split('/');
						output.subnetName = subnetInfo.pop();
						output.virtualNetworkName = subnetInfo[subnetInfo.indexOf('virtualNetworks') + 1];
					}
				}
			}
		}

		async.auto({
			getLoadBalancers: function(callback) {
				networkClient.networkInterfaceLoadBalancers.list(resourceGroupName, networkInterfaceName, function(error, loadBalancers) {
					if (error) opts.log.warn(`Unable to get load balancers for network interface ${networkInterfaceName}`);
					return callback(null, loadBalancers || []);
				});
			}
		}, function(error, results) {
			output.loadBalancers = results.getLoadBalancers;
			return cb(null, output);
		});
	}
};

module.exports = helper;
