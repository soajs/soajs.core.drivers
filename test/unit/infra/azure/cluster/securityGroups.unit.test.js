"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const nock = require('nock');

const service = helper.requireModule('./infra/azure/index.js');
const serviceUtils = helper.requireModule("./infra/azure/utils/index.js");
const vms = helper.requireModule("./infra/azure/vm/index.js");

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
					published: 30080
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
										"sourceAddressPrefix": "*",
										"sourcePortRange": "*",
										"destinationAddressPrefix": "*",
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
										"sourceAddressPrefix": "*",
										"sourcePortRange": "*",
										"destinationAddressPrefix": "*",
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
							"target": "22",
							"published": "*",
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
							"isPublished": false,
							"readonly": true
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
							"isPublished": false,
							"readonly": true
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
							"isPublished": true,
							"readonly": true
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
							"isPublished": false,
							"readonly": true
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
							"isPublished": true,
							"readonly": true
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
							"isPublished": true,
							"readonly": true
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

	describe("getSecurityGroup", function() {
		afterEach((done) => {
			sinon.restore();
			done();
		});

		it("Success", function(done) {
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
						get: (group, securityGroupName, cb) => {
							return cb(null, info.networkSecurutyGroup[0]);
						}
					},
				});

			let expectedResponse = {
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
						"target": "22",
						"published": "*",
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
						"isPublished": false,
						"readonly": true
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
						"isPublished": false,
						"readonly": true
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
						"isPublished": true,
						"readonly": true
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
						"isPublished": false,
						"readonly": true
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
						"isPublished": true,
						"readonly": true
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
						"isPublished": true,
						"readonly": true
					}
				],
				"labels": {}
			};

			options = info.deployCluster;
			options.params = {
				group: "tester",
				name: "tester-vn"
			};
			service.getSecurityGroup(options, function(error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponse);
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

	describe("syncPortsFromCatalogRecipe", function() {
		afterEach((done) => {
			sinon.restore();
			done();
		});

		it("Success", function(done) {
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroups: [ 'tester-sg' ],
				ports: [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
			};

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
				sinon
					.stub(serviceUtils, 'getConnector')
					.returns({
						resourceGroups: {
							checkExistence: (env, cb) => {
								return cb(null, true)
							}
						},
						virtualMachines: {
							get: (env, vmName, cb) => {
								return cb(null, info.virtualMachines[0]);
							}
						},
						networkInterfaces: {
							get: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, info.networkInterface[networkInterfaceName]);
							},
							listAll: (cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},
                            list: (test, cb) => {
                                return cb(null, [info.networkInterface["tester-ni"]]);
                            },
						},
						networkSecurityGroups: {
							get: (resourceGroupName, networkSecurityGroupName, cb) => {
								return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
							},
							update: (options, cb) => {
								return cb(null, true);
							},
							listAll: (cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
							list: (cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
						},
						publicIPAddresses: {
							get: (resourceGroupName, ipName, cb) => {
								return cb(null, info.publicIp[ipName]);
							},
							listAll: (cb) => {
								return cb(null, [info.publicIp])
							},
							list: (cb) => {
								return cb(null, [info.publicIp])
							},
						},
						networkInterfaceLoadBalancers: {
							list: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, []);
							}
						},
						loadBalancers: {
							listAll: (cb) => {
								return cb(null, []);
							},
							list: (cb) => {
								return cb(null, []);
							},
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

				let nocks = nock('https://management.azure.com')
					.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.securityGroups[0]}?api-version=2018-02-01`,
						{
							"location": 'eastus',
							"properties": {
								"securityRules": [
							        {
							          "name": "mongo",
							          "properties": {
							            "priority": 500,
							            "protocol": "*",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "27017"
							          }
							        },
							        {
							          "name": "ssh",
							          "properties": {
							            "priority": 100,
							            "protocol": "Tcp",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "22"
							          }
							        }
							      ]
							},
							"tags": {}
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
							"defaultSecurityRules": [] //NOTE no need to include the defautl security rules for this request
						}
					});

				service.syncPortsFromCatalogRecipe(options, function (error, response) {
					assert.ifError(error);
					assert.ok(response);
					done();
				});
		});

		it("Fail - Missing instance ids, security grous could not be retreived", function(done) {
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroups: [],
				vms: [],
				ports: [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
			};

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

				service.syncPortsFromCatalogRecipe(options, function (error, response) {
					assert.ok(error);
					assert.deepEqual(error, {
						source: 'driver',
						value: 'Missing instance ids, security groups could not be retreived',
						code: 734,
						msg: 'Unable to list security groups'
					});
					done();
			});
		});

		it("Success - list of vms passed but no security groups", function(done) {
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroups: [],
				vms: [ 'tester-vm' ],
				ports: [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
			};

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
				sinon
					.stub(serviceUtils, 'getConnector')
					.returns({
						resourceGroups: {
							checkExistence: (env, cb) => {
								return cb(null, true)
							}
						},
						virtualMachines: {
							get: (env, vmName, cb) => {
								return cb(null, info.virtualMachines[0]);
							}
						},
						networkInterfaces: {
							get: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, info.networkInterface[networkInterfaceName]);
							},
							listAll: (cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},
							list: (test, cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},
						},
						networkSecurityGroups: {
							get: (resourceGroupName, networkSecurityGroupName, cb) => {
								return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
							},
							update: (options, cb) => {
								return cb(null, true);
							},
							listAll: (cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
							list: (group, cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
						},
						publicIPAddresses: {
							get: (resourceGroupName, ipName, cb) => {
								return cb(null, info.publicIp[ipName]);
							},
							listAll: (cb) => {
								return cb(null, [info.publicIp])
							},
							list: (test, cb) => {
								return cb(null, [info.publicIp])
							},
						},
						networkInterfaceLoadBalancers: {
							list: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, []);
							}
						},
						loadBalancers: {
							listAll: (cb) => {
								return cb(null, []);
							},
							list: (test, cb) => {
								return cb(null, []);
							},
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

				let nocks = nock('https://management.azure.com')
					.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/tester-sg?api-version=2018-02-01`,
						{
							"location": 'eastus',
							"properties": {
								"securityRules": [
							        {
							          "name": "mongo",
							          "properties": {
							            "priority": 500,
							            "protocol": "*",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "27017"
							          }
							        },
							        {
							          "name": "ssh",
							          "properties": {
							            "priority": 100,
							            "protocol": "Tcp",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "22"
							          }
							        }
							      ]
							},
							"tags": {}
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
							"defaultSecurityRules": [] //NOTE no need to include the defautl security rules for this request
						}
					});

				service.syncPortsFromCatalogRecipe(options, function (error, response) {
					assert.ifError(error);
					assert.ok(response);
					done();
				});
		});

		it("Success - list of vms passed but no ports available in catalog recipe", function(done) {
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroups: [],
				vms: [ 'tester-vm' ],
				ports: []
			};

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
				sinon
					.stub(serviceUtils, 'getConnector')
					.returns({
						resourceGroups: {
							checkExistence: (env, cb) => {
								return cb(null, true)
							}
						},
						virtualMachines: {
							get: (env, vmName, cb) => {
								return cb(null, info.virtualMachines[0]);
							}
						},
						networkInterfaces: {
							get: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, info.networkInterface[networkInterfaceName]);
							},
							listAll: (cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},
							list: (test, cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},
						},
						networkSecurityGroups: {
							get: (resourceGroupName, networkSecurityGroupName, cb) => {
								return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
							},
							update: (options, cb) => {
								return cb(null, true);
							},
							listAll: (cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
							list: (group, cb) => {
								return cb(null, [info.networkSecurityGroup["tester-sg"]]);
							},
						},
						publicIPAddresses: {
							get: (resourceGroupName, ipName, cb) => {
								return cb(null, info.publicIp[ipName]);
							},
							listAll: (cb) => {
								return cb(null, [info.publicIp])
							},
							list: (test, cb) => {
								return cb(null, [info.publicIp])
							},
						},
						networkInterfaceLoadBalancers: {
							list: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, []);
							}
						},
						loadBalancers: {
							listAll: (cb) => {
								return cb(null, []);
							},
							list: (test, cb) => {
								return cb(null, []);
							},
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

				let nocks = nock('https://management.azure.com')
					.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/tester-sg?api-version=2018-02-01`,
						{
							"location": 'eastus',
							"properties": {
								"securityRules": [
							        {
							          "name": "mongo",
							          "properties": {
							            "priority": 500,
							            "protocol": "*",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "27017"
							          }
							        },
							        {
							          "name": "ssh",
							          "properties": {
							            "priority": 100,
							            "protocol": "Tcp",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "*"
							          }
							        }
							      ]
							},
							"tags": {}
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
							"defaultSecurityRules": [] //NOTE no need to include the defautl security rules for this request
						}
					});

				service.syncPortsFromCatalogRecipe(options, function (error, response) {
					assert.ifError(error);
					assert.ok(response);
					done();
				});
		});

		it("Fail - security group not found", function(done) {
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				securityGroups: [ 'invalid-sg' ],
				ports: [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
			};

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
				sinon
					.stub(serviceUtils, 'getConnector')
					.returns({
						resourceGroups: {
							checkExistence: (env, cb) => {
								return cb(null, true)
							}
						},
						virtualMachines: {
							get: (env, vmName, cb) => {
								return cb(null, info.virtualMachines[0]);
							}
						},
						networkInterfaces: {
							get: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, info.networkInterface[networkInterfaceName]);
							},
							list: (test, cb) => {
								return cb(null, [info.networkInterface["tester-ni"]]);
							},

						},
						networkSecurityGroups: {
							get: (resourceGroupName, networkSecurityGroupName, cb) => {
								return cb(new Error("security group not found"));
							},
							update: (options, cb) => {
								return cb(null, true);
							},
							listAll: (cb) => {
								return cb(null, []);
							},
                            list: (group, cb) => {
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                            },
						},
						publicIPAddresses: {
							get: (resourceGroupName, ipName, cb) => {
								return cb(null, info.publicIp[ipName]);
							},
							listAll: (cb) => {
								return cb(null, [info.publicIp])
							},
							list: (cb) => {
								return cb(null, [info.publicIp])
							},
						},
						networkInterfaceLoadBalancers: {
							list: (resourceGroupName, networkInterfaceName, cb) => {
								return cb(null, []);
							}
						},
						loadBalancers: {
							listAll: (cb) => {
								return cb(null, []);
							},
							list: (test, cb) => {
								return cb(null, []);
							},
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

				let nocks = nock('https://management.azure.com')
					.put(`/subscriptions/${options.infra.api.subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.securityGroups[0]}?api-version=2018-02-01`,
						{
							"location": 'eastus',
							"properties": {
								"securityRules": [
							        {
							          "name": "mongo",
							          "properties": {
							            "priority": 500,
							            "protocol": "*",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "27017"
							          }
							        },
							        {
							          "name": "ssh",
							          "properties": {
							            "priority": 100,
							            "protocol": "Tcp",
							            "access": "Allow",
							            "direction": "Inbound",
							            "sourceAddressPrefix": "*",
							            "sourcePortRange": "*",
							            "destinationAddressPrefix": "*",
							            "destinationPortRange": "*"
							          }
							        }
							      ]
							},
							"tags": {}
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
							"defaultSecurityRules": [] //NOTE no need to include the defautl security rules for this request
						}
					});

				service.syncPortsFromCatalogRecipe(options, function (error, response) {
					assert.ok(error);
					assert.deepEqual(error, {
						source: 'driver',
						value: 'security group not found',
						code: 734,
						msg: 'Unable to list security groups'
					});
					done();
				});
		});
	});
});
