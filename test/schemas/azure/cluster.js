'use strict';
let infra = {
	"_id": '5b18008acf544bca9b55cd79',
	"api": {
		"clientId": "1",
		"secret": "2",
		"domain": "3",
		"subscriptionId": "4"
	},
	"name": "azure",
	"technologies": [
		"vm"
	],
	"templates": null,
	"drivers": [
		"Native"
	],
	"label": "Azure Driver",
	"deployments": [],
	"info": [
		[],
		[
			{
				"code": "AZURE"
			}
		],
		0
	],
};

infra.info[0] = infra.deployments[0] ? infra.deployments[0] : [];
infra.stack = infra.deployments[0];

let registry = {
	"_id": '55128442e603d7e01ab1688c',
	"code": "DASHBOARD",
	"domain": "soajs.org",
	"sitePrefix": "dashboard",
	"apiPrefix": "dashboard-api",
	"locked": true,
	"port": 80,
	"protocol": "http",
	"profile": "/opt/soajs/FILES/profiles/profile.js",
	"deployer": {
		"type": "manual",
		"selected": "manual",
		"manual": {
			"nodes": "127.0.0.1"
		},
		"container": {
			"docker": {
				"local": {
					"nodes": "127.0.0.1",
					"socketPath": "/var/run/docker.sock"
				},
				"remote": {
					"nodes": "127.0.0.1",
					"apiProtocol": "https",
					"auth": {
						"token": "%dockertoken%"
					}
				}
			},
			"kubernetes": {
				"local": {
					"nodes": "127.0.0.1",
					"namespace": "%namespace%",
					"auth": {
						"token": "%kubetoken%"
					}
				},
				"remote": {
					"nodes": "127.0.0.1",
					"namespace": "%namespace%",
					"auth": {
						"token": "%kubetoken%"
					}
				}
			}
		}
	},
	"description": "this is the Dashboard environment",
	"services": {
		"controller": {
			"maxPoolSize": 100,
			"authorization": true,
			"requestTimeout": 30,
			"requestTimeoutRenewal": 0
		},
		"config": {
			"awareness": {
				"cacheTTL": 3600000,
				"healthCheckInterval": 5000,
				"autoRelaodRegistry": 3600000,
				"maxLogCount": 5,
				"autoRegisterService": true
			},
			"agent": {
				"topologyDir": "/opt/soajs/"
			},
			"key": {
				"algorithm": "aes256",
				"password": "soajs key lal massa"
			},
			"logger": {
				"src": true,
				"level": "debug",
				"formatter": {
					"levelInString": true,
					"outputMode": "long"
				}
			},
			"cors": {
				"enabled": true,
				"origin": "*",
				"credentials": "true",
				"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
				"headers": "key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization",
				"maxage": 1728000
			},
			"oauth": {
				"grants": [
					"password",
					"refresh_token"
				],
				"debug": false,
				"accessTokenLifetime": 7200,
				"refreshTokenLifetime": 1209600
			},
			"ports": {
				"controller": 4000,
				"maintenanceInc": 1000,
				"randomInc": 100
			},
			"cookie": {
				"secret": "this is a secret sentence"
			},
			"session": {
				"name": "soajsID",
				"secret": "this is antoine hage app server",
				"cookie": {
					"path": "/",
					"httpOnly": true,
					"secure": false,
					"maxAge": null
				},
				"resave": false,
				"saveUninitialized": false,
				"rolling": false,
				"unset": "keep"
			}
		}
	}
};
let soajs = {
	"log": {
		"error": (data) => {
			return data;
		},
		"warn": (data) => {
			return data;
		},
		"info": (data) => {
			return data;
		},
		"debug": (data) => {
			return data;
		}
	},
	registry: registry,
	validator: require('jsonschema'),
};
module.exports = function () {
	let data = {
		"deployCluster": {
			"infra": infra,
			"soajs": soajs,
			"registry": registry,
			"params": {}
		},
		"virtualMachines": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/TESTER/providers/Microsoft.Compute/virtualMachines/tester-vm",
				"name": "tester-vm",
				"type": "Microsoft.Compute/virtualMachines",
				"location": "eastus",
				"tags": {
					"soajs.env.code": "tester",
					"soajs.layer.name": "tester",
					"soajs.network.name": "tester",
					"soajs.vm.name": "tester",
				},
				"hardwareProfile": {
					"vmSize": "Standard_A1"
				},
				"storageProfile": {
					"imageReference": {
						"publisher": "Canonical",
						"offer": "UbuntuServer",
						"sku": "16.04-LTS",
						"version": "latest"
					},
					"osDisk": {
						"osType": "Linux",
						"name": "myosdisk1",
						"caching": "ReadWrite",
						"createOption": "FromImage",
						"diskSizeGB": 30,
						"managedDisk": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Compute/disks/myosdisk1",
							"storageAccountType": "Standard_LRS"
						}
					},
					"dataDisks": []
				},
				"osProfile": {
					"computerName": "ubuntu",
					"adminUsername": "ubuntu",
					"linuxConfiguration": {
						"disablePasswordAuthentication": false
					},
					"secrets": []
				},
				"networkProfile": {
					"networkInterfaces": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni",
							"primary": false
						}
					]
				},
				"provisioningState": "Succeeded",
				"vmId": "f79b8165-53fa-4694-9e82-788c3b630fb3"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/virtualMachines/mongo",
				"name": "mongo",
				"type": "Microsoft.Compute/virtualMachines",
				"location": "centralus",
				"hardwareProfile": {
					"vmSize": "Standard_B1ms"
				},
				"storageProfile": {
					"imageReference": {
						"publisher": "Canonical",
						"offer": "UbuntuServer",
						"sku": "17.10",
						"version": "latest"
					},
					"osDisk": {
						"osType": "Linux",
						"name": "mongo_OsDisk_1_5aa8030cb6044037b5c8f4d6c75a391a",
						"caching": "ReadWrite",
						"createOption": "FromImage",
						"diskSizeGB": 30,
						"managedDisk": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/disks/mongo_OsDisk_1_5aa8030cb6044037b5c8f4d6c75a391a",
							"storageAccountType": "Standard_LRS"
						}
					},
					"dataDisks": []
				},
				"osProfile": {
					"computerName": "mongo",
					"adminUsername": "beaver",
					"linuxConfiguration": {
						"disablePasswordAuthentication": false
					},
					"secrets": []
				},
				"networkProfile": {
					"networkInterfaces": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mongo352"
						}
					]
				},
				"provisioningState": "Succeeded",
				"vmId": "5087838d-3241-4c26-b25c-d8e550affea1",
				"resources": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/virtualMachines/mongo/extensions/enablevmaccess"
					}
				]
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/virtualMachines/mysql",
				"name": "mysql",
				"type": "Microsoft.Compute/virtualMachines",
				"location": "centralus",
				"hardwareProfile": {
					"vmSize": "Standard_B1ms"
				},
				"storageProfile": {
					"imageReference": {
						"publisher": "Canonical",
						"offer": "UbuntuServer",
						"sku": "17.10",
						"version": "latest"
					},
					"osDisk": {
						"osType": "Linux",
						"name": "mysql_OsDisk_1_42ef3a000aff4269988d134e376e0160",
						"caching": "ReadWrite",
						"createOption": "FromImage",
						"diskSizeGB": 30,
						"managedDisk": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/disks/mysql_OsDisk_1_42ef3a000aff4269988d134e376e0160",
							"storageAccountType": "Standard_LRS"
						}
					},
					"dataDisks": []
				},
				"osProfile": {
					"computerName": "mysql",
					"adminUsername": "beaver",
					"linuxConfiguration": {
						"disablePasswordAuthentication": false
					},
					"secrets": []
				},
				"networkProfile": {
					"networkInterfaces": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mysql322"
						}
					]
				},
				"provisioningState": "Succeeded",
				"vmId": "a99bcb2b-ea47-4296-b9f0-ed7277c44edc",
				"resources": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/virtualMachines/mysql/extensions/enablevmaccess"
					}
				]
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/TESTER/providers/Microsoft.Compute/virtualMachines/tester-vm",
				"name": "windows-vm",
				"type": "Microsoft.Compute/virtualMachines",
				"location": "eastus",
				"tags": {},
				"hardwareProfile": {
					"vmSize": "Standard_A1"
				},
				"storageProfile": {
					"imageReference": {
						"publisher": "Microsoft",
						"offer": "WindowsServer",
						"sku": "10",
						"version": "latest"
					},
					"osDisk": {
						"osType": "Windows",
						"name": "myosdisk1",
						"caching": "ReadWrite",
						"createOption": "FromImage",
						"diskSizeGB": 30,
						"managedDisk": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Compute/disks/myosdisk1",
							"storageAccountType": "Standard_LRS"
						}
					},
					"dataDisks": []
				},
				"osProfile": {
					"computerName": "windows",
					"adminUsername": "owner",
					"secrets": []
				},
				"networkProfile": {
					"networkInterfaces": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/windows-vm-ni",
							"primary": false
						}
					]
				},
				"provisioningState": "Succeeded",
				"vmId": "f79b8165-53fa-4694-9e82-788c3b630fg6"
			}
		],
		"networkInterface": {
			"tester-ni": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni",
				"name": "tester-ni",
				"type": "Microsoft.Network/networkInterfaces",
				"location": "eastus",
				"tags": {},
				"virtualMachine": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Compute/virtualMachines/tester-vm"
				},
				"networkSecurityGroup": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg"
				},
				"ipConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1",
						"privateIPAddress": "10.0.2.4",
						"privateIPAllocationMethod": "Dynamic",
						"privateIPAddressVersion": "IPv4",
						"subnet": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet"
						},
						"primary": true,
						"publicIPAddress": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-ip"
						},
						"provisioningState": "Succeeded",
						"name": "testconfiguration1",
						"etag": "W/\"4d5b738e-0302-4eb8-b79c-e4e59bb208db\""
					}
				],
				"dnsSettings": {
					"dnsServers": [],
					"appliedDnsServers": [],
					"internalDomainNameSuffix": "ievoz2a0incunf5oivgbcxhedc.bx.internal.cloudapp.net"
				},
				"macAddress": "00-0D-3A-1C-7B-6E",
				"primary": true,
				"enableAcceleratedNetworking": false,
				"enableIPForwarding": false,
				"resourceGuid": "31b248e8-d34c-493b-8a24-db293dcac416",
				"provisioningState": "Succeeded",
				"etag": "W/\"4d5b738e-0302-4eb8-b79c-e4e59bb208db\""
			},
			"mongo352": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mongo352",
				"name": "mongo352",
				"type": "Microsoft.Network/networkInterfaces",
				"location": "centralus",
				"virtualMachine": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/virtualMachines/mongo"
				},
				"networkSecurityGroup": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg"
				},
				"ipConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mongo352/ipConfigurations/ipconfig1",
						"privateIPAddress": "10.0.0.4",
						"privateIPAllocationMethod": "Dynamic",
						"privateIPAddressVersion": "IPv4",
						"subnet": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/virtualNetworks/soajs-vn/subnets/mongo-subnet"
						},
						"primary": true,
						"publicIPAddress": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/publicIPAddresses/mongo-ip"
						},
						"provisioningState": "Succeeded",
						"name": "ipconfig1",
						"etag": "W/\"56dac426-5217-4ee9-acf9-0bb7e075ce3e\""
					}
				],
				"dnsSettings": {
					"dnsServers": [],
					"appliedDnsServers": [],
					"internalDomainNameSuffix": "4nzw1zpqhhcubh05ypzxdfpjyg.gx.internal.cloudapp.net"
				},
				"macAddress": "00-0D-3A-97-8A-01",
				"primary": true,
				"enableAcceleratedNetworking": false,
				"enableIPForwarding": false,
				"resourceGuid": "ae4b9fe0-55d8-4c0e-aa15-cc832c97dee0",
				"provisioningState": "Succeeded",
				"etag": "W/\"56dac426-5217-4ee9-acf9-0bb7e075ce3e\""
			},
			"mysql322": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mysql322",
				"name": "mysql322",
				"type": "Microsoft.Network/networkInterfaces",
				"location": "centralus",
				"virtualMachine": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/virtualMachines/mysql"
				},
				"networkSecurityGroup": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg"
				},
				"ipConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mysql322/ipConfigurations/ipconfig1",
						"privateIPAddress": "10.0.1.4",
						"privateIPAllocationMethod": "Dynamic",
						"privateIPAddressVersion": "IPv4",
						"subnet": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/virtualNetworks/soajs-vn/subnets/mysql-subnet"
						},
						"primary": true,
						"publicIPAddress": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/publicIPAddresses/mysql-ip"
						},
						"provisioningState": "Succeeded",
						"name": "ipconfig1",
						"etag": "W/\"599c1140-3ba4-47a5-9c80-8ff9f7b29c42\""
					}
				],
				"dnsSettings": {
					"dnsServers": [],
					"appliedDnsServers": [],
					"internalDomainNameSuffix": "4nzw1zpqhhcubh05ypzxdfpjyg.gx.internal.cloudapp.net"
				},
				"macAddress": "00-0D-3A-97-88-B0",
				"primary": true,
				"enableAcceleratedNetworking": false,
				"enableIPForwarding": false,
				"resourceGuid": "87002f65-6097-40ce-af50-fa5fb5466f85",
				"provisioningState": "Succeeded",
				"etag": "W/\"599c1140-3ba4-47a5-9c80-8ff9f7b29c42\""
			}
		},
		"networkSecurityGroup": {
			"tester-sg": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg",
				"name": "tester-sg",
				"type": "Microsoft.Network/networkSecurityGroups",
				"location": "eastus",
				"tags": {},
				"securityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/securityRules/ssh",
						"protocol": "Tcp",
						"sourcePortRange": "*",
						"destinationPortRange": "22",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 100,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "ssh",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					}
				],
				"defaultSecurityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/AllowVnetInBound",
						"description": "Allow inbound traffic from all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetInBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/AllowAzureLoadBalancerInBound",
						"description": "Allow inbound traffic from azure load balancer",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "AzureLoadBalancer",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowAzureLoadBalancerInBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/DenyAllInBound",
						"description": "Deny all inbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllInBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/AllowVnetOutBound",
						"description": "Allow outbound traffic from all VMs to all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetOutBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/AllowInternetOutBound",
						"description": "Allow outbound traffic from all VMs to Internet",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "Internet",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowInternetOutBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg/defaultSecurityRules/DenyAllOutBound",
						"description": "Deny all outbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllOutBound",
						"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
					}
				],
				"networkInterfaces": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni"
					}
				],
				"resourceGuid": "d9b39876-2b50-48cd-8e2d-39c70751bd55",
				"provisioningState": "Succeeded",
				"etag": "W/\"1560606a-18ea-4290-b02f-a887493694de\""
			},
			"mysql-nsg": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg",
				"name": "mysql-nsg",
				"type": "Microsoft.Network/networkSecurityGroups",
				"location": "centralus",
				"securityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/securityRules/default-allow-ssh",
						"protocol": "TCP",
						"sourcePortRange": "*",
						"destinationPortRange": "22",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 1000,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "default-allow-ssh",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/securityRules/mysql-port",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "3306",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 1010,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "mysql-port",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					}
				],
				"defaultSecurityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/AllowVnetInBound",
						"description": "Allow inbound traffic from all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetInBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/AllowAzureLoadBalancerInBound",
						"description": "Allow inbound traffic from azure load balancer",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "AzureLoadBalancer",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowAzureLoadBalancerInBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/DenyAllInBound",
						"description": "Deny all inbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllInBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/AllowVnetOutBound",
						"description": "Allow outbound traffic from all VMs to all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetOutBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/AllowInternetOutBound",
						"description": "Allow outbound traffic from all VMs to Internet",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "Internet",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowInternetOutBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mysql-nsg/defaultSecurityRules/DenyAllOutBound",
						"description": "Deny all outbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllOutBound",
						"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
					}
				],
				"networkInterfaces": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mysql322"
					}
				],
				"resourceGuid": "b9218f69-ff38-45fc-be83-e7775429ad65",
				"provisioningState": "Succeeded",
				"etag": "W/\"634bd2bc-3b6f-4849-905e-7c87fd30403d\""
			},
			"mongo-nsg": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg",
				"name": "mongo-nsg",
				"type": "Microsoft.Network/networkSecurityGroups",
				"location": "centralus",
				"securityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/securityRules/default-allow-ssh",
						"protocol": "TCP",
						"sourcePortRange": "*",
						"destinationPortRange": "22",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 1000,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "default-allow-ssh",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/securityRules/mongo-port",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "27017",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 1010,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "mongo-port",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					}
				],
				"defaultSecurityRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/AllowVnetInBound",
						"description": "Allow inbound traffic from all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetInBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/AllowAzureLoadBalancerInBound",
						"description": "Allow inbound traffic from azure load balancer",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "AzureLoadBalancer",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "AllowAzureLoadBalancerInBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/DenyAllInBound",
						"description": "Deny all inbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Inbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllInBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/AllowVnetOutBound",
						"description": "Allow outbound traffic from all VMs to all VMs in VNET",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "VirtualNetwork",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "VirtualNetwork",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65000,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowVnetOutBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/AllowInternetOutBound",
						"description": "Allow outbound traffic from all VMs to Internet",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "Internet",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Allow",
						"priority": 65001,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "AllowInternetOutBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					},
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkSecurityGroups/mongo-nsg/defaultSecurityRules/DenyAllOutBound",
						"description": "Deny all outbound traffic",
						"protocol": "*",
						"sourcePortRange": "*",
						"destinationPortRange": "*",
						"sourceAddressPrefix": "*",
						"sourceAddressPrefixes": [],
						"destinationAddressPrefix": "*",
						"destinationAddressPrefixes": [],
						"sourcePortRanges": [],
						"destinationPortRanges": [],
						"access": "Deny",
						"priority": 65500,
						"direction": "Outbound",
						"provisioningState": "Succeeded",
						"name": "DenyAllOutBound",
						"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
					}
				],
				"networkInterfaces": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mongo352"
					}
				],
				"resourceGuid": "6f7d919a-f83f-4aa1-948e-b13c76b6acdc",
				"provisioningState": "Succeeded",
				"etag": "W/\"a360e14f-c0ef-473e-9d11-7687c8ecd90c\""
			}
		},
		"publicIp": {
			"mongo-ip": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/publicIPAddresses/mongo-ip",
				"name": "mongo-ip",
				"type": "Microsoft.Network/publicIPAddresses",
				"location": "centralus",
				"sku": {
					"name": "Basic"
				},
				"publicIPAllocationMethod": "Dynamic",
				"publicIPAddressVersion": "IPv4",
				"ipConfiguration": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mongo352/ipConfigurations/ipconfig1"
				},
				"ipTags": [],
				"ipAddress": "104.43.136.85",
				"idleTimeout": 60,
				"resourceGuid": "129630c9-8866-406f-9e95-6c547e561db7",
				"provisioningState": "Succeeded",
				"etag": "W/\"bf09fe35-22ca-4a68-a9cb-61e576910cfb\""
			},
			"tester-ip": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-ip",
				"name": "tester-ip",
				"type": "Microsoft.Network/publicIPAddresses",
				"location": "eastus",
				"tags": {},
				"sku": {
					"name": "Basic"
				},
				"publicIPAllocationMethod": "Dynamic",
				"publicIPAddressVersion": "IPv4",
				"ipConfiguration": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
				},
				"ipTags": [],
				"ipAddress": "40.121.55.181",
				"idleTimeout": 1800,
				"resourceGuid": "3bd95664-f45d-42a7-bae9-34fe4663082e",
				"provisioningState": "Succeeded",
				"etag": "W/\"45a00d2f-4449-4793-be17-061c2ba5ba4b\""
			},
			"mysql-ip": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/publicIPAddresses/mysql-ip",
				"name": "mysql-ip",
				"type": "Microsoft.Network/publicIPAddresses",
				"location": "centralus",
				"sku": {
					"name": "Basic"
				},
				"publicIPAllocationMethod": "Dynamic",
				"publicIPAddressVersion": "IPv4",
				"ipConfiguration": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Network/networkInterfaces/mysql322/ipConfigurations/ipconfig1"
				},
				"ipTags": [],
				"ipAddress": "104.43.151.227",
				"idleTimeout": 240,
				"resourceGuid": "27748f69-bf3f-464f-8a32-a471921b284b",
				"provisioningState": "Succeeded",
				"etag": "W/\"4432dc5f-04b1-4dcd-9719-7d76d9e8152f\""
			},
			"tester-tester-ip": {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-tester-ip",
				"name": "tester-tester-ip",
				"type": "Microsoft.Network/publicIPAddresses",
				"location": "centralus",
				"tags": {},
				"sku": {
					"name": "Basic"
				},
				"publicIPAllocationMethod": "Static",
				"publicIPAddressVersion": "IPv4",
				"ipConfiguration": {
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb/frontendIPConfigurations/tester-tester-lb-ip"
				},
				"ipTags": [],
				"ipAddress": "23.99.134.149",
				"idleTimeout": 1800,
				"resourceGuid": "9add26f8-ce9b-41ca-85d6-06334392005f",
				"provisioningState": "Succeeded",
				"etag": "W/\"f69eddb7-8e59-4d12-ac72-48b65f83277a\""
			}
		},
		"vmSize": [
			{
				"name": "Standard_B1ms",
				"numberOfCores": 1,
				"osDiskSizeInMB": 1047552,
				"resourceDiskSizeInMB": 4096,
				"memoryInMB": 2048,
				"maxDataDiskCount": 2,
				"label": "Standard_B1ms / CPU: 1 / RAM: 2GB / HD: 4GB"
			},
			{
				"name": "Standard_B1s",
				"numberOfCores": 1,
				"osDiskSizeInMB": 1047552,
				"resourceDiskSizeInMB": 2048,
				"memoryInMB": 1024,
				"maxDataDiskCount": 2,
				"label": "Standard_B1s / CPU: 1 / RAM: 1024MB / HD: 2GB"

			}
		],
		"vmImagePublisher": [
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/1e",
				"name": "1e",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/4psa",
				"name": "4psa",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/5nine-software-inc",
				"name": "5nine-software-inc",
				"location": "eastus"
			}
		],
		"vmPublisherOffers": [
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu15.04Snappy",
				"name": "Ubuntu15.04Snappy",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu15.04SnappyDocker",
				"name": "Ubuntu15.04SnappyDocker",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer",
				"name": "UbuntuServer",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Core",
				"name": "Ubuntu_Core",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Snappy_Core",
				"name": "Ubuntu_Snappy_Core",
				"location": "eastus"
			},
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Snappy_Core_Docker",
				"name": "Ubuntu_Snappy_Core_Docker",
				"location": "eastus"
			}
		],
		"vmImageVersions": [
			{
				"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Core/Skus/16",
				"name": "16",
				"location": "eastus"
			}
		],
		"virtualNetworks": [
			{
				"subnets": [
					{}
				],
				"name": "tester-vn",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn",
				"location": "eastus",
				"addressSpace": {
					"addressPrefixes": [
						"10.0.0.0/16"
					]
				}
			}
		],
		"subnets": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet",
				"addressPrefix": "10.0.2.0/24",
				"name": "tester-subnet",

			}
		],
		"Disks": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/disks/mongo_OsDisk_1_5aa8030cb6044037b5c8f4d6c75a391a",
				"name": "mongo_OsDisk_1_5aa8030cb6044037b5c8f4d6c75a391a",
				"type": "Microsoft.Compute/disks",
				"location": "centralus",
				"managedBy": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/virtualMachines/mongo",
				"sku": {
					"name": "Standard_LRS",
					"tier": "Standard"
				},
				"timeCreated": "2018-06-08T08:43:58.918Z",
				"osType": "Linux",
				"creationData": {
					"createOption": "FromImage",
					"imageReference": {
						"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/centralus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/17.10/Versions/17.10.201805220"
					}
				},
				"diskSizeGB": 30,
				"provisioningState": "Succeeded"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/SOAJS/providers/Microsoft.Compute/disks/mysql_OsDisk_1_42ef3a000aff4269988d134e376e0160",
				"name": "mysql_OsDisk_1_42ef3a000aff4269988d134e376e0160",
				"type": "Microsoft.Compute/disks",
				"location": "centralus",
				"managedBy": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs/providers/Microsoft.Compute/virtualMachines/mysql",
				"sku": {
					"name": "Standard_LRS",
					"tier": "Standard"
				},
				"timeCreated": "2018-06-08T08:45:51.415Z",
				"osType": "Linux",
				"creationData": {
					"createOption": "FromImage",
					"imageReference": {
						"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/centralus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/17.10/Versions/17.10.201805220"
					}
				},
				"diskSizeGB": 30,
				"provisioningState": "Succeeded"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/TESTCASE/providers/Microsoft.Compute/disks/testcase-vm_OsDisk_1_cc20c9245fdd4bf9961aa239d435b9b7",
				"name": "testcase-vm_OsDisk_1_cc20c9245fdd4bf9961aa239d435b9b7",
				"type": "Microsoft.Compute/disks",
				"location": "centralus",
				"managedBy": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Compute/virtualMachines/testcase-vm",
				"sku": {
					"name": "Premium_LRS",
					"tier": "Premium"
				},
				"zones": [
					"1"
				],
				"timeCreated": "2018-07-10T15:05:27.891Z",
				"osType": "Linux",
				"creationData": {
					"createOption": "FromImage",
					"imageReference": {
						"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/centralus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/18.04-LTS/Versions/18.04.201806170"
					}
				},
				"diskSizeGB": 30,
				"provisioningState": "Succeeded"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/CHARLES/providers/Microsoft.Compute/disks/charles-test3-osDisk-0",
				"name": "charles-test3-osDisk-0",
				"type": "Microsoft.Compute/disks",
				"location": "eastus",
				"tags": {
					"key": "value",
					"soajs.env.code": "DEV",
					"soajs.layer.name": "test3",
					"soajs.network.name": "charles-vn",
					"soajs.vm.name": "charles-test3-vm-0"
				},
				"managedBy": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/charles/providers/Microsoft.Compute/virtualMachines/charles-test3-vm-0",
				"sku": {
					"name": "Standard_LRS",
					"tier": "Standard"
				},
				"timeCreated": "2018-07-10T12:33:57.485Z",
				"osType": "Linux",
				"creationData": {
					"createOption": "FromImage",
					"imageReference": {
						"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/16.04-LTS/Versions/16.04.201807030"
					}
				},
				"diskSizeGB": 30,
				"provisioningState": "Succeeded"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/TESTCASE/providers/Microsoft.Compute/disks/test-data-disk-for-ragheb",
				"name": "test-data-disk-for-ragheb",
				"type": "Microsoft.Compute/disks",
				"location": "eastus",
				"sku": {
					"name": "Standard_LRS",
					"tier": "Standard"
				},
				"timeCreated": "2018-07-10T15:00:28.562Z",
				"creationData": {
					"createOption": "Empty"
				},
				"diskSizeGB": 5,
				"provisioningState": "Succeeded"
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/TESTER/providers/Microsoft.Compute/disks/tester-vm_OsDisk_1_a26c7c89f50e4ccd8cb600324eae5100",
				"name": "tester-vm_OsDisk_1_a26c7c89f50e4ccd8cb600324eae5100",
				"type": "Microsoft.Compute/disks",
				"location": "eastus",
				"managedBy": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Compute/virtualMachines/tester-vm",
				"sku": {
					"name": "Standard_LRS",
					"tier": "Standard"
				},
				"timeCreated": "2018-07-10T10:00:02.647Z",
				"osType": "Linux",
				"creationData": {
					"createOption": "FromImage",
					"imageReference": {
						"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/17.10/Versions/17.10.201807060"
					}
				},
				"diskSizeGB": 30,
				"provisioningState": "Succeeded"
			}
		],
		"rawLoadBalancers": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1",
				"name": "tester-lb-1",
				"type": "Microsoft.Network/loadBalancers",
				"location": "centralus",
				"tags": {},
				"sku": {
					"name": "Basic"
				},
				"frontendIPConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/frontendIPConfigurations/public-ip-config",
						"inboundNatPools": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/inboundNatPools/nat-pool-1"
							}
						],
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/loadBalancingRules/port-1"
							}
						],
						"privateIPAllocationMethod": "Dynamic",
						"publicIPAddress": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ip"
						},
						"provisioningState": "Succeeded",
						"name": "public-ip-config",
						"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
					}
				],
				"backendAddressPools": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/backendAddressPools/tester-lb-address-pool",
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/loadBalancingRules/port-1"
							}
						],
						"provisioningState": "Succeeded",
						"name": "tester-lb-address-pool",
						"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
					}
				],
				"loadBalancingRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/loadBalancingRules/port-1",
						"frontendIPConfiguration": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/frontendIPConfigurations/public-ip-config"
						},
						"backendAddressPool": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/backendAddressPools/tester-lb-address-pool"
						},
						"probe": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/probes/port-1-probe"
						},
						"protocol": "Tcp",
						"loadDistribution": "Default",
						"frontendPort": 80,
						"backendPort": 80,
						"idleTimeoutInMinutes": 30,
						"enableFloatingIP": false,
						"provisioningState": "Succeeded",
						"name": "port-1",
						"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
					}
				],
				"probes": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/probes/port-1-probe",
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/loadBalancingRules/port-1"
							}
						],
						"protocol": "Http",
						"port": 80,
						"intervalInSeconds": 10,
						"numberOfProbes": 20,
						"requestPath": "/",
						"provisioningState": "Succeeded",
						"name": "port-1-probe",
						"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
					}
				],
				"inboundNatRules": [],
				"inboundNatPools": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/inboundNatPools/nat-pool-1",
						"frontendIPConfiguration": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/frontendIPConfigurations/public-ip-config"
						},
						"protocol": "Tcp",
						"frontendPortRangeStart": 30000,
						"frontendPortRangeEnd": 30010,
						"backendPort": 8080,
						"idleTimeoutInMinutes": 4,
						"enableFloatingIP": false,
						"provisioningState": "Succeeded",
						"name": "nat-pool-1",
						"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
					}
				],
				"resourceGuid": "6bf98d10-ab2a-45c0-903c-e0ab8b779e44",
				"provisioningState": "Succeeded",
				"etag": "W/\"6ff8a904-2a35-499c-955c-a0ba279542c6\""
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2",
				"name": "tester-lb-2",
				"type": "Microsoft.Network/loadBalancers",
				"location": "centralus",
				"tags": {},
				"sku": {
					"name": "Basic"
				},
				"frontendIPConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/frontendIPConfigurations/private-ip-config",
						"inboundNatRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/inboundNatRules/nat-rule-1"
							}
						],
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/loadBalancingRules/port-1"
							}
						],
						"privateIPAddress": "10.2.0.10",
						"privateIPAllocationMethod": "Static",
						"subnet": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet"
						},
						"provisioningState": "Succeeded",
						"name": "private-ip-config",
						"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
					}
				],
				"backendAddressPools": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/backendAddressPools/tester-lb-address-pool",
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/loadBalancingRules/port-1"
							}
						],
						"provisioningState": "Succeeded",
						"name": "tester-lb-address-pool",
						"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
					}
				],
				"loadBalancingRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/loadBalancingRules/port-1",
						"frontendIPConfiguration": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/frontendIPConfigurations/private-ip-config"
						},
						"backendAddressPool": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/backendAddressPools/tester-lb-address-pool"
						},
						"probe": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/probes/port-1-probe"
						},
						"protocol": "Tcp",
						"loadDistribution": "Default",
						"frontendPort": 80,
						"backendPort": 80,
						"idleTimeoutInMinutes": 30,
						"enableFloatingIP": false,
						"provisioningState": "Succeeded",
						"name": "port-1",
						"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
					}
				],
				"probes": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/probes/port-1-probe",
						"loadBalancingRules": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/loadBalancingRules/port-1"
							}
						],
						"protocol": "Http",
						"port": 80,
						"intervalInSeconds": 10,
						"numberOfProbes": 20,
						"requestPath": "/",
						"provisioningState": "Succeeded",
						"name": "port-1-probe",
						"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
					}
				],
				"inboundNatRules": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/inboundNatRules/nat-rule-1",
						"frontendIPConfiguration": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/frontendIPConfigurations/private-ip-config"
						},
						"protocol": "Tcp",
						"frontendPort": 30011,
						"backendPort": 8081,
						"idleTimeoutInMinutes": 4,
						"enableFloatingIP": false,
						"provisioningState": "Succeeded",
						"name": "nat-rule-1",
						"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
					}
				],
				"inboundNatPools": [],
				"resourceGuid": "2b68bb2c-14c0-4b66-bbe2-5652e9b8d6a8",
				"provisioningState": "Succeeded",
				"etag": "W/\"c83d9de7-7371-499c-a4c3-7449205ba1f9\""
			}
		],
		"loadBalancers": [
			{
				"addressPools": [
					{
						"name": "tester-lb-address-pool"
					}
				],
				"ipAddresses": [],
				"rules": [
					{
						"config": {
							"privateIPAllocationMethod": "dynamic",
							"isPublic": true,
							"publicIpAddress": {
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ip",
								"group": "testcase",
								"name": "test-ip"
							}
						},
						"ports": [
							{
								"name": "port-1",
								"protocol": "tcp",
								"target": 80,
								"published": 80,
								"loadDistribution": "default",
								"enableFloatingIP": false,
								"idleTimeout": 1800,
								"addressPoolName": "tester-lb-address-pool",
								"ipConfigName": "public-ip-config",
								"healthProbePort": 80,
								"healthProbeProtocol": "http",
								"healthProbeRequestPath": "/",
								"maxFailureAttempts": 20,
								"healthProbeInterval": 10
							}
						],
						"natRules": [],
						"natPools": [
							{
								"name": "nat-pool-1",
								"backendPort": 8080,
								"protocol": "tcp",
								"enableFloatingIP": false,
								"frontendPortRangeStart": 30000,
								"frontendPortRangeEnd": 30010,
								"ipConfigName": "public-ip-config",
								"idleTimeout": 240
							}
						],
						"name": "public-ip-config"
					}
				],
				"name": "tester-lb-1",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1",
				"region": "centralus"
			},
			{
				"addressPools": [
					{
						"name": "tester-lb-address-pool"
					}
				],
				"ipAddresses": [
					{
						"address": "10.2.0.10",
						"type": "private"
					}
				],
				"rules": [
					{
						"config": {
							"privateIPAllocationMethod": "static",
							"isPublic": false,
							"privateIpAddress": "10.2.0.10",
							"subnet": {
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet",
								"group": "testcase",
								"network": "test-network",
								"name": "test-subnet"
							}
						},
						"ports": [
							{
								"name": "port-1",
								"protocol": "tcp",
								"target": 80,
								"published": 80,
								"loadDistribution": "default",
								"enableFloatingIP": false,
								"idleTimeout": 1800,
								"addressPoolName": "tester-lb-address-pool",
								"ipConfigName": "private-ip-config",
								"healthProbePort": 80,
								"healthProbeProtocol": "http",
								"healthProbeRequestPath": "/",
								"maxFailureAttempts": 20,
								"healthProbeInterval": 10
							}
						],
						"natRules": [
							{
								"name": "nat-rule-1",
								"backendPort": 8081,
								"frontendPort": 30011,
								"protocol": "tcp",
								"enableFloatingIP": false,
								"ipConfigName": "private-ip-config",
								"idleTimeout": 240
							}
						],
						"natPools": [],
						"name": "private-ip-config"
					}
				],
				"name": "tester-lb-2",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2",
				"region": "centralus"
			}
		],
		"runCommand": {
			"name": "d3b5e3bb-230c-46c1-814e-d920c405a91f",
			"status": "Succeeded",
			"startTime": "2018-06-22T11:41:20.282Z",
			"endTime": "2018-06-22T11:41:33.954Z",
			"output": [
				{
					"code": "ProvisioningState/succeeded",
					"level": "Info",
					"displayStatus": "Provisioning succeeded",
					"message": "Enable succeeded: \n[stdout]\n 11:39:21 ubuntu python3[1055]: 2018/06/22 11:39:21.171799 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Target handler state: enabled\nJun 22 11:39:21 ubuntu python3[1055]: 2018/06/22 11:39:21.203900 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] [Enable] current handler state is: enabled\nJun 22 11:39:21 ubuntu python3[1055]: 2018/06/22 11:39:21.237334 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Update settings file: 45.settings\nJun 22 11:39:21 ubuntu python3[1055]: 2018/06/22 11:39:21.264261 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Enable extension [bin/run-command-shim enable]\nJun 22 11:39:22 ubuntu python3[1055]: 2018/06/22 11:39:22.298886 INFO Event: name=Microsoft.CPlat.Core.RunCommandLinux, op=Enable, message=Launch command succeeded: bin/run-command-shim enable, duration=1002\nJun 22 11:39:22 ubuntu python3[1055]: 2018/06/22 11:39:22.427124 INFO Event: name=WALinuxAgent, op=ProcessGoalState, message=Incarnation 47, duration=1405\nJun 22 11:39:57 ubuntu sshd[37471]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=61.177.172.60  user=root\nJun 22 11:39:59 ubuntu sshd[37471]: Failed password for root from 61.177.172.60 port 57482 ssh2\nJun 22 11:40:01 ubuntu sshd[37471]: Failed password for root from 61.177.172.60 port 57482 ssh2\nJun 22 11:40:04 ubuntu sshd[37471]: Failed password for root from 61.177.172.60 port 57482 ssh2\nJun 22 11:40:04 ubuntu sshd[37471]: Received disconnect from 61.177.172.60 port 57482:11:  [preauth]\nJun 22 11:40:04 ubuntu sshd[37471]: Disconnected from 61.177.172.60 port 57482 [preauth]\nJun 22 11:40:04 ubuntu sshd[37471]: PAM 2 more authentication failures; logname= uid=0 euid=0 tty=ssh ruser= rhost=61.177.172.60  user=root\nJun 22 11:40:24 ubuntu python3[1055]: 2018/06/22 11:40:24.042860 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Target handler state: enabled\nJun 22 11:40:24 ubuntu python3[1055]: 2018/06/22 11:40:24.087845 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] [Enable] current handler state is: enabled\nJun 22 11:40:24 ubuntu python3[1055]: 2018/06/22 11:40:24.120786 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Update settings file: 46.settings\nJun 22 11:40:24 ubuntu python3[1055]: 2018/06/22 11:40:24.165278 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Enable extension [bin/run-command-shim enable]\nJun 22 11:40:25 ubuntu python3[1055]: 2018/06/22 11:40:25.205382 INFO Event: name=Microsoft.CPlat.Core.RunCommandLinux, op=Enable, message=Launch command succeeded: bin/run-command-shim enable, duration=1003\nJun 22 11:40:25 ubuntu python3[1055]: 2018/06/22 11:40:25.351438 INFO Event: name=WALinuxAgent, op=ProcessGoalState, message=Incarnation 48, duration=1451\nJun 22 11:40:53 ubuntu sshd[37565]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=61.177.172.60  user=root\nJun 22 11:40:55 ubuntu sshd[37565]: Failed password for root from 61.177.172.60 port 23100 ssh2\nJun 22 11:40:57 ubuntu sshd[37565]: Failed password for root from 61.177.172.60 port 23100 ssh2\nJun 22 11:40:59 ubuntu sshd[37565]: Failed password for root from 61.177.172.60 port 23100 ssh2\nJun 22 11:41:00 ubuntu sshd[37565]: Received disconnect from 61.177.172.60 port 23100:11:  [preauth]\nJun 22 11:41:00 ubuntu sshd[37565]: Disconnected from 61.177.172.60 port 23100 [preauth]\nJun 22 11:41:00 ubuntu sshd[37565]: PAM 2 more authentication failures; logname= uid=0 euid=0 tty=ssh ruser= rhost=61.177.172.60  user=root\nJun 22 11:41:27 ubuntu python3[1055]: 2018/06/22 11:41:27.005735 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Target handler state: enabled\nJun 22 11:41:27 ubuntu python3[1055]: 2018/06/22 11:41:27.028525 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] [Enable] current handler state is: enabled\nJun 22 11:41:27 ubuntu python3[1055]: 2018/06/22 11:41:27.065983 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Update settings file: 47.settings\nJun 22 11:41:27 ubuntu python3[1055]: 2018/06/22 11:41:27.097058 INFO [Microsoft.CPlat.Core.RunCommandLinux-1.0.0] Enable extension [bin/run-command-shim enable]\n\n[stderr]\n"
				}
			]
		},
		"Groups": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/dashboard",
				"name": "dashboard",
				"region": "centralus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/demo",
				"name": "demo",
				"region": "eastus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/dynamic-template",
				"name": "dynamic-template",
				"region": "eastus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/memsql",
				"name": "memsql",
				"region": "centralus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/mongo",
				"name": "mongo",
				"region": "centralus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/ragheb",
				"name": "ragheb",
				"region": "centralus",
				"labels": {}
			},
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs",
				"name": "soajs",
				"region": "centralus"
			}
		],
		"loadBalancerList": [
			{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb",
				"name": "tester-tester-lb",
				"type": "Microsoft.Network/loadBalancers",
				"location": "centralus",
				"tags": {},
				"sku": {
					"name": "Basic"
				},
				"frontendIPConfigurations": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb/frontendIPConfigurations/tester-tester-lb-ip",
						"privateIPAllocationMethod": "Dynamic",
						"publicIPAddress": {
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-tester-ip"
						},
						"provisioningState": "Succeeded",
						"name": "tester-tester-lb-ip",
						"etag": "W/\"efe1b864-7984-46b8-a271-448e26eedaa4\""
					}
				],
				"backendAddressPools": [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb/backendAddressPools/tester-tester-lb-backend-address-pool",
						"backendIPConfigurations": [
							{
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-tester-ni-0/ipConfigurations/tester-tester-ni-ipConfig-0"
							}
						],
						"provisioningState": "Succeeded",
						"name": "tester-tester-lb-backend-address-pool",
						"etag": "W/\"efe1b864-7984-46b8-a271-448e26eedaa4\""
					}
				],
				"loadBalancingRules": [],
				"probes": [],
				"inboundNatRules": [],
				"inboundNatPools": [],
				"resourceGuid": "2e5294d6-8ec8-4a2d-86c4-102b25da394e",
				"provisioningState": "Succeeded",
				"etag": "W/\"efe1b864-7984-46b8-a271-448e26eedaa4\""
			}
		],
		"networkSecurutyGroup": [{
			"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg",
			"name": "tester-tester-sg",
			"type": "Microsoft.Network/networkSecurityGroups",
			"location": "centralus",
			"tags": {},
			"securityRules": [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/securityRules/http",
					"protocol": "tcp",
					"sourcePortRange": "*",
					"destinationPortRange": "22",
					"sourceAddressPrefix": "*",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "*",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Allow",
					"priority": 100,
					"direction": "Inbound",
					"provisioningState": "Succeeded",
					"name": "http",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				}
			],
			"defaultSecurityRules": [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/AllowVnetInBound",
					"description": "Allow inbound traffic from all VMs in VNET",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "VirtualNetwork",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "VirtualNetwork",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Allow",
					"priority": 65000,
					"direction": "Inbound",
					"provisioningState": "Succeeded",
					"name": "AllowVnetInBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/AllowAzureLoadBalancerInBound",
					"description": "Allow inbound traffic from azure load balancer",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "AzureLoadBalancer",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "*",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Allow",
					"priority": 65001,
					"direction": "Inbound",
					"provisioningState": "Succeeded",
					"name": "AllowAzureLoadBalancerInBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/DenyAllInBound",
					"description": "Deny all inbound traffic",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "*",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "*",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Deny",
					"priority": 65500,
					"direction": "Inbound",
					"provisioningState": "Succeeded",
					"name": "DenyAllInBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/AllowVnetOutBound",
					"description": "Allow outbound traffic from all VMs to all VMs in VNET",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "VirtualNetwork",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "VirtualNetwork",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Allow",
					"priority": 65000,
					"direction": "Outbound",
					"provisioningState": "Succeeded",
					"name": "AllowVnetOutBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/AllowInternetOutBound",
					"description": "Allow outbound traffic from all VMs to Internet",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "*",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "Internet",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Allow",
					"priority": 65001,
					"direction": "Outbound",
					"provisioningState": "Succeeded",
					"name": "AllowInternetOutBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg/defaultSecurityRules/DenyAllOutBound",
					"description": "Deny all outbound traffic",
					"protocol": "*",
					"sourcePortRange": "*",
					"destinationPortRange": "*",
					"sourceAddressPrefix": "*",
					"sourceAddressPrefixes": [],
					"destinationAddressPrefix": "*",
					"destinationAddressPrefixes": [],
					"sourcePortRanges": [],
					"destinationPortRanges": [],
					"access": "Deny",
					"priority": 65500,
					"direction": "Outbound",
					"provisioningState": "Succeeded",
					"name": "DenyAllOutBound",
					"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
				}
			],
			"networkInterfaces": [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-tester-ni-0"
				}
			],
			"resourceGuid": "633c826c-bff5-4c07-947d-b871abcde971",
			"provisioningState": "Succeeded",
			"etag": "W/\"2e570ec3-9d7a-459e-9c79-f1a6cf4886b7\""
		}]
	};
	return data;
};
