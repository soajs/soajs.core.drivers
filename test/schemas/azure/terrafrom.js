'use strict';
module.exports = function () {
	let data = {
		inputs: {
			"infraCodeTemplate": "VMLoadBalancer",
			"layerName": "raghebvmlayer",
			"vmSize": "Standard_A0",
			"createNewVirtualNetwork": true,
			"createNewSecurityGroup": true,
			"privateIpAllocationMethod": "dynamic",
			"attachPublicIpAddress": true,
			"createNewPublicIpAddress": true,
			"publicIpAllocationMethod": "dynamic",
			"deleteOsDiskOnTermination": true,
			"deleteDataDisksOnTermination": true,
			"osDiskCachingMode": "ReadWrite",
			"osDiskType": "standard_LRS",
			"useSshKeyAuth": false,
			"imageSku": "16.04-LTS",
			"tags": {
				"mike": "hajj"
			},
			"numberOfVms": 1,
			"subnetAddressPrefix": "10.0.0.2/24",
			"newVirtualNetworkName": "raghebnet",
			"virtualNetworkAddressSpaces": "10.0.0.0/16",
			"publicIpIdleTimeout": 30,
			"adminUsername": "mike",
			"adminPassword": "Password1234!",
			"imagePublisher": "Canonical",
			"imageOffer": "UbuntuServer",
			"imageVersion": "latest",
			"region": "centralus",
			"group": "ragheb",
			"ports": [{
				"portName": "http",
				"protocol": "tcp",
				"target": 22,
				"published": 22,
				"isPublished": false,
				"healthCheckRequestPath": "/",
				"healthCheckRequestProtocol": "http"
			}],
			"newVolumes": [],
			"existingVolumes": []
		},
		template: {
			"_id": '5b3277a8989d7cf185ad52f0',
			"type": "_infra",
			"infra": "5b28c5edb53002d7b3b1f0cf",
			"location": "local",
			"deletable": true,
			"textMode": true,
			"driver": "Native",
			"technology": "vm",
			"name": "terraform template ips",
			"description": null,
			"content": "provider \"azurerm\" {\n  client_id       = \"{{clientId}}\"\n  client_secret   = \"{{{secret}}}\"\n  tenant_id       = \"{{domain}}\"\n  subscription_id = \"{{subscriptionId}}\"\n}\n\nresource \"azurerm_resource_group\" \"{{layerName}}\" {\n  name     = \"{{group}}\"\n  location = \"{{region}}\"\n}\n\n{{#if existingVolumes}}\n{{#each existingVolumes}}\n{{#each existingDisksNames}}\ndata \"azurerm_managed_disk\" \"{{../volumeName_e}}-{{@index}}\" {\n    name = \"{{v}}\"\n    resource_group_name = \"${azurerm_resource_group.{{../../layerName}}.name}\"\n}\n{{/each}}\n{{/each}}\n{{/if}}\n\n{{#if createNewVirtualNetwork}}\nresource \"azurerm_virtual_network\" \"{{layerName}}\" {\n  name                = \"{{group}}-vn\"\n  address_space       = [\"${split(\",\", \"{{virtualNetworkAddressSpaces}}\")}\"]\n  location            = \"${azurerm_resource_group.{{layerName}}.location}\"\n  resource_group_name  = \"${azurerm_resource_group.{{layerName}}.name}\"\n}\n{{/if}}\n\nresource \"azurerm_subnet\" \"{{layerName}}\" {\n  name                 = \"{{layerName}}\"\n  resource_group_name  = \"${azurerm_resource_group.{{layerName}}.name}\"\n  address_prefix       = \"{{subnetAddressPrefix}}\"\n  virtual_network_name = {{#if createNewVirtualNetwork}} \"${azurerm_virtual_network.{{layerName}}.name}\" {{else}} \"{{virtualNetworkName}}\" {{/if}}\n}\n\n{{#if createNewSecurityGroup}}\nresource \"azurerm_network_security_group\" \"{{layerName}}\" {\n  name                = \"{{group}}-{{layerName}}-sg\"\n  location            = \"${azurerm_resource_group.{{layerName}}.location}\"\n  resource_group_name = \"${azurerm_resource_group.{{layerName}}.name}\"\n\n  {{#each ports}}\n  security_rule {\n    name                       = \"{{portName}}\"\n    priority                   = {{inc 100 @index}}\n    direction                  = \"Inbound\"\n    access                     = \"Allow\"\n    protocol                   = \"{{protocol}}\"\n    source_port_range          = \"*\"\n    destination_port_range     = \"{{published}}\"\n    source_address_prefix      = \"*\"\n    destination_address_prefix = \"*\"\n  }\n  {{/each}}\n}\n{{/if}}\n\n{{#if attachPublicIpAddress}}\n{{#if createNewPublicIpAddress}}\nresource \"azurerm_public_ip\" \"{{layerName}}\" {\n    count                        = {{numberOfVms}}\n    name                         = \"{{group}}-{{layerName}}-ip-${count.index}\"\n    location                     = \"${azurerm_resource_group.{{layerName}}.location}\"\n    resource_group_name          = \"${azurerm_resource_group.{{layerName}}.name}\"\n    public_ip_address_allocation = \"{{publicIpAllocationMethod}}\"\n    idle_timeout_in_minutes      = {{publicIpIdleTimeout}}\n}\n{{else}}\nlocals {\n    existing_public_ips = [\n        {{#each existingPublicIpsIds}}\n        \"{{v}}\",\n        {{/each}}\n    ]\n}\n{{/if}}\n{{/if}}\n\nresource \"azurerm_network_interface\" \"{{layerName}}\" {\n    count                     = {{numberOfVms}}\n    name                      = \"{{group}}-{{layerName}}-ni-${count.index}\"\n    location                  = \"${azurerm_resource_group.{{layerName}}.location}\"\n    resource_group_name       = \"${azurerm_resource_group.{{layerName}}.name}\"\n    network_security_group_id = {{#if createNewSecurityGroup}} \"${azurerm_network_security_group.{{layerName}}.id}\" {{else}} \"{{securityGroupId}}\" {{/if}}\n\n    ip_configuration {\n        name                          = \"{{group}}-{{layerName}}-ni-ipConfig-${count.index}\"\n        subnet_id                     = \"${azurerm_subnet.{{layerName}}.id}\"\n        private_ip_address_allocation = \"{{privateIpAllocationMethod}}\"\n        {{#if attachPublicIpAddress}}\n        public_ip_address_id          = {{#if createNewPublicIpAddress}}\"${element(azurerm_public_ip.{{layerName}}.*.id, count.index)}\" {{else}} \"${element(local.existing_public_ips, count.index)}\" {{/if}}\n        {{/if}}\n    }\n}\n\n{{#times numberOfVms}}\nresource \"azurerm_virtual_machine\" \"{{../layerName}}-{{this}}\" {\n    name                  = \"{{../group}}-{{../layerName}}-vm-{{this}}\"\n    location              = \"${azurerm_resource_group.{{../layerName}}.location}\"\n    resource_group_name   = \"${azurerm_resource_group.{{../layerName}}.name}\"\n    network_interface_ids = [\"${element(azurerm_network_interface.{{../layerName}}.*.id, {{this}})}\"]\n    vm_size               = \"{{../vmSize}}\"\n\n    delete_os_disk_on_termination = {{../deleteOsDiskOnTermination}}\n    delete_data_disks_on_termination = {{../deleteDataDisksOnTermination}}\n\n    storage_image_reference {\n        publisher = \"{{../imagePublisher}}\"\n        offer     = \"{{../imageOffer}}\"\n        sku       = \"{{../imageSku}}\"\n        version   = \"{{../imageVersion}}\"\n    }\n\n    storage_os_disk {\n        name              = \"{{../group}}-{{../layerName}}-osDisk-{{this}}\"\n        caching           = \"{{../osDiskCachingMode}}\"\n        create_option     = \"FromImage\"\n        managed_disk_type = \"{{../osDiskType}}\"\n    }\n\n    {{#each ../newVolumes}}\n    storage_data_disk {\n        name              = \"{{../../group}}-{{../../layerName}}-{{volumeName_n}}-{{../this}}\"\n        create_option     = \"Empty\"\n        lun               = {{inc 0 @index}}\n        managed_disk_type = \"{{type}}\"\n        disk_size_gb      = {{diskSizeGb}}\n    }\n    {{/each}}\n\n    {{#each ../existingVolumes}}\n    storage_data_disk {\n        name              = \"${data.azurerm_managed_disk.{{volumeName_e}}-{{../this}}.name}\"\n        create_option     = \"Attach\"\n        lun               = {{inc 0 @index}}\n        disk_size_gb      = \"${data.azurerm_managed_disk.{{volumeName_e}}-{{../this}}.disk_size_gb}\"\n        managed_disk_id   = \"${data.azurerm_managed_disk.{{volumeName_e}}-{{../this}}.id}\"\n    }\n    {{/each}}\n\n    os_profile {\n        computer_name  = \"{{../layerName}}\"\n        admin_username = \"{{../adminUsername}}\"\n        {{#unless ../useSshKeyAuth}}\n        admin_password = \"{{../adminPassword}}\"\n        {{/unless}}\n    }\n\n    os_profile_linux_config {\n        disable_password_authentication = {{../useSshKeyAuth}}\n\n        {{#if useSshKeyAuth}}\n        ssh_keys {\n            path     = \"/home/{{../adminUsername}}/.ssh/authorized_keys\"\n            key_data = \"{{../adminSshKey}}\"\n        }\n        {{/if}}\n    }\n\n\n    tags {\n        soajs.env.code = \"{{../envCode}}\"\n        soajs.layer.name = \"{{../layerName}}\"\n        soajs.network.name = {{#if ../createNewVirtualNetwork}} \"{{../group}}-vn\" {{else}} \"{{../virtualNetworkName}}\" {{/if}}\n        soajs.vm.name = \"{{../group}}-{{../layerName}}-vm-{{this}}\"\n        {{#each tags}}\n        {{@key}} = \"{{this}}\"\n        {{/each}}\n    }\n}\n\n{{/times}}",
			"inputs": [
				{
					"label": "General Settings",
					"name": "generalSettingsGroup",
					"type": "group",
					"entries": [
						{
							"name": "numberOfVms",
							"label": "Number of Instances",
							"type": "number",
							"value": "",
							"placeholder": "1",
							"required": false
						},
						{
							"name": "vmSize",
							"label": "Instance Flavour",
							"type": "select",
							"value": {
								"key": "vmSizes",
								"fields": {
									"v": "name",
									"l": "label"
								}
							},
							"required": false
						}
					]
				},
				{
					"label": "Virtual Network",
					"name": "virtualNetworkGroup",
					"type": "group",
					"entries": [
						{
							"name": "createNewVirtualNetwork",
							"label": "Create New Virtual Network",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "subnetAddressPrefix",
							"label": "Subnet Address Prefix",
							"type": "text",
							"value": "",
							"placeholder": "10.0.1.0/24",
							"required": false
						},
						{
							"name": "newVirtualNetworkName",
							"label": "Virtual Network Name",
							"type": "text",
							"value": "",
							"disableRule": {
								"operator": "AND",
								"fields": [
									"!createNewVirtualNetwork"
								]
							},
							"required": false
						},
						{
							"name": "virtualNetworkAddressSpaces",
							"label": "Virtual Network Address Spaces",
							"type": "text",
							"value": "",
							"placeholder": "10.0.0.0/16,10.1.0.0/16",
							"disableRule": {
								"operator": "AND",
								"fields": [
									"!createNewVirtualNetwork"
								]
							},
							"required": false
						},
						{
							"name": "virtualNetworkName",
							"label": "Virtual Network Name",
							"type": "select",
							"value": {
								"key": "networks",
								"fields": {
									"v": "name",
									"l": "name"
								}
							},
							"disableRule": {
								"operator": "AND",
								"fields": [
									"createNewVirtualNetwork"
								]
							},
							"disabled": true,
							"required": false
						}
					]
				},
				{
					"label": "Security Groups",
					"name": "securityGroupsGroup",
					"type": "group",
					"entries": [
						{
							"name": "createNewSecurityGroup",
							"label": "Create New Security Group",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "securityGroupId",
							"label": "Security Group ID",
							"type": "select",
							"value": {
								"key": "securityGroups",
								"fields": {
									"v": "id",
									"l": "name"
								}
							},
							"disableRule": {
								"operator": "AND",
								"fields": [
									"createNewSecurityGroup"
								]
							},
							"disabled": true,
							"required": false
						},
						{
							"name": "ports",
							"label": "Ports",
							"type": "group",
							"multi": true,
							"limit": 0,
							"entries": [
								{
									"label": "New Port",
									"name": "port",
									"type": "group",
									"entries": [
										{
											"name": "portName",
											"label": "Port Name",
											"type": "select",
											"value": [
												{
													"v": "https",
													"l": "https"
												},
												{
													"v": "ssh",
													"l": "ssh"
												},
												{
													"v": "http",
													"l": "http",
													"selected": true
												}
											],
											"disableRule": {
												"operator": "AND",
												"fields": [
													"!createNewSecurityGroup"
												]
											},
											"required": false
										},
										{
											"name": "protocol",
											"label": "Protocol Name",
											"type": "select",
											"value": [
												{
													"v": "tcp",
													"l": "tcp",
													"selected": true
												},
												{
													"v": "udp",
													"l": "udp"
												},
												{
													"v": "*",
													"l": "tcp/udp"
												}
											],
											"disableRule": {
												"operator": "AND",
												"fields": [
													"!createNewSecurityGroup"
												]
											},
											"required": false
										},
										{
											"name": "target",
											"label": "Target",
											"type": "number",
											"value": "22",
											"disableRule": {
												"operator": "AND",
												"fields": [
													"!createNewSecurityGroup"
												]
											},
											"required": false
										},
										{
											"name": "published",
											"label": "Published",
											"type": "number",
											"value": "22",
											"disableRule": {
												"operator": "AND",
												"fields": [
													"!createNewSecurityGroup"
												]
											},
											"required": false
										},
										{
											"name": "isPublished",
											"label": "Publish",
											"type": "buttonSlider",
											"value": "false",
											"disableRule": {
												"operator": "AND",
												"fields": [
													"!createNewSecurityGroup"
												]
											},
											"required": false
										}
									]
								}
							]
						}
					]
				},
				{
					"label": "IP Addresses",
					"name": "publicIpAddressGroup",
					"type": "group",
					"entries": [
						{
							"name": "privateIpAllocationMethod",
							"label": "Private IP Allocation Method",
							"type": "select",
							"value": [
								{
									"v": "dynamic",
									"l": "Dynamic",
									"selected": true
								},
								{
									"v": "static",
									"l": "Static"
								}
							],
							"required": false
						},
						{
							"name": "attachPublicIpAddress",
							"label": "Attach Public IP Address",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "createNewPublicIpAddress",
							"label": "Create New Public IP Address",
							"type": "buttonSlider",
							"value": true,
							"required": false,
							"disableRule": {
								"fields": [
									"!attachPublicIpAddress"
								]
							}
						},
						{
							"name": "existingPublicIpsIds",
							"label": "Existing Ip Addresses",
							"type": "uiselect",
							"multiple": true,
							"value": [],
							"computedValue": {
								"key": "publicIps",
								"fields": {
									"v": "id",
									"l": "name"
								}
							},
							"required": false,
							"disableRule": {
								"operator": "OR",
								"fields": [
									"!attachPublicIpAddress",
									"createNewPublicIpAddress"
								]
							}
						},
						{
							"name": "publicIpAllocationMethod",
							"label": "Public IP Allocation Method",
							"type": "select",
							"value": [
								{
									"v": "dynamic",
									"l": "Dynamic",
									"selected": true
								},
								{
									"v": "static",
									"l": "Static"
								}
							],
							"required": false,
							"disableRule": {
								"operator": "OR",
								"fields": [
									"!createNewPublicIpAddress",
									"!attachPublicIpAddress"
								]
							}
						},
						{
							"name": "publicIpIdleTimeout",
							"label": "Public IP Idle Timeout",
							"type": "number",
							"value": "",
							"placeholder": "30",
							"required": false,
							"disableRule": {
								"operator": "OR",
								"fields": [
									"!createNewPublicIpAddress",
									"!attachPublicIpAddress"
								]
							}
						}
					]
				},
				{
					"label": "Disks",
					"name": "DisksGroup",
					"type": "group",
					"entries": [
						{
							"name": "deleteOsDiskOnTermination",
							"label": "Delete OS Disk On Termination",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "deleteDataDisksOnTermination",
							"label": "Delete Data Disks On Termination",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "osDiskCachingMode",
							"label": "OS Disk Caching Mode",
							"type": "select",
							"value": [
								{
									"v": "none ",
									"l": "None"
								},
								{
									"v": "ReadOnly",
									"l": "Read Only"
								},
								{
									"v": "ReadWrite",
									"l": "Read Write",
									"selected": true
								}
							],
							"required": false
						},
						{
							"name": "osDiskType",
							"label": "OS Disk Type",
							"type": "select",
							"value": [
								{
									"v": "standard_LRS",
									"l": "Standard_LRS",
									"selected": true
								},
								{
									"v": "premium_LRS",
									"l": "Premium_LRS"
								}
							],
							"required": false
						}
					]
				},
				{
					"name": "newVolumes",
					"label": "New Volumes",
					"type": "group",
					"multi": true,
					"limit": 0,
					"entries": [
						{
							"label": "New Volume",
							"name": "newVolume",
							"type": "group",
							"entries": [
								{
									"name": "volumeName_n",
									"label": "Volume Name",
									"type": "text",
									"value": "",
									"placeholder": "volume_1",
									"required": false
								},
								{
									"name": "createNewDisk_n",
									"label": "Create new Disk",
									"type": "buttonSlider",
									"value": "true",
									"required": false,
									"disabled": true
								},
								{
									"name": "diskSizeGb",
									"label": "Disk Size (Gb)",
									"type": "number",
									"value": "",
									"placeholder": "10",
									"required": false
								},
								{
									"name": "type",
									"label": "Type",
									"type": "select",
									"value": [
										{
											"v": "Standard_LRS",
											"l": "Standard_LRS",
											"selected": true
										},
										{
											"v": "Premium_LRS",
											"l": "Premium_LRS"
										}
									],
									"required": false
								}
							]
						}
					]
				},
				{
					"name": "existingVolumes",
					"label": "Existing Volumes",
					"type": "group",
					"multi": true,
					"limit": 0,
					"entries": [
						{
							"label": "Existing Volume",
							"name": "existingVolume",
							"type": "group",
							"entries": [
								{
									"name": "volumeName_e",
									"label": "Volume Name",
									"type": "text",
									"value": "",
									"placeholder": "volume name",
									"required": false
								},
								{
									"name": "createNewDisk_e",
									"label": "Create new Disk",
									"type": "buttonSlider",
									"value": "false",
									"required": false,
									"disabled": true
								},
								{
									"name": "existingDisksNames",
									"label": "Existing Disks",
									"type": "uiselect",
									"multiple": true,
									"value": [],
									"computedValue": {
										"key": "dataDisks",
										"fields": {
											"v": "name",
											"l": "name"
										}
									},
									"required": false
								}
							]
						}
					]
				},
				{
					"label": "Admin Access",
					"name": "adminAccessGroup",
					"type": "group",
					"entries": [
						{
							"name": "adminUsername",
							"label": "Admin Username",
							"type": "text",
							"value": "",
							"placeholder": "ubuntu",
							"required": false
						},
						{
							"name": "useSshKeyAuth",
							"label": "Use SSH Key Authentication",
							"type": "buttonSlider",
							"value": true,
							"required": false
						},
						{
							"name": "adminPassword",
							"label": "Admin Password",
							"type": "password",
							"value": "",
							"placeholder": "Password1234!",
							"required": false,
							"disableRule": {
								"operator": "AND",
								"fields": [
									"useSshKeyAuth"
								]
							}
						},
						{
							"name": "adminSshKey",
							"label": "Admin SSH Key",
							"type": "textarea",
							"value": "",
							"required": false,
							"disableRule": {
								"operator": "AND",
								"fields": [
									"!useSshKeyAuth"
								]
							}
						}
					]
				},
				{
					"label": "Image Information",
					"name": "imageInformationGroup",
					"type": "group",
					"entries": [
						{
							"name": "imagePublisher",
							"label": "Image Publisher",
							"type": "text",
							"value": "",
							"placeholder": "Canonical",
							"required": false
						},
						{
							"name": "imageOffer",
							"label": "Image Offer",
							"type": "text",
							"value": "",
							"placeholder": "UbuntuServer",
							"required": false
						},
						{
							"name": "imageSku",
							"label": "Image Sku",
							"type": "select",
							"value": [
								{
									"v": "16.04-LTS",
									"l": "16.04-LTS"
								}
							],
							"required": false
						},
						{
							"name": "imageVersion",
							"label": "Image Version",
							"type": "text",
							"value": "",
							"placeholder": "latest",
							"required": false
						}
					]
				},
				{
					"label": "Tags",
					"name": "tagsGroup",
					"type": "group",
					"entries": [
						{
							"name": "tags",
							"label": "Additional Tags",
							"height": "100px",
							"type": "jsoneditor",
							"value": {
								"key": "value"
							}
						}
					]
				}
			],
			"display": {}
		}
	};
	return data;
};
