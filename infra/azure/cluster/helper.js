'use strict';

const async = require('async');

const helper = {

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
		record.addressPrefixes = [];
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
				record.addressPrefixes = opts.network.addressSpace.addressPrefixes;
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
		record.ipConfigs = [];
		record.ports = [];
		record.natRules = [];
		record.natPools = [];

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
					let oneIp = {}, ipConfigOutput = {};
					ipConfigOutput.name = oneConfig.name;
					ipConfigOutput.privateIPAllocationMethod = oneConfig.privateIPAllocationMethod;


					if(oneConfig.privateIPAddress) {
						ipConfigOutput.isPublic = false;
						ipConfigOutput.privateIpAddress = oneConfig.privateIPAddress;
						if(oneConfig.subnet && oneConfig.subnet.id) {
							ipConfigOutput.subnetId = oneConfig.subnet.id;
						}

						oneIp.address = oneConfig.privateIPAddress;
						oneIp.type = 'private';
					}
					if(oneConfig.publicIPAddress && oneConfig.publicIPAddress.id) {
						ipConfigOutput.isPublic = true;
						ipConfigOutput.publicIpAddressId = oneConfig.publicIPAddress.id;

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
					record.ipAddresses.push(oneIp);
					record.ipConfigs.push(ipConfigOutput);
				});
			}

			// collect load balancing rules (ports)
			if(opts.loadBalancer.loadBalancingRules && Array.isArray(opts.loadBalancer.loadBalancingRules) && opts.loadBalancer.loadBalancingRules.length > 0) {
				opts.loadBalancer.loadBalancingRules.forEach((oneRule) => {
					let onePort = {
						name: oneRule.name,
			            protocol: oneRule.protocol,
			            target: oneRule.backendPort,
			            published: oneRule.frontendPort,
			            idleTimeoutInMinutes: oneRule.idleTimeoutInMinutes,
			            loadDistribution: oneRule.loadDistribution,
			            enableFloatingIP: oneRule.enableFloatingIP
					};
					if (oneRule.disableOutboundSnat) {
						onePort.disableOutboundSnat = oneRule.disableOutboundSnat;
					}
					if(oneRule.backendAddressPool && oneRule.backendAddressPool.id) {
						onePort.addressPoolName = oneRule.backendAddressPool.id.split('/').pop();
					}
					if(oneRule.frontendIPConfiguration && oneRule.frontendIPConfiguration.id) {
						onePort.lbIpConfigName = oneRule.frontendIPConfiguration.id.split('/').pop();
					}

					if(oneRule.probe && oneRule.probe.id) {
						let probeName = oneRule.probe.id.split('/').pop();
						if(opts.loadBalancer.probes && Array.isArray(opts.loadBalancer.probes) && opts.loadBalancer.probes.length > 0) {
							for(let i = 0; i < opts.loadBalancer.probes.length; i++) {
								let oneProbe = opts.loadBalancer.probes[i];
								if(oneProbe.name === probeName) {
									onePort.healthProbePort = oneProbe.port;
									onePort.healthProbeProtocol = oneProbe.protocol;
									onePort.healthProbeRequestPath = oneProbe.requestPath;
									onePort.maxFailureAttempts = oneProbe.numberOfProbes;
									onePort.healthProbeInterval = oneProbe.intervalInSeconds;
									break;
								}
							}
						}
					}

					record.ports.push(onePort);
				});
			}

			// collect inbound NAT rules
			if(opts.loadBalancer.inboundNatRules && Array.isArray(opts.loadBalancer.inboundNatRules) && opts.loadBalancer.inboundNatRules.length > 0) {
				opts.loadBalancer.inboundNatRules.forEach((oneNatRule) => {
					record.natRules.push({
						name: oneNatRule.name,
						backendPort: oneNatRule.backendPort,
						frontendPort: oneNatRule.frontendPort,
						protocol: oneNatRule.protocol,
						idleTimeoutInMinutes: oneNatRule.idleTimeoutInMinutes,
						enableFloatingIP: oneNatRule.enableFloatingIP,
						frontendIPConfigName: (oneNatRule.frontendIPConfiguration && oneNatRule.frontendIPConfiguration.id) ? oneNatRule.frontendIPConfiguration.id.split('/').pop() : ''
					});
				});
			}

			// collect inbound NAT pools
			if(opts.loadBalancer.inboundNatPools && Array.isArray(opts.loadBalancer.inboundNatPools) && opts.loadBalancer.inboundNatPools.length > 0) {
				opts.loadBalancer.inboundNatPools.forEach((oneNatPool) => {
					record.natPools.push({
						name: oneNatPool.name,
						backendPort: oneNatPool.backendPort,
						protocol: oneNatPool.protocol,
						enableFloatingIP: oneNatPool.enableFloatingIP,
						frontendPortRangeStart: oneNatPool.frontendPortRangeStart,
						frontendPortRangeEnd: oneNatPool.frontendPortRangeEnd,
						idleTimeoutInMinutes: oneNatPool.idleTimeoutInMinutes,
						frontendIPConfigName: (oneNatPool.frontendIPConfiguration && oneNatPool.frontendIPConfiguration.id) ? oneNatPool.frontendIPConfiguration.id.split('/').pop() : ''
					});
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
			if (opts.subnet.addressPrefix) record.addressPrefix = opts.subnet.addressPrefix;
		}

		return record;
	},

	buildPublicIPRecord: function (opts) {
		let record = {};
		if(opts.publicIPAddress){
			if (opts.publicIPAddress.name) record.name = opts.publicIPAddress.name;
			if (opts.publicIPAddress.id) record.id = opts.publicIPAddress.id;
			if (opts.publicIPAddress.location) record.region = opts.publicIPAddress.location;
			if (opts.publicIPAddress.ipAddress) record.ipAddress = opts.publicIPAddress.ipAddress;
			if (opts.publicIPAddress.publicIPAddressVersion) record.ipAddressVersion = opts.publicIPAddress.publicIPAddressVersion;
			if (opts.publicIPAddress.publicIPAllocationMethod) record.publicIPAllocationMethod = opts.publicIPAddress.publicIPAllocationMethod;
			if (opts.publicIPAddress.tags) record.labels = opts.publicIPAddress.tags;

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
				record.ports = record.ports.concat(helper.buildPortsArray(opts.networkSecurityGroups.defaultSecurityRules));
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
				access: oneSecurityRule.access,
				priority: oneSecurityRule.priority,
				direction: oneSecurityRule.direction,
				target: oneSecurityRule.sourcePortRange,
				published: oneSecurityRule.destinationPortRange,
				sourceAddressPrefix: oneSecurityRule.sourceAddressPrefix,
				destinationAddressPrefix: oneSecurityRule.destinationAddressPrefix,
				isPublished: (oneSecurityRule.destinationPortRange) ? true : false
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

	listNetworkExtras: function(networkClient, opts, cb) {
		async.auto({

			listNetworkInterfaces: function(callback) {
				networkClient.networkInterfaces.listAll(function (error, networkInterfaces) {
					if (error) opts.log.warn(`Unable to list network interfaces`);
					return callback(null, networkInterfaces || []);
				});
			},

			listSecurityGroups: function(callback) {
				networkClient.networkSecurityGroups.listAll(function (error, securityGroups) {
					if (error) opts.log.warn(`Unable to list security groups`);
					return callback(null, securityGroups || []);
				});
			},

			listPublicIps: function(callback) {
				networkClient.publicIPAddresses.listAll(function (error, publicIps) {
					if (error) opts.log.warn(`Unable to list public ip addresses`);
					return callback(null, publicIps || []);
				});
			},

			listLoadBalancers: function(callback) {
				networkClient.loadBalancers.listAll(function (error, loadBalancers) {
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
    }
};

module.exports = helper;
