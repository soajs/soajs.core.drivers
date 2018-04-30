'use strict';

const async = require('async');
const azureApi = require('ms-rest-azure');
const AzureComputeManagementClient = require('azure-arm-compute');
const AzureStorageManagementClient = require('azure-arm-storage');
const AzureNetworkManagementClient = require('azure-arm-network');
const AzureResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

const helper = require('./helper');
const config = require('./config');

const driver = {

    /**
     * Gets the connector to the appropriate azure api
     * @param  {Object}   opts  Options passed to function as params
     * @return {Instance}       Instance of the azure api class
     */
    getConnector: function(opts) {
        switch (opts.api) {
            case 'compute':
    			return new AzureComputeManagementClient(opts.credentials, opts.subscriptionId);
            case 'storage':
                return new AzureStorageManagementClient(opts.credentials, opts.subscriptionId);
            case 'network':
                return new AzureNetworkManagementClient(opts.credentials, opts.subscriptionId);
            case 'resource':
                return new AzureResourceManagementClient(opts.credentials, opts.subscriptionId);
            default:
                return new AzureComputeManagementClient(opts.credentials, opts.subscriptionId);
        }
    },

    /**
     * Authenticate using the provided credentials

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    authenticate: function(options, cb) {
        azureApi.loginWithServicePrincipalSecret(options.infra.api.clientId, options.infra.api.secret, options.infra.api.domain, function (error, credentials, subscriptions) {
            if(error) return cb(error);

            return cb(null, { credentials, subscriptions });
        });
    },

    /**
     * Create a virtual machine on MS Azure

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deployVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            const networkClient = driver.getConnector({ api: 'network', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            const storageClient = driver.getConnector({ api: 'storage', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            const resourceClient = driver.getConnector({ api: 'resource', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });

            async.auto({

                createResourceGroup: function(callback) {
                    let opts = {
                        resourceGroupName: options.params.resourceGroupName, //TODO: set name
                        location: options.params.location,
                        // tags: options.params.resourceGroup.tags || {}
                    };
                    options.soajs.log.debug(`Creating resource group ${options.params.resourceGroupName}`);
                    return helper.createResourceGroup(resourceClient, opts, function(error, resourceGroup) {
                        if(error) return callback(error);
                        return callback(null, resourceGroup);
                    });
                },
                createStorageAccount: ['createResourceGroup', function(result, callback) {
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
                createVirtualNetwork: ['createResourceGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: options.params.location,
                        vnetName: result.createResourceGroup.name,
                        addressPrefixes: (options.params.virtualNetwork && options.params.virtualNetwork.addressPrefixes) ? options.params.virtualNetwork.addressPrefixes : null,
                        dhcpServers: (options.params.virtualNetwork && options.params.virtualNetwork.dhcpServers) ? options.params.virtualNetwork.dhcpServers : null,
                        subnets: (options.params.virtualNetwork && options.params.virtualNetwork.subnets) ? options.params.virtualNetwork.subnets : null
                    };
                    options.soajs.log.debug(`Creating virtual network ${opts.vnetName}`);
                    return helper.createVirtualNetwork(networkClient, opts, function(error, virtualNetwork) {
                        if(error) return callback(error);

                        return callback(null, virtualNetwork);
                    });
                }],
                getSubnetInfo: ['createResourceGroup', 'createVirtualNetwork', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        vnetName: result.createVirtualNetwork.name,
                        subnetName: (result.createVirtualNetwork.subnets &&
                            result.createVirtualNetwork.subnets[0] &&
                            result.createVirtualNetwork.subnets[0].name) ? result.createVirtualNetwork.subnets[0].name : null
                    };
                    options.soajs.log.debug(`Getting subnet information ${opts.subnetName}`);
                    return helper.getSubnetInfo(networkClient, opts, function(error, subnetInfo) {
                        if(error) return callback(error);

                        return callback(null, subnetInfo);
                    });
                }],
                createPublicIP: ['createResourceGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: options.params.location,
                        publicIPName: result.createResourceGroup.name,
                        publicIPAllocationMethod: (options.params.publicIP && options.params.publicIP.allocationMethod) ? options.params.publicIP.allocationMethod : 'Dynamic',
                        // domainNameLabel: options.params.publicIP.domainNameLabel
                    };
                    options.soajs.log.debug(`Creating public IP address ${opts.publicIPName}`);
                    return helper.createPublicIP(networkClient, opts, function(error, publicIP) {
                        if(error) return callback(error);

                        return callback(null, publicIP);
                    });
                }],
                createNetworkSecurityGroup: ['createResourceGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: options.params.location,
                        networkSecurityGroupName: result.createResourceGroup.name,

                        //NOTE: azure package function not working properly, passing these options to make an api call direclty
                        bearerToken: authData.credentials.tokenCache._entries[0].accessToken,
                        subscriptionId: options.infra.api.subscriptionId,
                    };
                    options.soajs.log.debug(`Creating network security group ${result.createResourceGroup.name}`);
                    return helper.createNetworkSecurityGroup(networkClient, opts, function(error, networkSecurityGroup) {
                        if(error) return callback(error);

                        return callback(null, networkSecurityGroup);
                    });
                }],
                createNetworkInterface: ['createResourceGroup', 'getSubnetInfo', 'createPublicIP', 'createNetworkSecurityGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: options.params.location,
                        networkInterfaceName: result.createResourceGroup.name,
                        ipConfigName: result.createResourceGroup.name,
                        subnetInfo: result.getSubnetInfo,
                        publicIPInfo: result.createPublicIP,
                        publicIPAllocationMethod: result.createPublicIP.publicIPAllocationMethod || 'Dynamic',
                        networkSecurityGroupName: result.createNetworkSecurityGroup.id
                    };
                    options.soajs.log.debug(`Creating network interface ${opts.networkInterfaceName}`);
                    return helper.createNetworkInterface(networkClient, opts, function(error, networkInterface) {
                        if(error) return callback(error);

                        return callback(null, networkInterface);
                    });
                }],
                getVMImage: function(callback) {
                    let opts = {
                        location: options.params.location,
                        publisher: options.params.image.prefix,
                        offer: options.params.image.name,
                        sku: options.params.image.tag
                    };
                    options.soajs.log.debug(`Finding VM image ${opts.publisher} - ${opts.offer} - ${opts.sku}`);
                    return helper.getVMImage(computeClient, opts, callback);
                },
                getNetworkInterfaceInfo: ['createResourceGroup', 'createNetworkInterface', function(result, callback) {
                    //NOTE: might not be needed
                    return callback();
                    // let opts = {
                    //     resourceGroupName: result.createResourceGroup.name,
                    //     networkInterfaceName: result.createNetworkInterface.name
                    // };
                    // options.soajs.log.debug(`Getting network interface information ${opts.networkInterfaceName}`);
                    // return helper.getNetworkInterfaceInfo(networkClient, opts, callback);
                }],
                createVirtualMachine: ['createResourceGroup', 'createStorageAccount', 'createVirtualNetwork', 'createPublicIP', 'createNetworkInterface', 'getVMImage', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: options.params.location,
                        vmName: options.params.instance.name, //TODO: set name
                        adminUsername: options.params.instance.admin.username,
                        vmSize: options.params.instance.size,
                        image: {
                            publisher: options.params.image.prefix,
                            offer: options.params.image.name,
                            sku: options.params.image.tag,
                            version: result.getVMImage.name
                        },
                        disk: {
                            osDiskName: options.params.instance.osDiskName, //TODO: check source
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

                    options.soajs.log.debug(`Creating virtual machine ${opts.vmName}`);
                    return helper.createVirtualMachine(computeClient, opts, callback);
                }]

            }, function (error, result) {
                if(error) return cb(error); //TODO: rollback in case of error?
                return cb(null, helper.buildVMRecord({ vm: result.createVirtualMachine, infra: options.infra }));
            });
        });
    },

    /**
     * Get information about deployed vitual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    inspectVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.get(options.params.resourceGroupName, options.params.vmName, function (error, vmInfo) {
                if(error) return cb(error);
                return cb(null, helper.buildVMRecord({ vm: vmInfo, infra: options.infra }));
            });
        });
    },

    /**
     * Turn off a virtual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    powerOffVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.powerOff(options.params.resourceGroupName, options.params.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Start a virtual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    startVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.start(options.params.resourceGroupName, options.params.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * List available virtual machines by subscription

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVMs: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.listAll(function (error, vms) {
                if(error) return cb(error);

                if(!(vms && Array.isArray(vms))) vms = [];
                async.map(vms, function(oneVm, callback) {
                    return callback(null, helper.buildVMRecord({ vm: oneVm, infra: options.infra }));
                }, cb);
            });
        });
    },

    /**
     * Delete a virtual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deleteVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.deleteMethod(options.params.resourceGroupName, options.params.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Restart a virtual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    restartVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.restart(options.params.resourceGroupName, options.params.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Redeploy a virtual machine

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    redeployVM: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachines.redeploy(options.params.resourceGroupName, options.params.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Delete a resource group

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deleteResourceGroup: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const resourceClient = driver.getConnector({ api: 'resource', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            resourceClient.resourceGroups.deleteMethod(options.params.resourceGroupName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * List available virtual machine sizes

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmSizes: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachineSizes.list(options.params.location, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image publishers

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImagePublishers: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachineImages.listPublishers(options.params.location, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image publisher images

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImagePublisherOffers: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachineImages.listOffers(options.params.location, options.params.publisher, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image versions

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImageVersions: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: options.infra.api.subscriptionId });
            computeClient.virtualMachineImages.listSkus(options.params.location, options.params.publisher, options.params.offer, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available azure regions (aka locations)

     * @param  {Object}   options  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listRegions: function(options, cb) {
        driver.authenticate(options, (error, authData) => {
            let opts = {
                subscriptionId: options.infra.api.subscriptionId,
                bearerToken: authData.credentials.tokenCache._entries[0].accessToken
            };

            helper.listRegions(opts, function(error, regions) {
                if(error) return cb(error);
                return cb(null, (regions) ? regions : []);
            });
        });
    }
};

module.exports = driver;
