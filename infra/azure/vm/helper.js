'use strict';

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
            }
        };
        return computeClient.virtualMachines.createOrUpdate(opts.resourceGroupName, opts.vmName, params, cb);
    }

};

module.exports = helper;
