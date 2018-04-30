'use strict';

const request = require('request');

const config = require('./config');

const helper = {

    createResourceGroup: function(resourceClient, opts, cb) {
        let groupParameters = { location: opts.location, tags: opts.tags || {} };

        return resourceClient.resourceGroups.createOrUpdate(opts.resourceGroupName, groupParameters, cb);
    },

    createStorageAccount: function(storageClient, opts, cb) {
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

    createVirtualNetwork: function(networkClient, opts, cb) {
        if(!(opts.addressPrefixes && Array.isArray(opts.addressPrefixes))) {
            opts.addressPrefixes = ['10.0.0.0/16'];
        }

        if(!(opts.dhcpServers && Array.isArray(opts.dhcpServers))) {
            opts.dhcpServers = ['10.1.1.1', '10.1.2.4'];
        }

        if(!(opts.subnets && Array.isArray(opts.subnets))) {
            opts.subnets = [
                { name: 'subnet', addressPrefix: '10.0.0.0/24' }
            ];
        }

        let params = {
            location: opts.location,
            addressSpace: {
                addressPrefixes: opts.addressPrefixes
            },
            dhcpOptions: {
                dnsServers: opts.dhcpServers
            },
            subnets: opts.subnets
        };
        return networkClient.virtualNetworks.createOrUpdate(opts.resourceGroupName, opts.vnetName, params, cb);
    },

    getSubnetInfo: function(networkClient, opts, cb) {
        return networkClient.subnets.get(opts.resourceGroupName, opts.vnetName, opts.subnetName, cb);
    },

    createPublicIP: function(networkClient, opts, cb) {
        let params = {
            location: opts.location,
            publicIPAllocationMethod: opts.publicIPAllocationMethod || 'Dynamic',
            // dnsSettings: {
            //     domainNameLabel: opts.domainNameLabel
            // }
        };

        return networkClient.publicIPAddresses.createOrUpdate(opts.resourceGroupName, opts.publicIPName, params, cb);
    },

    createNetworkInterface: function(networkClient, opts, cb) {
        let params = {
            location: opts.location,
            ipConfigurations: [
                {
                    name: opts.ipConfigName,
                    privateIPAllocationMethod: opts.publicIPAllocationMethod || 'Dynamic',
                    subnet: opts.subnetInfo,
                    publicIPAddress: opts.publicIPInfo
                }
            ]
        };

        return networkClient.networkInterfaces.createOrUpdate(opts.resourceGroupName, opts.networkInterfaceName, params, cb);
    },

    getVMImage: function(computeClient, opts, cb) { //TODO: check get image instead of list images
        return computeClient.virtualMachineImages.list(opts.location, opts.publisher, opts.offer, opts.sku, { top: 1 }, (error, imageList) => {
            if(error) return cb(error);

            return cb(null, (imageList && imageList[0]) ? imageList[0] : {});
        });
    },

    getNetworkInterfaceInfo: function(networkClient, opts, cb) {
        return networkClient.networkInterfaces.get(opts.resourceGroupName, opts.networkInterfaceName, cb);
    },

    createVirtualMachine: function(computeClient, opts, cb) {
        let params = {
            location: opts.location,
            osProfile: {
                computerName: opts.vmName,
                adminUsername: opts.adminUsername,
                adminPassword: opts.adminPassword
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
        return computeClient.virtualMachines.createOrUpdate(opts.resourceGroupName, opts.vmName, params, cb);
    },

    listRegions: function(opts, cb) {
        let requestOptions = {
            method: 'GET',
            uri: `https://management.azure.com/subscriptions/${opts.subscriptionId}/locations?api-version=${config.apiVersion}`,
            headers: { Authorization: `Bearer ${opts.bearerToken}` },
            json: true
        };

        request(requestOptions, function(error, response, body) {
            if(error) return cb(error);

            return cb(null, body);
        });
    },

    buildVMRecord: function(opts) {
        let record = { type: 'vm' };

        if(opts.vm) {
            if(opts.vm.name) record.name = opts.vm.name;
            if(opts.vm.location) record.location = opts.vm.location;
            if(opts.vm.provisioningState) record.status = opts.vm.provisioningState.toLowerCase();
            if(opts.vm.id) {
                let idInfo = opts.vm.id.split('/');
                record.group = idInfo[idInfo.indexOf('resourceGroups') + 1];
            }

            if(opts.vm.hardwareProfile && opts.vm.hardwareProfile.vmSize) record.size = opts.vm.hardwareProfile.vmSize;

            if(opts.vm.storageProfile) {
                if(opts.vm.storageProfile.imageReference) {
                    record.image = {};
                    if(opts.vm.storageProfile.imageReference.publisher) record.image.prefix = opts.vm.storageProfile.imageReference.publisher;
                    if(opts.vm.storageProfile.imageReference.offer) record.image.name = opts.vm.storageProfile.imageReference.offer;
                    if(opts.vm.storageProfile.imageReference.sku) record.image.tag = opts.vm.storageProfile.imageReference.sku;
                }

                if(opts.vm.storageProfile.osDisk) {
                    record.os = {};
                    if(opts.vm.storageProfile.osDisk.name) record.os.diskName = opts.vm.storageProfile.osDisk.name;
                    if(opts.vm.storageProfile.osDisk.osType) record.os.type = opts.vm.storageProfile.osDisk.osType;
                    if(opts.vm.storageProfile.osDisk.diskSizeGB) record.os.diskSizeGB = opts.vm.storageProfile.osDisk.diskSizeGB;
                }

                if(opts.vm.storageProfile.dataDisks) {
                    record.volumes = [];
                    //NOTE: not yet supported
                }
            }
        }

        if(opts.infra) {
            record.infra = {};
            if(opts.infra.id) {
                record.infra.id = opts.infra.id;
            }
        }

        return record;
    }

};

module.exports = helper;
