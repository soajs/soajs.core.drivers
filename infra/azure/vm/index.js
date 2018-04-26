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
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    authenticate: function(soajs, data, cb) {
        azureApi.loginWithServicePrincipalSecret(data.auth.clientId, data.auth.secret, data.auth.domain, function (error, credentials, subscriptions) {
            if(error) return cb(error);

            return cb(null, { credentials, subscriptions });
        });
    },

    /**
     * Create a virtual machine on MS Azure
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deployVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            const networkClient = driver.getConnector({ api: 'network', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            const storageClient = driver.getConnector({ api: 'storage', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            const resourceClient = driver.getConnector({ api: 'resource', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });

            async.auto({

                createResourceGroup: function(callback) {
                    let opts = {
                        resourceGroupName: data.resourceGroupName, //TODO: set name
                        location: data.location,
                        // tags: data.resourceGroup.tags || {}
                    };
                    return helper.createResourceGroup(soajs, resourceClient, opts, function(error, resourceGroup) {
                        if(error) return callback(error);
                        return callback(null, resourceGroup);
                    });
                },
                createStorageAccount: ['createResourceGroup', function(result, callback) {
                    return callback();
                    //NOTE: if not a managed disk, need to create a storage account manually and link it to vm
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: data.location,
                        accountName: 'storageaccount', //TODO: make dynamic, must be between 3 and 24 characters in length and use numbers and lower-case letters only
                        accountType: 'Standard_LRS', //TODO: make dynamic
                        accountKind: (data.storageAccount && data.storageAccount.accountType) ? data.storageAccount.accountType: 'Storage',
                        tags: (data.storageAccount && data.storageAccount.tags) ? data.storageAccount.tags : {}
                    };
                    return helper.createStorageAccount(soajs, storageClient, opts, callback);
                }],
                createVirtualNetwork: ['createResourceGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: data.location,
                        vnetName: result.createResourceGroup.name,
                        addressPrefixes: (data.virtualNetwork && data.virtualNetwork.addressPrefixes) ? data.virtualNetwork.addressPrefixes : null,
                        dhcpServers: (data.virtualNetwork && data.virtualNetwork.dhcpServers) ? data.virtualNetwork.dhcpServers : null,
                        subnets: (data.virtualNetwork && data.virtualNetwork.subnets) ? data.virtualNetwork.subnets : null
                    };
                    return helper.createVirtualNetwork(soajs, networkClient, opts, function(error, virtualNetwork) {
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
                    return helper.getSubnetInfo(soajs, networkClient, opts, function(error, subnetInfo) {
                        if(error) return callback(error);

                        return callback(null, subnetInfo);
                    });
                }],
                createPublicIP: ['createResourceGroup', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: data.location,
                        publicIPName: result.createResourceGroup.name,
                        publicIPAllocationMethod: (data.publicIP && data.publicIP.allocationMethod) ? data.publicIP.allocationMethod : 'Dynamic',
                        // domainNameLabel: data.publicIP.domainNameLabel
                    };
                    return helper.createPublicIP(soajs, networkClient, opts, function(error, publicIP) {
                        if(error) return callback(error);

                        return callback(null, publicIP);
                    });
                }],
                createNetworkInterface: ['createResourceGroup', 'getSubnetInfo', 'createPublicIP', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: data.location,
                        networkInterfaceName: result.createResourceGroup.name,
                        ipConfigName: result.createResourceGroup.name,
                        subnetInfo: result.getSubnetInfo,
                        publicIPInfo: result.createPublicIP,
                        publicIPAllocationMethod: result.createPublicIP.publicIPAllocationMethod || 'Dynamic'
                    };
                    return helper.createNetworkInterface(soajs, networkClient, opts, function(error, networkInterface) {
                        if(error) return callback(error);

                        return callback(null, networkInterface);
                    });
                }],
                getVMImage: function(callback) {
                    let opts = {
                        location: data.location,
                        publisher: data.image.prefix,
                        offer: data.image.name,
                        sku: data.image.tag
                    };
                    return helper.getVMImage(soajs, computeClient, opts, callback);
                },
                getNetworkInterfaceInfo: ['createResourceGroup', 'createNetworkInterface', function(result, callback) {
                    return callback();
                    //NOTE: might not be needed
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        networkInterfaceName: result.createNetworkInterface.name
                    };
                    return helper.getNetworkInterfaceInfo(soajs, networkClient, opts, callback);
                }],
                createVirtualMachine: ['createResourceGroup', 'createStorageAccount', 'createVirtualNetwork', 'createPublicIP', 'createNetworkInterface', 'getVMImage', function(result, callback) {
                    let opts = {
                        resourceGroupName: result.createResourceGroup.name,
                        location: data.location,
                        vmName: data.instance.name, //TODO: set name
                        adminUsername: data.instance.admin.username,
                        adminPassword: data.instance.admin.password,
                        vmSize: data.instance.size,
                        image: {
                            publisher: data.image.prefix,
                            offer: data.image.name,
                            sku: data.image.tag,
                            version: result.getVMImage.name
                        },
                        disk: {
                            osDiskName: data.instance.osDiskName, //TODO: check source
                            storageAccountType: data.instance.storageAccountType || 'Standard_LRS'//result.createStorageAccount.name
                        },
                        network: {
                            networkInterfaceId: result.createNetworkInterface.id
                        }
                    };
                    return helper.createVirtualMachine(soajs, computeClient, opts, callback);
                }]

            }, function (error, result) {
                if(error) return cb(error); //TODO: rollback in case of error?
                return cb(null, result.createVirtualMachine);
            });
        });
    },

    /**
     * Get information about deployed vitual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    inspectVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.get(data.resourceGroupName, data.vmName, function (error, vmInfo) {
                if(error) return cb(error);
                return cb(null, vmInfo);
            });
        });
    },

    /**
     * Turn off a virtual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    powerOffVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.powerOff(data.resourceGroupName, data.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Start a virtual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    startVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.start(data.resourceGroupName, data.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * List available virtual machines by subscription
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVMs: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.listAll(function (error, vms) {
                if(error) return cb(error);
                return cb(null, vms);
            });
        });
    },

    /**
     * Delete a virtual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deleteVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.deleteMethod(data.resourceGroupName, data.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Restart a virtual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    restartVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.restart(data.resourceGroupName, data.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Redeploy a virtual machine
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    redeployVM: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachines.redeploy(data.resourceGroupName, data.vmName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * Delete a resource group
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    deleteResourceGroup: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const resourceClient = driver.getConnector({ api: 'resource', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            resourceClient.resourceGroups.deleteMethod(data.resourceGroupName, function (error, result) {
                if(error) return cb(error);
                return cb(null, result);
            });
        });
    },

    /**
     * List available virtual machine sizes
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmSizes: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachineSizes.list(data.location, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image publishers
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImagePublishers: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachineImages.listPublishers(data.location, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image publisher images
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImagePublisherOffers: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachineImages.listOffers(data.location, data.publisher, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    },

    /**
     * List available virtual machine image versions
     * @param  {Object}   soajs SOAJS object
     * @param  {Object}   data  Data passed to function as params
     * @param  {Function} cb    Callback function
     * @return {void}
     */
    listVmImageVersions: function(soajs, data, cb) {
        driver.authenticate(soajs, data, (error, authData) => {
            if(error) return cb(error);

            const computeClient = driver.getConnector({ api: 'compute', credentials: authData.credentials, subscriptionId: data.auth.subscriptionId });
            computeClient.virtualMachineImages.listSkus(data.location, data.publisher, data.offer, function (error, vmSizes) {
                if(error) return cb(error);
                return cb(null, vmSizes);
            });
        });
    }
};

const runner = {
    "executeCommand": function (soajs, config, callback) {
        if (typeof (driver[config.command]) === 'function') {
            driver[config.command](soajs, config, callback);
        }
        else {
            return callback(new Error("Driver " + config.name + " does not support function " + config.command));
        }
    }
};

// module.exports = runner;
module.exports = driver;
