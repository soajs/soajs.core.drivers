'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const config = require('./../config');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const lbs = {

    /**
    * List available load balancers

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing load balancers for resource group ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                function listLoadBalancers(callback) {
                    networkClient.loadBalancers.list(options.params.group, function (error, loadBalancers) {
                        if(error) return callback(error);
                        return callback(null, { loadBalancers });
                    });
                }

                function listPublicIps(callback) {
                    networkClient.publicIPAddresses.list(options.params.group, function (error, ipAddresses) {
                        if(error) return callback(error);
                        return callback(null, { ipAddresses });
                    });
                }

                async.auto({ listLoadBalancers, listPublicIps }, function(error, results) {
                    utils.checkError(error, 732, cb, () => {
                        async.map(results.listLoadBalancers.loadBalancers, function(oneloadBalancer, callback) {
                            return callback(null, helper.buildLoadBalancerRecord({ loadBalancer: oneloadBalancer, publicIpsList: results.listPublicIps.ipAddresses }));
                        }, function(error, loadBalancersList) {
                            return cb(null, loadBalancersList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Create a new load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating/updating laod balancer ${options.params.name} in resource group ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });

                function map(callback) {
                    options.soajs.log.debug(`Step 1: Mapping laod balancer ${options.params.name} configurations from input ...`);
                    let mapping = {};
                    mapping.group = options.params.group;
                    mapping.name = options.params.name;
                    mapping.region = options.params.region;
                    mapping.addressPools = options.params.addressPools;

                    mapping.ipConfigs = [];
                    mapping.ports = [];
                    mapping.natRules = [];
                    mapping.natPools = [];
                    if (options.params.rules && Array.isArray(options.params.rules) && options.params.rules.length > 0){
	                    options.params.rules.forEach((oneRule) => {
		                    if(oneRule.name && oneRule.config) {
			                    let oneIpConfig = {
				                    name: oneRule.name,
				                    privateIpAllocationMethod: oneRule.config.privateIpAllocationMethod,
				                    isPublic: oneRule.config.isPublic
			                    };
			                    if(oneRule.config.privateIpAddress) {
				                    oneIpConfig.privateIpAddress = oneRule.config.privateIpAddress;
			                    }

			                    if(oneIpConfig.isPublic && oneRule.config.publicIpAddress && oneRule.config.publicIpAddress.id) {
				                    oneIpConfig.publicIpAddressId = oneRule.config.publicIpAddress.id;
			                    }
			                    else if(!oneIpConfig.isPublic && oneRule.config.subnet && oneRule.config.subnet.id) {
				                    oneIpConfig.subnetId = oneRule.config.subnet.id;
			                    }

			                    mapping.ipConfigs.push(oneIpConfig);
		                    }

		                    if(oneRule.ports && Array.isArray(oneRule.ports) && oneRule.ports.length > 0) {
			                    oneRule.ports.map((onePort) => { onePort.ipConfigName = oneRule.name; });
			                    mapping.ports = mapping.ports.concat(oneRule.ports);
		                    }

		                    if(oneRule.natRules && Array.isArray(oneRule.natRules) && oneRule.natRules.length > 0) {
			                    oneRule.natRules.map((oneNatRule) => { oneNatRule.ipConfigName = oneRule.name; });
			                    mapping.natRules = mapping.natRules.concat(oneRule.natRules);
		                    }

		                    if(oneRule.natPools && Array.isArray(oneRule.natPools) && oneRule.natPools.length > 0) {
			                    oneRule.natPools.map((oneNatPool) => { oneNatPool.ipConfigName = oneRule.name; });
			                    mapping.natPools = mapping.natPools.concat(oneRule.natPools);
		                    }
	                    });
                    }


                    options.params = mapping;
                    return callback(null, true);
                }

                function validate(result, callback) {
	                options.soajs.log.debug(`Step 2: Validating laod balancer ${options.params.name} configurations ...`);
	                let validationErrors = [];
	                if (!options.params.addressPools || !Array.isArray(options.params.addressPools) || options.params.addressPools.length === 0) {
		                validationErrors.push('There should be at least one backend address pool configured for a load balancer');
	                }

	                if (!options.params.ipConfigs || !Array.isArray(options.params.ipConfigs) || options.params.ipConfigs.length === 0) {
		                validationErrors.push('There should be at least one ip configuration for a load balancer');
	                }

	                if(options.params.ipConfigs && Array.isArray(options.params.ipConfigs) && options.params.ipConfigs.length > 1) {
		                let validIpConfigs = options.params.ipConfigs.reduce((valid, currentConfig, currentIndex, configsArray) => {
			                if(configsArray[currentIndex - 1]) {
				                return (valid && (currentConfig.isPublic === configsArray[currentIndex - 1].isPublic));
			                }

			                return true;
		                });

		                if(!validIpConfigs) {
			                validationErrors.push('All ip configurations should be either public or private');
		                }
	                }

	                if (options.params.natPools && Array.isArray(options.params.natPools) && options.params.natPools.length > 0 &&
		                options.params.natRules && Array.isArray(options.params.natRules) && options.params.natRules.length > 0) {
		                validationErrors.push('One of NAT pools or NAT rules can be applied to a load balancer, they cannot coexist');
	                }

	                if (validationErrors.length > 0) {
		                return callback({code: 760, value: validationErrors.join(', ')});
	                }

                    return callback(null, true);
                }

                function applyLbConfig(result, callback) {
                    options.soajs.log.debug(`Step 3: Applying laod balancer ${options.params.name} basic settings ...`);
                    let params = {
                        location: options.params.region,
                        backendAddressPools: lbs.buildAddressPoolsConfig(options.params.addressPools),
                        frontendIPConfigurations: lbs.computeFrontendIpConfigs(options.params.ipConfigs, { subscriptionId: options.infra.api.subscriptionId, group: options.params.group }),

                        tags: options.params.labels || {}
                    };

                    networkClient.loadBalancers.createOrUpdate(options.params.group, options.params.name, params, function (error, response) {
                        if(error) return callback(error);
                        return callback(null, response);
                    });
                }

                function applyLbRules(result, callback) {
                    options.soajs.log.debug(`Step 4: Applying laod balancer ${options.params.name} rules and probes ...`);
                    let portsConfig = lbs.buildLoadBalancerRules(options.params.ports, { subscriptionId: options.infra.api.subscriptionId, group: options.params.group, lbName: options.params.name });
                    let params = {
                        location: options.params.region,
                        loadBalancingRules: portsConfig.lbRules,
                        probes: portsConfig.lbProbes,
                        inboundNatPools: [],
                        inboundNatRules: [],

                        backendAddressPools: lbs.buildAddressPoolsConfig(options.params.addressPools),
                        frontendIPConfigurations: lbs.computeFrontendIpConfigs(options.params.ipConfigs, { subscriptionId: options.infra.api.subscriptionId, group: options.params.group }),
                    };

                    // one of NAT pools or NAT rules can be applied, they cannot coexist on the same load balancer
                    if(options.params.natPools && Array.isArray(options.params.natPools) && options.params.natPools.length > 0) {
                        params.inboundNatPools = lbs.buildInboundNATPools(options.params.natPools, { subscriptionId: options.infra.api.subscriptionId, group: options.params.group, lbName: options.params.name });
                    }
                    else if(options.params.natRules && Array.isArray(options.params.natRules) && options.params.natRules.length > 0) {
                        params.inboundNatRules = lbs.buildInboundNATRules(options.params.natRules, { subscriptionId: options.infra.api.subscriptionId, group: options.params.group, lbName: options.params.name });
                    }

                    networkClient.loadBalancers.createOrUpdate(options.params.group, options.params.name, params, function (error, response) {
                        if(error) return callback(error);
                        return callback(null, response);
                    });
                }

                let steps = {
                    map,
                    validate: ['map', validate],
                    stepOne: ['validate', applyLbConfig],
                    stepTwo: ['stepOne', applyLbRules]
                };

                if(options.params.reverseUpdate) {
                    steps.stepOne = ['validate', applyLbRules];
                    steps.stepTwo = ['stepOne', applyLbConfig];
                }

                async.auto(steps, function(error, results) {
                    utils.checkError(error, (error && error.code) ? error.code : 749, cb, () => {
                        let lbInfo = results.stepTwo.id.split('/');
                        return cb(null, {
                            id: results.stepTwo.id,
                            name: results.stepTwo.name,
                            region: results.stepTwo.location,
                            group: lbInfo[lbInfo.indexOf('resourceGroups') + 1]
                        });
                    });
                });
            });
        });
    },

    /**
    * Update a load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.loadBalancers.get(options.params.group, options.params.name, function (error, lbRecord) {
                    utils.checkError(error, 732, cb, () => {
                        // if one or more ip rules were deleted:
                        // -> delete ports/nats for this ip rule
                        // -> then delete ip rule config
                        // if one or more ip rules were added:
                        // -> create ip rule config
                        // -> create ports/nats for the ip rule
                        options.params.reverseUpdate = lbs.detectReverseUpdate(options, lbRecord);
                        return lbs.create(options, cb);
                    });
                });
            });
        });
    },

    /**
    * Delete a load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting load Balancer ${options.params.name}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.loadBalancers.deleteMethod(options.params.group, options.params.name, function (error, response) {
                    utils.checkError(error, 741, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    },

    /**
    * Build the load balancing rules and probes based on the input ports

    * @param  {Array}   ports  The list of ports
    * @return {Object}
    */
    buildLoadBalancerRules: function(ports, options) {
        let lbRules = [], lbProbes = [];

        if(Array.isArray(ports) && ports.length > 0) {
            ports.forEach(onePort => {
                let oneRule = {
                    name: onePort.name,
                    backendAddressPool: {
                        id: helper.buildAzureId(config.lbAddressPoolIdFormat, { SUBSCRIPTION_ID: options.subscriptionId, GROUP_NAME: options.group, LB_NAME: options.lbName, ADDRESS_POOL_NAME: onePort.addressPoolName })
                    },
                    protocol: helper.capitalize(onePort.protocol, 'All'), //Tcp, Udp, All
                    backendPort: onePort.target,
                    frontendPort: onePort.published || (Math.floor(Math.random() * 2768) + 30000),
                    idleTimeoutInMinutes: onePort.idleTimeoutInMinutes || 30,
                    loadDistribution: helper.capitalize(onePort.loadDistribution, 'Default'), // Default, SourceIP, SourceIPProtocol
                    enableFloatingIP: onePort.enableFloatingIP || false,
                    disableOutboundSnat: onePort.disableOutboundSnat || false,
                    frontendIPConfiguration: {
                        id: helper.buildAzureId(config.lbIpConfigIdFormat, { SUBSCRIPTION_ID: options.subscriptionId, GROUP_NAME: options.group, LB_NAME: options.lbName, CONFIG_NAME: onePort.ipConfigName })
                    },
                    probe: { id: '' }
                };

                let oneProbe = {
                    name: `${onePort.name}-probe`,
                    port: onePort.healthProbePort || onePort.target,
                    protocol: helper.capitalize(onePort.healthProbeProtocol, 'Http'), // Http, Tcp, Https
                    requestPath: onePort.healthProbeRequestPath,

                    numberOfProbes: onePort.maxFailureAttempts || 5,
                    intervalInSeconds: onePort.healthProbeInterval || 10
                };

                oneRule.probe.id = helper.buildAzureId(config.lbHealthProbeIdFormat, { SUBSCRIPTION_ID: options.subscriptionId, GROUP_NAME: options.group, LB_NAME: options.lbName, LB_PROBE_NAME: oneProbe.name });

                lbRules.push(oneRule);
                lbProbes.push(oneProbe);
            });
        }

        return { lbRules, lbProbes };
    },

    /**
    * Compute the public and private ip configurations of the load balancer

    * @param  {Object}   ports  The list of ports
    * @return {Array}
    */
    computeFrontendIpConfigs: function(ipConfigs, options) {
        let configs = [];

        if(ipConfigs && Array.isArray(ipConfigs) && ipConfigs.length > 0) {
            ipConfigs.forEach((oneEntry) => {
                let oneConfig = {
                    name: oneEntry.name,
                    privateIPAllocationMethod: helper.capitalize(oneEntry.privateIpAllocationMethod, 'Dynamic'),
                };

                if(oneConfig.privateIPAllocationMethod === 'Static') {
                    oneConfig.privateIPAddress = oneEntry.privateIpAddress;
                }

                if(oneEntry.isPublic && oneEntry.publicIpAddressId) {
                    oneConfig.publicIPAddress = { id: oneEntry.publicIpAddressId };
                }
                else if(!oneEntry.isPublic && oneEntry.subnetId) {
                    oneConfig.subnet = { id: oneEntry.subnetId };
                }

                configs.push(oneConfig);
            });
        }

        return configs;
    },

    /**
    * Build the backend address pools list that the load balancer will be linked to

    * @param  {Array}   ports  The list of ports
    * @return {Object}
    */
    buildAddressPoolsConfig: function(addressPools) {
        let addressPoolsOutput = [];

        if(addressPools && Array.isArray(addressPools) && addressPools.length > 0) {
            addressPools.forEach((oneAddressPool) => {
                // no extra mapping required for now
                addressPoolsOutput.push({
                    name: oneAddressPool.name
                });
            });
        }

        return addressPoolsOutput;
    },

    /**
    * Build the inbound NAT pools for the load balancer

    * @param  {Array}   natPools  The list of NAT pools
    * @return {Object}
    */
    buildInboundNATPools: function(natPools, options) {
        let natPoolsOutput = [];

        if(natPools && Array.isArray(natPools) && natPools.length > 0) {
            natPools.forEach((oneNatPool) => {
                natPoolsOutput.push({
                    name: oneNatPool.name,
                    backendPort: oneNatPool.backendPort,
                    protocol: helper.capitalize(oneNatPool.protocol, 'All'), // Tcp, Udp, All
                    enableFloatingIP: oneNatPool.enableFloatingIP || false,
                    frontendPortRangeStart: oneNatPool.frontendPortRangeStart,
                    frontendPortRangeEnd: oneNatPool.frontendPortRangeEnd,
                    idleTimeoutInMinutes: oneNatPool.idleTimeoutInMinutes || 30,
                    frontendIPConfiguration: {
                        id: helper.buildAzureId(config.lbIpConfigIdFormat, { SUBSCRIPTION_ID: options.subscriptionId, GROUP_NAME: options.group, LB_NAME: options.lbName, CONFIG_NAME: oneNatPool.ipConfigName })
                    }
                });
            });
        }

        return natPoolsOutput;
    },

    /**
    * Build the inbound NAT rules for the load balancer

    * @param  {Array}   inboundNatRules  The list of NAT rules
    * @return {Object}
    */
    buildInboundNATRules: function(inboundNatRules, options) {
        let inboundNatRulesOutput = [];

        if(inboundNatRules && Array.isArray(inboundNatRules) && inboundNatRules.length > 0) {
            inboundNatRules.forEach((oneNatRule) => {
                inboundNatRulesOutput.push({
                    name: oneNatRule.name,
                    backendPort: oneNatRule.backendPort,
                    protocol: helper.capitalize(oneNatRule.protocol, 'All'), //Tcp, Udp, All
                    enableFloatingIP: oneNatRule.enableFloatingIP || false,
                    frontendPort: oneNatRule.frontendPort,
                    idleTimeoutInMinutes: oneNatRule.idleTimeoutInMinutes || 30,
                    frontendIPConfiguration: {
                        id: helper.buildAzureId(config.lbIpConfigIdFormat, { SUBSCRIPTION_ID: options.subscriptionId, GROUP_NAME: options.group, LB_NAME: options.lbName, CONFIG_NAME: oneNatRule.ipConfigName })
                    }
                });
            });
        }

        return inboundNatRulesOutput;
    },

    /**
    * Detect if the lb rules should be applied before the configuration

    * @param  {Object}   options  Data passed to function as params
    * @param  {Object}   lbRecord The record of the current load balancer
    * @return {boolean}
    */
    detectReverseUpdate: function(options, lbRecord) {
        let reverseUpdate = false;

        if(lbRecord && lbRecord.frontendIPConfigurations && Array.isArray(lbRecord.frontendIPConfigurations) && lbRecord.frontendIPConfigurations.length > 0) {
            if(options.params && options.params.rules && Array.isArray(options.params.rules) && options.params.rules.length > 0) {
                let detectDeletedRules = false;
                lbRecord.frontendIPConfigurations.forEach((oneIpConfig) => {
                    let foundRule = options.params.rules.find((oneRule) => {
                        return oneRule.name === oneIpConfig.name;
                    });

                    if(!foundRule) detectDeletedRules = true;
                });

                if(detectDeletedRules) reverseUpdate = true;
            }
            else {
                reverseUpdate = true;
            }
        }

        return reverseUpdate;
    }

};

module.exports = lbs;
