"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/azure/index.js');
const serviceUtils = helper.requireModule("./infra/azure/utils/index.js");

let dD = require('../../../../schemas/azure/cluster.js');
let info = {};
let options = {};

describe("testing /lib/azure/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("calling executeDriver - getConnector", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver -  deployService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - inspectService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - deleteService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});

			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachines: {
						deleteMethod:  (env, id, cb)=>{
							return cb(null, true)
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("calling executeDriver - restartService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - redeployService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - powerOffVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - startVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling executeDriver - listVmSizes", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineSizes: {
						list:  (location, cb)=>{
							return cb(null, {})
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('listVmSizes', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
			done();
			});
		});
	});

	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineImages: {
						listPublishers:  (location, cb)=>{
							return cb(null, {})
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('listVmImagePublishers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
			done();
			});
		});
	});

	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineImages: {
						listOffers:  (location, publisher, cb)=>{
							return cb(null, {})
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('listVmImagePublisherOffers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
			done();
			});
		});
	});

	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineImages: {
						listSkus:  (location, publisher, offer, cb)=>{
							return cb(null, {})
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('listVmImageVersions', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
			done();
			});
		});
	});
//////////////////////////////////////////////////////////////////////////////////////////////////////////
describe("calling executeDriver - listNetworks", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				virtualNetworks: {
					list:  (resourceGroupName, cb)=>{
						return cb(null, [
	[{
		"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn",
		"name": "tester-vn",
		"type": "Microsoft.Network/virtualNetworks",
		"location": "eastus",
		"tags": {},
		"addressSpace": {
			"addressPrefixes": ["Object"]
		},
		"dhcpOptions": {
			"dnsServers": []
		},
		"subnets": [
			["Object"]
		],
		"virtualNetworkPeerings": [],
		"resourceGuid": "59078077-b277-47ae-a705-cb819bfcafe4",
		"provisioningState": "Succeeded",
		"enableDdosProtection": false,
		"enableVmProtection": false,
		"etag": "W\"6c581c8c-d2c0-4e6f-b32b-b9db99ca2369\""
	}],
	[{
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
		"subnets": [{
			"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet",
			"addressPrefix": "10.0.2.0/24",
			"serviceEndpoints": [],
			"ipConfigurations": [{
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
			}],
			"provisioningState": "Succeeded",
			"name": "tester-subnet",
			"etag": "W/\"6c581c8c-d2c0-4e6f-b32b-b9db99ca2369\""
		}],
		"virtualNetworkPeerings": [],
		"resourceGuid": "59078077-b277-47ae-a705-cb819bfcafe4",
		"provisioningState": "Succeeded",
		"enableDdosProtection": false,
		"enableVmProtection": false,
		"etag": "W/\"6c581c8c-d2c0-4e6f-b32b-b9db99ca2369\""
	}]
])
					}
				},
			});
			info = dD();
		options = info.deployCluster;
		service.executeDriver('listNetworks', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual();
		done();
		});
	});
});

describe("calling executeDriver - listLoadBalancers", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				loadBalancers: {
					list:  (resourceGroupName, cb)=>{
						return cb(null, {
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
				        "etag": "W/\"6f4eba17-9470-4496-8ad6-25ddb9e804c1\""
				      }
				    ],
				    "backendAddressPools": [],
				    "loadBalancingRules": [],
				    "probes": [],
				    "inboundNatRules": [],
				    "inboundNatPools": [],
				    "outboundNatRules": [],
				    "resourceGuid": "fd3aaf39-5384-4cab-b3d2-f703b21a2637",
				    "provisioningState": "Succeeded",
				    "etag": "W/\"6f4eba17-9470-4496-8ad6-25ddb9e804c1\""
						})
					}
				},
			});
			info = dD();
		options = info.deployCluster;
		service.executeDriver('listLoadBalancers', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual();
		done();
		});
	});
});

describe("calling executeDriver - listSubnets", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				subnets: {
					list:  (resourceGroupName, virtualNetworkName, cb)=>{
						return cb(null, [
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
        "etag": "W/\"6f4eba17-9470-4496-8ad6-25ddb9e804c1\""
      }
    ],
    "backendAddressPools": [],
    "loadBalancingRules": [],
    "probes": [],
    "inboundNatRules": [],
    "inboundNatPools": [],
    "outboundNatRules": [],
    "resourceGuid": "fd3aaf39-5384-4cab-b3d2-f703b21a2637",
    "provisioningState": "Succeeded",
    "etag": "W/\"6f4eba17-9470-4496-8ad6-25ddb9e804c1\""
  }
])
					}
				},
			});
			info = dD();
		options = info.deployCluster;
		service.executeDriver('listSubnets', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual();
		done();
		});
	});
});

describe("calling executeDriver - listSecurityGroups", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				networkSecurityGroups: {
					list:  (resourceGroupName, cb)=>{
						return cb(null, [
  {
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
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
        "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
      }
    ],
    "networkInterfaces": [
      {
        "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni"
      }
    ],
    "resourceGuid": "346ebc16-423d-4829-aa0b-91735cb347df",
    "provisioningState": "Succeeded",
    "etag": "W/\"f3b210e5-9217-4bbe-8dd8-ada7280ae876\""
  }
])
					}
				},
			});
			info = dD();
		options = info.deployCluster;
		service.executeDriver('listSecurityGroups', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual();
		done();
		});
	});
});

	describe("calling executeDriver - listPublicIp", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					publicIPAddresses: {
						list:  (resourceGroupName, cb)=>{
							return cb(null, [
  {
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
    "ipAddress": "40.114.121.7",
    "idleTimeoutInMinutes": 30,
    "resourceGuid": "2659d8ca-dba2-4b8e-8a1d-fb922c71f432",
    "provisioningState": "Succeeded",
    "etag": "W/\"a606e103-19e7-4c17-b92f-7ed88be91968\""
  },
  {
    "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-lb-ip",
    "name": "tester-lb-ip",
    "type": "Microsoft.Network/publicIPAddresses",
    "location": "centralus",
    "sku": {
      "name": "Basic"
    },
    "publicIPAllocationMethod": "Dynamic",
    "publicIPAddressVersion": "IPv4",
    "ipConfiguration": {
      "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb/frontendIPConfigurations/LoadBalancerFrontEnd"
    },
    "ipTags": [],
    "idleTimeoutInMinutes": 4,
    "resourceGuid": "b259942c-01ce-4693-a583-68ed737885bb",
    "provisioningState": "Succeeded",
    "etag": "W/\"3eebeb0c-d2e3-45b3-ac3e-f50b8e7fa569\""
  }
])
						}
					},
				});
				info = dD();
			options = info.deployCluster;
			service.executeDriver('listPublicIp', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual();
			done();
			});
		});
	});
});
