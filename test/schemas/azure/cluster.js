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
						"soajs.env.code": "tester"
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
					"idleTimeoutInMinutes": 4,
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
					"idleTimeoutInMinutes": 30,
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
					"idleTimeoutInMinutes": 4,
					"resourceGuid": "27748f69-bf3f-464f-8a32-a471921b284b",
					"provisioningState": "Succeeded",
					"etag": "W/\"4432dc5f-04b1-4dcd-9719-7d76d9e8152f\""
				},
			},
			"vmSize": [
				{
					"name": "Standard_B1ms",
					"numberOfCores": 1,
					"osDiskSizeInMB": 1047552,
					"resourceDiskSizeInMB": 4096,
					"memoryInMB": 2048,
					"maxDataDiskCount": 2
				},
				{
					"name": "Standard_B1s",
					"numberOfCores": 1,
					"osDiskSizeInMB": 1047552,
					"resourceDiskSizeInMB": 2048,
					"memoryInMB": 1024,
					"maxDataDiskCount": 2
				}],
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
				}],
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
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn",
					"name": "tester-vn",
					"type": "Microsoft.Network/virtualNetworks",
					"location": "eastus",
					"tags": {},
					"addressSpace": {
						"addressPrefixes": [
							"10.0.0.0/16"
						]
					},
					"dhcpOptions": {
						"dnsServers": []
					},
					"subnets": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet",
							"addressPrefix": "10.0.2.0/24",
							"serviceEndpoints": [],
							"ipConfigurations": [
								{
									"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
								}
							],
							"provisioningState": "Succeeded",
							"name": "tester-subnet",
							"etag": "W/\"bcb37303-50ad-402c-bdbb-2e67be65e436\""
						}
					],
					"virtualNetworkPeerings": [],
					"resourceGuid": "f0ec2a41-431a-4645-97ee-454c115ce41a",
					"provisioningState": "Succeeded",
					"enableDdosProtection": false,
					"enableVmProtection": false,
					"etag": "W/\"bcb37303-50ad-402c-bdbb-2e67be65e436\""
				}
			],
			"loadBalancers": [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb",
					"name": "tester-lb",
					"type": "Microsoft.Network/loadBalancers",
					"location": "centralus",
					"sku": {
						"name": "Basic"
					},
					"frontendIPConfigurations": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb/frontendIPConfigurations/LoadBalancerFrontEnd",
							"privateIPAllocationMethod": "Dynamic",
							"publicIPAddress": {
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-lb-ip"
							},
							"provisioningState": "Succeeded",
							"name": "LoadBalancerFrontEnd",
							"etag": "W/\"5a6127ca-2a9f-4fcd-a2e6-0189230fb560\""
						}
					],
					"backendAddressPools": [],
					"loadBalancingRules": [],
					"probes": [],
					"inboundNatRules": [],
					"inboundNatPools": [],
					"resourceGuid": "bd29e9dc-9a22-417c-976b-f96f041950c9",
					"provisioningState": "Succeeded",
					"etag": "W/\"5a6127ca-2a9f-4fcd-a2e6-0189230fb560\""
				}
			],
			"subnets": [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet",
					"addressPrefix": "10.0.2.0/24",
					"serviceEndpoints": [],
					"ipConfigurations": [
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
						}
					],
					"provisioningState": "Succeeded",
					"name": "tester-subnet",
					"etag": "W/\"6c581c8c-d2c0-4e6f-b32b-b9db99ca2369\""
				}
			],
			"Disks":[
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
			}]
		,
			"runCommand":{}
	}
		return data;
	};
