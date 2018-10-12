'use strict';

const async = require('async');

const helper = {

	buildVMRecord: function (opts) {
		let record = {};
		if (opts.vm) {
            if (opts.raw){
                record.raw = opts.vm;
			}
            record.executeCommand = true;
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
				if (opts.vm.storageProfile.imageReference) {
					record.tasks[0].ref.os.image = {};
					if (opts.vm.storageProfile.imageReference.publisher) record.tasks[0].ref.os.image.prefix = opts.vm.storageProfile.imageReference.publisher;
					if (opts.vm.storageProfile.imageReference.offer) {
						record.tasks[0].ref.os.image.name = opts.vm.storageProfile.imageReference.offer;
						if (opts.vm.storageProfile.imageReference.sku) record.tasks[0].ref.os.image.name += "__" + opts.vm.storageProfile.imageReference.sku;
					}
					if (opts.vm.storageProfile.imageReference.version) record.tasks[0].ref.os.image.version = opts.vm.storageProfile.imageReference.version;
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

		record.securityGroup = [];
		if(opts.networkInterface){
			if(opts.networkInterface.ipConfigurations) {
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
			if(opts.networkInterface.networkSecurityGroup && opts.networkInterface.networkSecurityGroup.id) {
				record.securityGroup.push(opts.networkInterface.networkSecurityGroup.id.split('/').pop());
			}
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
			if(opts.disk.name) record.name = opts.disk.name;
			if(opts.disk.id) record.id = opts.disk.id;
			if(opts.disk.location) record.region = opts.disk.location;
			if(opts.disk.diskSizeGB) record.diskSizeGB = opts.disk.diskSizeGB;
			record.type = (opts.disk.osType) ? 'os' : 'data';
			if(opts.disk.sku && opts.disk.sku.name) record.storageType = opts.disk.sku.name;
			if(opts.disk.timeCreated) record.created = opts.disk.timeCreated;
		}

		return record;
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
	},

	listNetworkExtras: function(networkClient, opts, cb) {
		async.auto({

			listNetworkInterfaces: function(callback) {
				networkClient.networkInterfaces.list(opts.group, function (error, networkInterfaces) {
					if (error) opts.log.warn(`Unable to list network interfaces`);
					return callback(null, networkInterfaces || []);
				});
			},

			listSecurityGroups: function(callback) {
				networkClient.networkSecurityGroups.list(opts.group, function (error, securityGroups) {
					if (error) opts.log.warn(`Unable to list security groups`);
					return callback(null, securityGroups || []);
				});
			},

			listPublicIps: function(callback) {
				networkClient.publicIPAddresses.list(opts.group, function (error, publicIps) {
					if (error) opts.log.warn(`Unable to list public ip addresses`);
					return callback(null, publicIps || []);
				});
			},

			listLoadBalancers: function(callback) {
				networkClient.loadBalancers.list(opts.group, function (error, loadBalancers) {
					if (error) opts.log.warn(`Unable to list load balancers`);
					return callback(null, loadBalancers || []);
				});
			}

		}, function(error, results) {
			// no error to be handled
			return cb(null, {
				networkInterfaces: results.listNetworkInterfaces,
				securityGroups: results.listSecurityGroups,
				publicIps: results.listPublicIps,
				loadBalancers: results.listLoadBalancers
			});
		});
	},

	buildResourceGroupRecord: function(opts) {
		let record = {};

		if(opts.resourceGroup) {
			if(opts.resourceGroup.id) record.id = opts.resourceGroup.id;
			if(opts.resourceGroup.name) record.name = opts.resourceGroup.name;
			if(opts.resourceGroup.location) record.region = opts.resourceGroup.location;
			if(opts.resourceGroup.tags) record.labels = opts.resourceGroup.tags;
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

	buildNetworkRecord: function (opts) {
		let record = {};
		record.subnets = [];
		record.address = [];
		record.dnsServers = [];

		if(opts.network) {
			if (opts.network.name) record.name = opts.network.name;
			if (opts.network.id) record.id = opts.network.id;
			if (opts.network.location) record.region = opts.network.location;
			if (opts.network.subnets) {
				for(let i = 0 ; i < opts.network.subnets.length ; i++){
					record.subnets.push(  helper.buildSubnetRecord({subnet: opts.network.subnets[i] }));
				}
			}
			if(opts.network.addressSpace && opts.network.addressSpace.addressPrefixes && Array.isArray(opts.network.addressSpace.addressPrefixes) && opts.network.addressSpace.addressPrefixes.length > 0) {
				record.address = opts.network.addressSpace.addressPrefixes;
			}
			if(opts.network.dhcpOptions && opts.network.dhcpOptions.dnsServers && Array.isArray(opts.network.dhcpOptions.dnsServers) && opts.network.dhcpOptions.dnsServers.length > 0) {
				record.dnsServers = opts.network.dhcpOptions.dnsServers;
			}
		}

		return record;
	},

	buildLoadBalancerRecord: function (opts) {
		let record = {};
		record.addressPools = [];
		record.ipAddresses = [];
		record.rules = [];

		if(opts.loadBalancer){
			if (opts.loadBalancer.name) record.name = opts.loadBalancer.name;
			if (opts.loadBalancer.id) record.id = opts.loadBalancer.id;
			if (opts.loadBalancer.location) record.region = opts.loadBalancer.location;

			// collect backend address pools
			if(opts.loadBalancer.backendAddressPools && Array.isArray(opts.loadBalancer.backendAddressPools) && opts.loadBalancer.backendAddressPools.length > 0) {
				opts.loadBalancer.backendAddressPools.forEach((onePool) => {
					record.addressPools.push({ name: onePool.name });
				});
			}

			// collect ip address configurations
			if(opts.loadBalancer.frontendIPConfigurations && Array.isArray(opts.loadBalancer.frontendIPConfigurations) && opts.loadBalancer.frontendIPConfigurations.length > 0) {
				opts.loadBalancer.frontendIPConfigurations.forEach(function(oneConfig) {
					let oneIp = {};
					let oneRule = {
						config: {},
						ports: [],
						natRules: [],
						natPools: []
					};
					oneRule.name = oneConfig.name;
					oneRule.config.privateIPAllocationMethod = oneConfig.privateIPAllocationMethod.toLowerCase();

					if(oneConfig.privateIPAddress) {
						oneRule.config.isPublic = false;
						oneRule.config.privateIpAddress = oneConfig.privateIPAddress;
						if(oneConfig.subnet && oneConfig.subnet.id) {
							oneRule.config.subnet = { id: oneConfig.subnet.id };
							oneRule.config.subnet = Object.assign(oneRule.config.subnet, helper.getInfoFromAzureId(oneConfig.subnet.id, [
								{ v: 'resourceGroups', l: 'group' },
								{ v: 'virtualNetworks', l: 'network' },
								{ v: 'subnets', l: 'name' }
							]));
						}

						oneIp.address = oneConfig.privateIPAddress;
						oneIp.type = 'private';
					}
					if(oneConfig.publicIPAddress && oneConfig.publicIPAddress.id) {
						oneRule.config.isPublic = true;
						oneRule.config.publicIpAddress = { id: oneConfig.publicIPAddress.id };
						oneRule.config.publicIpAddress = Object.assign(oneRule.config.publicIpAddress, helper.getInfoFromAzureId(oneConfig.publicIPAddress.id, [
							{ v: 'resourceGroups', l: 'group' },
							{ v: 'publicIPAddresses', l: 'name' }
						]));

						if(opts.publicIpsList) {
							for (let i = 0; i < opts.publicIpsList.length; i++) {
								if(opts.publicIpsList[i].id === oneConfig.publicIPAddress.id) {
									oneIp.type = 'public';
									oneIp.name = opts.publicIpsList[i].name || '';
									oneIp.address = opts.publicIpsList[i].ipAddress || '';
									break;
								}
							}
						}
					}
					if (Object.keys(oneIp).length > 0){
						record.ipAddresses.push(oneIp);
					}
					if (Object.keys(oneRule).length > 0){
						record.rules.push(oneRule);
					}
				});
			}

			// collect load balancing rules (ports)
			if(opts.loadBalancer.loadBalancingRules && Array.isArray(opts.loadBalancer.loadBalancingRules) && opts.loadBalancer.loadBalancingRules.length > 0) {
				opts.loadBalancer.loadBalancingRules.forEach((oneRule) => {
					let onePort = {
						name: oneRule.name,
						protocol: oneRule.protocol.toLowerCase(),
						target: oneRule.backendPort,
						published: oneRule.frontendPort,
						loadDistribution: oneRule.loadDistribution.toLowerCase(),
						enableFloatingIP: oneRule.enableFloatingIP
					};
					if (oneRule.idleTimeoutInMinutes){
						onePort.idleTimeout = oneRule.idleTimeoutInMinutes * 60;
					}
					if (oneRule.disableOutboundSnat) {
						onePort.disableOutboundSnat = oneRule.disableOutboundSnat;
					}
					if(oneRule.backendAddressPool && oneRule.backendAddressPool.id) {
						onePort.addressPoolName = oneRule.backendAddressPool.id.split('/').pop();
					}
					if(oneRule.frontendIPConfiguration && oneRule.frontendIPConfiguration.id) {
						onePort.ipConfigName = oneRule.frontendIPConfiguration.id.split('/').pop();
					}

					if(oneRule.probe && oneRule.probe.id) {
						let probeName = oneRule.probe.id.split('/').pop();
						if(opts.loadBalancer.probes && Array.isArray(opts.loadBalancer.probes) && opts.loadBalancer.probes.length > 0) {
							for(let i = 0; i < opts.loadBalancer.probes.length; i++) {
								let oneProbe = opts.loadBalancer.probes[i];
								if(oneProbe.name === probeName) {
									onePort.healthProbePort = oneProbe.port;
									onePort.healthProbeProtocol = oneProbe.protocol.toLowerCase();
									onePort.healthProbeRequestPath = oneProbe.requestPath;
									onePort.maxFailureAttempts = oneProbe.numberOfProbes;
									onePort.healthProbeInterval = oneProbe.intervalInSeconds;
									break;
								}
							}
						}
					}

					//find the rule/ipconfig of this port and add it to its record
					for(let i = 0; i < record.rules.length; i++) {
						if(record.rules[i].name === onePort.ipConfigName) {
							record.rules[i].ports.push(onePort);
							break;
						}
					}
				});
			}

			// collect inbound NAT rules
			if(opts.loadBalancer.inboundNatRules && Array.isArray(opts.loadBalancer.inboundNatRules) && opts.loadBalancer.inboundNatRules.length > 0) {
				opts.loadBalancer.inboundNatRules.forEach((oneNatRule) => {
					let natRule = {
						name: oneNatRule.name,
						backendPort: oneNatRule.backendPort,
						frontendPort: oneNatRule.frontendPort,
						protocol: oneNatRule.protocol.toLowerCase(),
						enableFloatingIP: oneNatRule.enableFloatingIP,
						ipConfigName: (oneNatRule.frontendIPConfiguration && oneNatRule.frontendIPConfiguration.id) ? oneNatRule.frontendIPConfiguration.id.split('/').pop() : ''
					};
					if (oneNatRule.idleTimeoutInMinutes){
						natRule.idleTimeout = oneNatRule.idleTimeoutInMinutes * 60
					}

					//find the rule/ipconfig of this nat rule and add it to its record
					for(let i = 0; i < record.rules.length; i++) {
						if(record.rules[i].name === natRule.ipConfigName) {
							record.rules[i].natRules.push(natRule);
							break;
						}
					}
				});
			}

			// collect inbound NAT pools
			if(opts.loadBalancer.inboundNatPools && Array.isArray(opts.loadBalancer.inboundNatPools) && opts.loadBalancer.inboundNatPools.length > 0) {
				opts.loadBalancer.inboundNatPools.forEach((oneNatPool) => {
					let natPool = {
						name: oneNatPool.name,
						backendPort: oneNatPool.backendPort,
						protocol: oneNatPool.protocol.toLowerCase(),
						enableFloatingIP: oneNatPool.enableFloatingIP,
						frontendPortRangeStart: oneNatPool.frontendPortRangeStart,
						frontendPortRangeEnd: oneNatPool.frontendPortRangeEnd,
						ipConfigName: (oneNatPool.frontendIPConfiguration && oneNatPool.frontendIPConfiguration.id) ? oneNatPool.frontendIPConfiguration.id.split('/').pop() : ''
					};
					if (oneNatPool.idleTimeoutInMinutes){
						natPool.idleTimeout = oneNatPool.idleTimeoutInMinutes * 60
					}

					//find the rule/ipconfig of this nat rule and add it to its record
					for(let i = 0; i < record.rules.length; i++) {
						if(record.rules[i].name === natPool.ipConfigName) {
							record.rules[i].natPools.push(natPool);
							break;
						}
					}
				});
			}
		}

		return record;
	},

	buildSubnetRecord: function (opts) {
		let record = {};
		if(opts.subnet){
			if (opts.subnet.name) record.name = opts.subnet.name;
			if (opts.subnet.id) record.id = opts.subnet.id;
			if (opts.subnet.location) record.region = opts.subnet.location;
			if (opts.subnet.addressPrefix) record.address = opts.subnet.addressPrefix;
		}

		return record;
	},

	buildPublicIPRecord: function (opts) {
		let record = {};
		if(opts.publicIPAddress){
			if (opts.publicIPAddress.name) record.name = opts.publicIPAddress.name;
			if (opts.publicIPAddress.id) record.id = opts.publicIPAddress.id;
			if (opts.publicIPAddress.location) record.region = opts.publicIPAddress.location;
			if (opts.publicIPAddress.ipAddress) record.address = opts.publicIPAddress.ipAddress;
			if (opts.publicIPAddress.publicIPAllocationMethod) record.publicIPAllocationMethod = opts.publicIPAddress.publicIPAllocationMethod.toLowerCase();
			if (opts.publicIPAddress.idleTimeoutInMinutes) record.idleTimeout = opts.publicIPAddress.idleTimeoutInMinutes * 60;
			if (opts.publicIPAddress.publicIPAddressVersion) record.ipAddressVersion = opts.publicIPAddress.publicIPAddressVersion;
			if (opts.publicIPAddress.tags) record.labels = opts.publicIPAddress.tags;
			if (opts.publicIPAddress.sku && opts.publicIPAddress.sku.name) record.type = opts.publicIPAddress.sku.name.toLowerCase();
			if (opts.publicIPAddress && opts.publicIPAddress.ipConfiguration && opts.publicIPAddress.ipConfiguration.id){
				let split = opts.publicIPAddress.ipConfiguration.id.split("/");
				if (split.length > 1){
					record.associated = {};
					for (let i = 1; i < split.length - 1; i++) {
						//subscriptions
						if (i === 2 && split[1] === 'subscriptions'){
							record.associated.subscription = split[2];
						}
						//resourceGroups
						if (i === 4 && split[3] === 'resourceGroups'){
							record.associated.group = split[4];
						}
						//type can be networkInterface || loadBalancer || anything else
						if (i === 8 ){
							if (split[7] === 'networkInterfaces'){
								record.associated.type = 'networkInterface';
								record.associated.name = split[8];
							}
							else if (split[7] === 'loadBalancers'){
								record.associated.type = 'loadBalancer';
								record.associated.name = split[8];
							}
							else {
								record.associated.type = split[7];
								record.associated.name = split[8];
							}
						}
					}
				}
			}
		}
		return record;
	},

	buildSecurityGroupsRecord: function (opts) {
		let record = {};
		if(opts.networkSecurityGroups){
			if (opts.networkSecurityGroups.name) record.name = opts.networkSecurityGroups.name;
			if (opts.networkSecurityGroups.id) record.id = opts.networkSecurityGroups.id;
			if (opts.networkSecurityGroups.location) record.region = opts.networkSecurityGroups.location;
			if (opts.networkSecurityGroups.securityRules && Array.isArray(opts.networkSecurityGroups.securityRules) && opts.networkSecurityGroups.securityRules.length> 0){
				record.ports = helper.buildPortsArray(opts.networkSecurityGroups.securityRules);
			}
			if (opts.networkSecurityGroups.defaultSecurityRules && Array.isArray(opts.networkSecurityGroups.defaultSecurityRules) && opts.networkSecurityGroups.defaultSecurityRules.length> 0){
				let defaultSecurityRules = helper.buildPortsArray(opts.networkSecurityGroups.defaultSecurityRules);
				defaultSecurityRules.map((oneSecurityRule) => { oneSecurityRule.readonly = true; });
				if(!record.ports){
					record.ports = [];
				}
				record.ports = record.ports.concat(defaultSecurityRules);
			}
			if (opts.networkSecurityGroups.tags) record.labels = opts.networkSecurityGroups.tags;
		}
		return record;
	},

	buildPortsArray: function (securityRules) {
		let output = [];

		securityRules.forEach(function (oneSecurityRule) {
			output.push({
				name: oneSecurityRule.name,
				protocol: oneSecurityRule.protocol,
				access: oneSecurityRule.access.toLowerCase(),
				priority: oneSecurityRule.priority,
				direction: oneSecurityRule.direction.toLowerCase(),
				target: oneSecurityRule.destinationPortRange,
				published: oneSecurityRule.sourcePortRange,
				sourceAddress: oneSecurityRule.sourceAddressPrefix,
				destinationAddress: oneSecurityRule.destinationAddressPrefix,
				isPublished: (["*", "Internet", "0.0.0.0/0"].includes(oneSecurityRule.sourceAddressPrefix)) ? true : false
			});
		});

		return output;
	},

	find: function(key, value, list) {
		let output = {};
		if(list && Array.isArray(list) && list.length > 0) {
			for(let i = 0; i < list.length; i++) {
				if(list[i][key] === value) {
					output = list[i];
					break;
				}
			}
		}

		return output;
	},

	capitalize: function (word, def){
		if (word && typeof word) {
			return `${word[0].toUpperCase()}${word.slice(1)}`
		}
		else {
			return def;
		}
	},

	/**
	 * Take an id format as input and return a valid azure resource id

	 * @param  {String}   idFormat  The id format
	 * @param  {Object}   values    The values that should be replaced in the id format
	 * @return {String}
	 */
	buildAzureId: function(idFormat, values) {
		let outputId = idFormat;

		if(values && typeof(values) === 'object' && Object.keys(values).length > 0) {
			Object.keys(values).forEach((oneValue) => {
				outputId = outputId.replace(new RegExp(`%${oneValue}%`, 'g'), values[oneValue]);
			});
		}
		return outputId;
	},

	/**
	 * Take an id as input and return the requested data from it

	 * @param  {String}   id		The id format
	 * @param  {Array}   values    The values that should be extracted from the id
	 * @return {Object}
	 */
	getInfoFromAzureId: function(id, values) {
		let idInfo = id.split('/');
		let output = {};

		if(idInfo.length > 0) {
			for(let i = 0; i < idInfo.length; i++) {
				let match = values.find((oneValue) => { return oneValue.v ===  idInfo[i]; });

				if(match && idInfo[i + 1]) {
					output[match.l] = idInfo[i + 1];
				}
			}
		}

		return output;
	}
};

module.exports = helper;
