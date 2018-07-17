"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const nock = require('nock');

const service = helper.requireModule('./infra/azure/index.js');
const serviceUtils = helper.requireModule("./infra/azure/utils/index.js");

let dD = require('../../../../schemas/azure/cluster.js');
let info = {};
let options = {};

describe("testing /lib/azure/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("createSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		it("Success", function (done) {
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {
						tokenCache: {
							_entries: [{
								accessToken: "123"
							}]
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				name: "testSecurityGroup",
				group: "testcase",
				region: "centralus",
				labels: {
					"test": "case"
				},
				ports: [{
					priority: 100,
					protocol: "Tcp",
					access: "Allow",
					direction: "Inbound",
					name: "testPort",
					published: "30080"
				}]
			};
			let expectedResponce = {
				"id":  "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup"
			};

			let nocks = nock('https://management.azure.com')
				.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.name}?api-version=2018-02-01`,
					{
						"location": options.params.region,
						"properties": {
							"securityRules": [
								{
									"name": "testPort",
									"properties": {
										"priority": 100,
										"protocol": "Tcp",
										"access": "Allow",
										"direction": "Inbound",
										"sourceAddress": "*",
										"sourcePortRange": "*",
										"destinationAddress": "*",
										"destinationPortRange": "30080"
									}
								}
							]
						},
						"tags": options.params.labels
					})
				.reply(200, {
					"name": "testSecurityGroup",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup",
					"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
					"type": "Microsoft.Network/networkSecurityGroups",
					"location": "centralus",
					"tags": {
						"test": "case"
					},
					"properties": {
						"provisioningState": "Updating",
						"resourceGuid": "e245ddf6-5933-4bc8-95ea-4c7a1d9046ed",
						"securityRules": [
							{
								"name": "testPort",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/securityRules/testPort",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"protocol": "Tcp",
									"sourcePortRange": "*",
									"destinationPortRange": "31319",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Allow",
									"priority": 100,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							}
						],
						"defaultSecurityRules": [
							{
								"name": "AllowVnetInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowVnetInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow inbound traffic from all VMs in VNET",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "VirtualNetwork",
									"destinationAddressPrefix": "VirtualNetwork",
									"access": "Allow",
									"priority": 65000,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowAzureLoadBalancerInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowAzureLoadBalancerInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow inbound traffic from azure load balancer",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "AzureLoadBalancer",
									"destinationAddressPrefix": "*",
									"access": "Allow",
									"priority": 65001,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "DenyAllInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/DenyAllInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Deny all inbound traffic",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Deny",
									"priority": 65500,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowVnetOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowVnetOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow outbound traffic from all VMs to all VMs in VNET",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "VirtualNetwork",
									"destinationAddressPrefix": "VirtualNetwork",
									"access": "Allow",
									"priority": 65000,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowInternetOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowInternetOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow outbound traffic from all VMs to Internet",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "Internet",
									"access": "Allow",
									"priority": 65001,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "DenyAllOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/DenyAllOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Deny all outbound traffic",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Deny",
									"priority": 65500,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							}
						]
					}
				});
			service.createSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedResponce, response);
				done();
			});
		});
	});

	describe("updateSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		it("Success", function (done) {
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {
						tokenCache: {
							_entries: [{
								accessToken: "123"
							}]
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				name: "testSecurityGroup",
				group: "testcase",
				region: "centralus",
				labels: {
					"test": "case"
				},
				ports: [{
					priority: 100,
					protocol: "Tcp",
					access: "Allow",
					direction: "Inbound",
					name: "testPort"
				}]
			};
			let expectedResponce = {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup"
			};

			let nocks = nock('https://management.azure.com')
				.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.name}?api-version=2018-02-01`,
					{
						"location": options.params.region,
						"properties": {
							"securityRules": [
								{
									"name": "testPort",
									"properties": {
										"priority": 100,
										"protocol": "Tcp",
										"access": "Allow",
										"direction": "Inbound",
										"sourceAddress": "*",
										"sourcePortRange": "*",
										"destinationAddress": "*",
										"destinationPortRange": 1
									}
								}
							]
						},
						"tags": options.params.labels
					})
				.reply(200, {
					"name": "testSecurityGroup",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup",
					"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
					"type": "Microsoft.Network/networkSecurityGroups",
					"location": "centralus",
					"tags": {
						"test": "case"
					},
					"properties": {
						"provisioningState": "Updating",
						"resourceGuid": "e245ddf6-5933-4bc8-95ea-4c7a1d9046ed",
						"securityRules": [
							{
								"name": "testPort",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/securityRules/testPort",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"protocol": "Tcp",
									"sourcePortRange": "*",
									"destinationPortRange": "31319",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Allow",
									"priority": 100,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							}
						],
						"defaultSecurityRules": [
							{
								"name": "AllowVnetInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowVnetInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow inbound traffic from all VMs in VNET",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "VirtualNetwork",
									"destinationAddressPrefix": "VirtualNetwork",
									"access": "Allow",
									"priority": 65000,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowAzureLoadBalancerInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowAzureLoadBalancerInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow inbound traffic from azure load balancer",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "AzureLoadBalancer",
									"destinationAddressPrefix": "*",
									"access": "Allow",
									"priority": 65001,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "DenyAllInBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/DenyAllInBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Deny all inbound traffic",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Deny",
									"priority": 65500,
									"direction": "Inbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowVnetOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowVnetOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow outbound traffic from all VMs to all VMs in VNET",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "VirtualNetwork",
									"destinationAddressPrefix": "VirtualNetwork",
									"access": "Allow",
									"priority": 65000,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "AllowInternetOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/AllowInternetOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Allow outbound traffic from all VMs to Internet",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "Internet",
									"access": "Allow",
									"priority": 65001,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							},
							{
								"name": "DenyAllOutBound",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/networkSecurityGroups/testSecurityGroup/defaultSecurityRules/DenyAllOutBound",
								"etag": "W/\"877edcb7-11dd-43bf-b96f-3e323ce73640\"",
								"properties": {
									"provisioningState": "Updating",
									"description": "Deny all outbound traffic",
									"protocol": "*",
									"sourcePortRange": "*",
									"destinationPortRange": "*",
									"sourceAddressPrefix": "*",
									"destinationAddressPrefix": "*",
									"access": "Deny",
									"priority": 65500,
									"direction": "Outbound",
									"sourcePortRanges": [],
									"destinationPortRanges": [],
									"sourceAddressPrefixes": [],
									"destinationAddressPrefixes": []
								}
							}
						]
					}
				});
			service.updateSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedResponce, response);
				done();
			});
		});
	});

	describe("listSecurityGroups", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					networkSecurityGroups: {
						list: (resourceGroupName, cb) => {
							return cb(null, info.networkSecurutyGroup)
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
				virtualNetworkName: "tester-vn",
			};
			let expectedResponce = [
					{
						"name": "tester-tester-sg",
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-tester-sg",
						"region": "centralus",
						"ports": [
							{
								"name": "http",
								"protocol": "tcp",
								"access": "allow",
								"priority": 100,
								"direction": "inbound",
								"target": "*",
								"published": "22",
								"sourceAddress": "*",
								"destinationAddress": "*",
								"isPublished": true
							},
							{
								"name": "AllowVnetInBound",
								"protocol": "*",
								"access": "allow",
								"priority": 65000,
								"direction": "inbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "VirtualNetwork",
								"destinationAddress": "VirtualNetwork",
								"isPublished": true
							},
							{
								"name": "AllowAzureLoadBalancerInBound",
								"protocol": "*",
								"access": "allow",
								"priority": 65001,
								"direction": "inbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "AzureLoadBalancer",
								"destinationAddress": "*",
								"isPublished": true
							},
							{
								"name": "DenyAllInBound",
								"protocol": "*",
								"access": "deny",
								"priority": 65500,
								"direction": "inbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "*",
								"destinationAddress": "*",
								"isPublished": true
							},
							{
								"name": "AllowVnetOutBound",
								"protocol": "*",
								"access": "allow",
								"priority": 65000,
								"direction": "outbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "VirtualNetwork",
								"destinationAddress": "VirtualNetwork",
								"isPublished": true
							},
							{
								"name": "AllowInternetOutBound",
								"protocol": "*",
								"access": "allow",
								"priority": 65001,
								"direction": "outbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "*",
								"destinationAddress": "Internet",
								"isPublished": true
							},
							{
								"name": "DenyAllOutBound",
								"protocol": "*",
								"access": "deny",
								"priority": 65500,
								"direction": "outbound",
								"target": "*",
								"published": "*",
								"sourceAddress": "*",
								"destinationAddress": "*",
								"isPublished": true
							}
						],
						"labels": {}
					}
				];

			service.listSecurityGroups(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedResponce, response);

				done();
			});
		});
	});
	
	describe("deleteSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					networkSecurityGroups: {
						deleteMethod: (group, securityGroupName, cb) => {
							return cb(null, true)
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroupName: "tester-sg",
			};

			service.deleteSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
