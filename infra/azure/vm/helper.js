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
            opts.addressPrefixes = ['10.0.0.0/24'];
        }

        if(!(opts.dhcpServers && Array.isArray(opts.dhcpServers))) {
            // opts.dhcpServers = ['10.1.1.1', '10.1.2.4'];
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
                dnsServers: opts.dhcpServers || []
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

    createNetworkSecurityGroup: function(networkClient, opts, cb) {
        let requestOptions = {
            method: 'PUT',
            uri: `https://management.azure.com/subscriptions/${opts.subscriptionId}/resourceGroups/${opts.resourceGroupName}/providers/Microsoft.Network/networkSecurityGroups/${opts.networkSecurityGroupName}?api-version=${config.apiVersion2018}`,
            headers: { Authorization: `Bearer ${opts.bearerToken}` },
            json: true,
            body: {
                location: opts.location,
                properties: {
                    securityRules: [
                        {
                            name: "default-allow-ssh",
                            properties: {
                                priority: 1000,
                                protocol: "Tcp",
                                access: "Allow",
                                direction: "Inbound",
                                sourceAddressPrefix: "*",
                                sourcePortRange: "*",
                                destinationAddressPrefix: "*",
                                destinationPortRange: "22"
                            }
                        }
                    ]
                }
            }
        };

        request(requestOptions, function(error, response, body) {
            if(error) return cb(error);
            if(body && body.error) return cb(body.error);
            
            console.log(JSON.stringify (body, null, 2));
            return cb(null, body);
        });
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
            ],
            networkSecurityGroup: {
                id: opts.networkSecurityGroupName
            }
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

        //check if password or SSH token
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

        return computeClient.virtualMachines.createOrUpdate(opts.resourceGroupName, opts.vmName, params, cb);
    },

    listRegions: function(opts, cb) {
        let requestOptions = {
            method: 'GET',
            uri: `https://management.azure.com/subscriptions/${opts.subscriptionId}/locations?api-version=${config.apiVersion2016}`,
            headers: { Authorization: `Bearer ${opts.bearerToken}` },
            json: true
        };

        request(requestOptions, function(error, response, body) {
            if(error) return cb(error);

            let regions = helper.buildRegionsRecord(body.value);

            return cb(null, regions);
        });
    },

    buildVMRecord: function(opts) {
        let record = { type: 'vm' };

        if(opts.vm) {
            if(opts.vm.name) record.name = opts.vm.name;
            if(opts.vm.name) record.id = opts.vm.name;

            record.labels = {};
            if(opts.vm.tags) record.labels = opts.vm.tags;
            if(opts.vm.location) record.labels['soajs.service.vm.location'] = opts.vm.location;
            if(opts.vm.id) {
                let idInfo = opts.vm.id.split('/');
                record.labels['soajs.service.vm.group'] = idInfo[idInfo.indexOf('resourceGroups') + 1];
            }
            if(opts.vm.hardwareProfile && opts.vm.hardwareProfile.vmSize) record.labels['soajs.service.vm.size'] = opts.vm.hardwareProfile.vmSize;

            record.ports = [];
            record.voluming = {};

            record.tasks = [];
            record.tasks[0] = {};
            if(opts.vm.name) record.tasks[0].id = opts.vm.name;
            if(opts.vm.name) record.tasks[0].name = opts.vm.name;

            record.tasks[0].status = {};
            if(opts.vm.provisioningState) record.tasks[0].status.state = opts.vm.provisioningState.toLowerCase();
            if(opts.vm.provisioningState) record.tasks[0].status.ts = new Date().getTime();

            record.tasks[0].ref = { os: {} };
            if(opts.vm.storageProfile) {
                if(opts.vm.storageProfile.osDisk) {
                    if(opts.vm.storageProfile.osDisk.osType) record.tasks[0].ref.os.type = opts.vm.storageProfile.osDisk.osType;
                    if(opts.vm.storageProfile.osDisk.diskSizeGB) record.tasks[0].ref.os.diskSizeGB = opts.vm.storageProfile.osDisk.diskSizeGB;
                }
            }
        }

        record.env = [];

        record.servicePortType = ""; //TODO: when we support ports
        record.ip = "";  //TODO: when we support ports

        return record;
    },

    buildRegionsRecord: function(opts) {
        let regions = [];

        opts.forEach(oneRegion => {
            regions.push({
                "v": oneRegion.name,
                "l": oneRegion.displayName
            });
        });

        return regions;
    }
};

module.exports = helper;
