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
	
	describe("listLoadBalancers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						list: (resourceGroupName, cb) => {
							return cb(null, info.rawLoadBalancers)
						}
					},
					publicIPAddresses: {
						list: (resourceGroupName, cb) => {
							return cb(null, [
									{
										"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-ip", //id
										"name": "tester-ip",                                 // public ip name
										"type": "Microsoft.Network/publicIPAddresses",
										"location": "eastus",                               // the location where the public ip is created.
										"tags": {},
										"sku": {                                            // sku is the identification code for a machine
											"name": "Basic"
										},
										"publicIPAllocationMethod": "Dynamic",
										"publicIPAddressVersion": "IPv4",
										"ipConfiguration": {                               //reference the IP configuration
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb-1/frontendIPConfigurations/LoadBalancerFrontEnd"
											
										},
										"ipTags": [],
										"ipAddress": "40.114.121.7",
										"idleTimeoutInMinutes": 30,
										"resourceGuid": "2659d8ca-dba2-4b8e-8a1d-fb922c71f432",
										"provisioningState": "Succeeded",
										"etag": "W/\"a606e103-19e7-4c17-b92f-7ed88be91968\""
									}, {
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
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
										},
										"ipTags": [],
										"idleTimeoutInMinutes": 4,
										"resourceGuid": "b259942c-01ce-4693-a583-68ed737885bb",
										"provisioningState": "Succeeded",
										"etag": "W/\"3eebeb0c-d2e3-45b3-ac3e-f50b8e7fa569\""
									}
								]
							)
						}
					},
				});
			options.params = {
				group: "testcase",
			};
			service.listLoadBalancers(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(info.loadBalancers, response);
				done();
			});
		});
	});
	
	describe("createLoadBalancer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success 1", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							if (Object.keys(params).length === 4) {
								return cb(null, {
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
											"privateIPAllocationMethod": "Dynamic",
											"publicIPAddress": {
												"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress"
											},
											"provisioningState": "Succeeded",
											"name": "public-ip-config",
											"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
										}
									],
									"backendAddressPools": [
										{
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/backendAddressPools/tester-lb-address-pool",
											"provisioningState": "Succeeded",
											"name": "tester-lb-address-pool",
											"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
										}
									],
									"loadBalancingRules": [],
									"probes": [],
									"inboundNatRules": [],
									"inboundNatPools": [],
									"resourceGuid": "6bf98d10-ab2a-45c0-903c-e0ab8b779e44",
									"provisioningState": "Succeeded",
									"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
								})
							}
							else {
								return cb(null, {
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
												"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress"
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
								})
							}
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-1',
				region: 'centralus',
				addressPools: [
					{
						name: 'tester-lb-address-pool'
					}
				],
				rules: [{
					name: 'public-ip-config',
					config:
					// all configs should be public or not, you cannot have one public and the other private
						{
							
							privateIpAllocationMethod: 'Dynamic',
							isPublic: true,
							publicIpAddress: {
								id: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress' // existing id from azure
							}
						},
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'public-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natPools: [
						{
							name: 'nat-pool-1',
							backendPort: 8080,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPortRangeStart: 30000,
							frontendPortRangeEnd: 30010,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'public-ip-config' //this name should match one created in ipConfigs []
						}
					]
				}]
				
			};
			let expectedRes = {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1",
				"name": "tester-lb-1",
				"region": "centralus",
				"group": "testcase"
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedRes, response);
				done();
			});
		});
		
		it("Success 2", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							if (Object.keys(params).length === 4) {
								return cb(null, {
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
											"privateIPAddress": "10.2.0.10",
											"privateIPAllocationMethod": "Static",
											"subnet": {
												"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet"
											},
											"provisioningState": "Succeeded",
											"name": "private-ip-config",
											"etag": "W/\"dec4fdd6-0e18-423d-8376-6ba9af2a2f61\""
										}
									],
									"backendAddressPools": [
										{
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2/backendAddressPools/tester-lb-address-pool",
											"provisioningState": "Succeeded",
											"name": "tester-lb-address-pool",
											"etag": "W/\"dec4fdd6-0e18-423d-8376-6ba9af2a2f61\""
										}
									],
									"loadBalancingRules": [],
									"probes": [],
									"inboundNatRules": [],
									"inboundNatPools": [],
									"resourceGuid": "2b68bb2c-14c0-4b66-bbe2-5652e9b8d6a8",
									"provisioningState": "Succeeded",
									"etag": "W/\"dec4fdd6-0e18-423d-8376-6ba9af2a2f61\""
								})
							}
							else {
								return cb(null, {
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
								})
							}
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-2',
				region: 'centralus',
				addressPools: [
					{
						name: 'tester-lb-address-pool'
					}
				],
				rules: [{
					name: 'private-ip-config',
					config:
					// all configs should be public or not, you cannot have one public and the other private
						{
							privateIpAllocationMethod: 'Static',
							privateIpAddress: '10.2.0.10',
							isPublic: false,
							subnet: {
								id: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet' // existing id from azure
							}
						},
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natRules: [
						{
							name: 'nat-rule-1',
							backendPort: 8081,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPort: 30011,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
						}
					],
				}],
				
			};
			let expectedRes =
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-2",
					"name": "tester-lb-2",
					"region": "centralus",
					"group": "testcase"
				}
			;
			service.createLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedRes, response);
				done();
			});
		});
		
		it("failure no ipConfigs and addressPools", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							return cb(null, true);
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-2',
				region: 'centralus',
				rules: [{
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natRules: [
						{
							name: 'nat-rule-1',
							backendPort: 8081,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPort: 30011,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
						}
					],
					natPools: [
						{
							name: 'nat-pool-1',
							backendPort: 8080,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPortRangeStart: 30000,
							frontendPortRangeEnd: 30010,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'public-ip-config' //this name should match one created in ipConfigs []
						}
					]
				}],
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("failure ip configurations aren't the same", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							return cb(null, true);
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-2',
				region: 'centralus',
				rules: [{
					name: 'private-ip-config',
					config:
					// all configs should be public or not, you cannot have one public and the other private
						{
							
							privateIpAllocationMethod: 'Static',
							privateIpAddress: '10.2.0.10',
							isPublic: false,
							subnet: {
								id: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet' // existing id from azure
							}
							
						},
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natRules: [
						{
							name: 'nat-rule-1',
							backendPort: 8081,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPort: 30011,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
						}
					]
				},
					{
						name: 'private-ip-config',
						config:
						// all configs should be public or not, you cannot have one public and the other private
							
							{
								name: 'private-ip-config',
								privateIpAllocationMethod: 'Static',
								privateIpAddress: '10.2.0.10',
								isPublic: true,
								subnet: {
									id: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet' // existing id from azure
								}
							},
						ports: [
							{
								name: 'port-1',
								protocol: 'Tcp',
								target: 80,
								published: 80,
								idleTimeoutInMinutes: 30,
								loadDistribution: 'Default',
								enableFloatingIP: false,
								disableOutboundSnat: true,
								addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
								lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
								
								healthProbePort: 80,
								healthProbeProtocol: 'Http',
								healthProbeRequestPath: '/',
								maxFailureAttempts: 20,
								healthProbeInterval: 10
							}
						],
						// natPools or natRules, both at the same time doesn't work
						natRules: [
							{
								name: 'nat-rule-1',
								backendPort: 8081,
								protocol: 'Tcp',
								enableFloatingIP: false,
								frontendPort: 30011,
								idleTimeoutInMinutes: 4,
								frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
							}
						]
					}],
				
				
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("failure natPools and natRules are both supplied", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							return cb(null, true);
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-2',
				region: 'centralus',
				rules: [{
					name: 'private-ip-config',
					config:
					// all configs should be public or not, you cannot have one public and the other private
						{
							name: 'private-ip-config',
							privateIpAllocationMethod: 'Static',
							privateIpAddress: '10.2.0.10',
							isPublic: false,
							subnet: {
								id: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet' // existing id from azure
							}
						},
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natRules: [
						{
							name: 'nat-rule-1',
							backendPort: 8081,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPort: 30011,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
						}
					],
					natPools: [
						{
							name: 'nat-pool-1',
							backendPort: 8080,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPortRangeStart: 30000,
							frontendPortRangeEnd: 30010,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'public-ip-config' //this name should match one created in ipConfigs []
						}
					]
				},
					{
						name: 'private-ip-config',
						config:
							
							{
								
								privateIpAllocationMethod: 'Static',
								privateIpAddress: '10.2.0.10',
								isPublic: false,
								subnet: {
									subnetId: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-network/subnets/test-subnet' // existing id from azure
								}
							},
						ports: [
							{
								name: 'port-1',
								protocol: 'Tcp',
								target: 80,
								published: 80,
								idleTimeoutInMinutes: 30,
								loadDistribution: 'Default',
								enableFloatingIP: false,
								disableOutboundSnat: true,
								addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
								lbIpConfigName: 'private-ip-config', //this name should match one created in ipConfigs []
								
								healthProbePort: 80,
								healthProbeProtocol: 'Http',
								healthProbeRequestPath: '/',
								maxFailureAttempts: 20,
								healthProbeInterval: 10
							}
						],
						// natPools or natRules, both at the same time doesn't work
						natRules: [
							{
								name: 'nat-rule-1',
								backendPort: 8081,
								protocol: 'Tcp',
								enableFloatingIP: false,
								frontendPort: 30011,
								idleTimeoutInMinutes: 4,
								frontendIPConfigName: 'private-ip-config' //this name should match one created in ipConfigs []
							}
						],
						natPools: [
							{
								name: 'nat-pool-1',
								backendPort: 8080,
								protocol: 'Tcp',
								enableFloatingIP: false,
								frontendPortRangeStart: 30000,
								frontendPortRangeEnd: 30010,
								idleTimeoutInMinutes: 4,
								frontendIPConfigName: 'public-ip-config' //this name should match one created in ipConfigs []
							}
						]
					}],
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("failure no rules", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							return cb(null, true);
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-2',
				region: 'centralus',
				addressPools: [
					{
						name: 'tester-lb-address-pool'
					}
				]
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("updateLoadBalancer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					loadBalancers: {
						createOrUpdate: (resourceGroupName, name, params, cb) => {
							if (Object.keys(params).length === 4) {
								return cb(null, {
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
											"privateIPAllocationMethod": "Dynamic",
											"publicIPAddress": {
												"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress"
											},
											"provisioningState": "Succeeded",
											"name": "public-ip-config",
											"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
										}
									],
									"backendAddressPools": [
										{
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/backendAddressPools/tester-lb-address-pool",
											"provisioningState": "Succeeded",
											"name": "tester-lb-address-pool",
											"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
										}
									],
									"loadBalancingRules": [],
									"probes": [],
									"inboundNatRules": [],
									"inboundNatPools": [],
									"resourceGuid": "6bf98d10-ab2a-45c0-903c-e0ab8b779e44",
									"provisioningState": "Succeeded",
									"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
								})
							}
							else {
								return cb(null, {
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
												"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress"
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
								})
							}
						},
						get: (resourceGroupName, name, cb) => {
							return cb(null, {
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
										"privateIPAllocationMethod": "Dynamic",
										"publicIPAddress": {
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress"
										},
										"provisioningState": "Succeeded",
										"name": "public-ip-config",
										"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
									}
								],
								"backendAddressPools": [
									{
										"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1/backendAddressPools/tester-lb-address-pool",
										"provisioningState": "Succeeded",
										"name": "tester-lb-address-pool",
										"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
									}
								],
								"loadBalancingRules": [],
								"probes": [],
								"inboundNatRules": [],
								"inboundNatPools": [],
								"resourceGuid": "6bf98d10-ab2a-45c0-903c-e0ab8b779e44",
								"provisioningState": "Succeeded",
								"etag": "W/\"b7e3974e-4950-49da-b328-d09c330d7a32\""
							})
						}
					},
				});
			options.params = {
				group: 'testcase',
				name: 'tester-lb-1',
				region: 'centralus',
				addressPools: [
					{
						name: 'tester-lb-address-pool'
					}
				],
				rules: [{
					name: 'public-ip-config',
					config: [
						// all configs should be public or not, you cannot have one public and the other private
						{
							privateIpAllocationMethod: 'Dynamic',
							isPublic: true,
							publicIpAddressId: '/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/publicIPAddresses/test-ipaddress' // existing id from azure
						}
					],
					ports: [
						{
							name: 'port-1',
							protocol: 'Tcp',
							target: 80,
							published: 80,
							idleTimeoutInMinutes: 30,
							loadDistribution: 'Default',
							enableFloatingIP: false,
							disableOutboundSnat: true,
							addressPoolName: 'tester-lb-address-pool', //this name should match one created in addressPools []
							lbIpConfigName: 'public-ip-config', //this name should match one created in ipConfigs []
							
							healthProbePort: 80,
							healthProbeProtocol: 'Http',
							healthProbeRequestPath: '/',
							maxFailureAttempts: 20,
							healthProbeInterval: 10
						}
					],
					// natPools or natRules, both at the same time doesn't work
					natPools: [
						{
							name: 'nat-pool-1',
							backendPort: 8080,
							protocol: 'Tcp',
							enableFloatingIP: false,
							frontendPortRangeStart: 30000,
							frontendPortRangeEnd: 30010,
							idleTimeoutInMinutes: 4,
							frontendIPConfigName: 'public-ip-config' //this name should match one created in ipConfigs []
						}
					]
				}]
				
			};
			let expectedRes = {
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/testcase/providers/Microsoft.Network/loadBalancers/tester-lb-1",
				"name": "tester-lb-1",
				"region": "centralus",
				"group": "testcase"
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedRes, response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - deleteLoadBalancer", function () {
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
						deleteMethod: (resourceGroupName, loadBalancerName, cb) => {
							return cb(null, true);
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "tester",
				loadBalancerName: "tester-lb",
			};
			service.deleteLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
