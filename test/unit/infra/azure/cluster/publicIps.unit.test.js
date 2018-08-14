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
	
	describe("listPublicIps", function () {
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
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkInterfaces/tester-ni/ipConfigurations/testconfiguration1"
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
											"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb/frontendIPConfigurations/LoadBalancerFrontEnd"
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
			
			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
			};
			let expectedResponce = [
				{
					"name": "tester-ip",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-ip",
					"region": "eastus",
					"address": "40.114.121.7",
					"publicIPAllocationMethod": "dynamic",
					"idleTimeout": 1800,
					"ipAddressVersion": "IPv4",
					"labels": {},
					"type": "basic",
					"associated": {
						"subscription": "d159e994-8b44-42f7-b100-78c4508c34a6",
						"group": "tester",
						"type": "networkInterface",
						"name": "tester-ni"
					}
				},
				{
					"name": "tester-lb-ip",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-lb-ip",
					"region": "centralus",
					"publicIPAllocationMethod": "dynamic",
					"idleTimeout": 240,
					"ipAddressVersion": "IPv4",
					"type": "basic",
					"associated": {
						"subscription": "d159e994-8b44-42f7-b100-78c4508c34a6",
						"group": "tester",
						"type": "loadBalancer",
						"name": "tester-lb"
					}
				}
			];
			service.listPublicIps(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponce);
				done();
			});
		});
	});
	
	describe("createPublicIp", function () {
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
					publicIPAddresses: {
						createOrUpdate: (resourceGroupName, publicIpAddressName, params, cb) => {
							return cb(null,
								[
									{
										"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
										"ipAddress": "137.117.72.226",
										"tags": {},
										"name": "tester-vm-ip",
										"publicIPAllocationMethod": "Dynamic",
										"location": "eastus"
									}
								]
							)
						}
					},
				});
			
			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
				publicIpName: "tester-vm-ip",
				region: "eastus",
				
			};
			let expectedResponce =
				[
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
						"address": "137.117.72.226",
						"labels": {},
						"name": "tester-vm-ip",
						"publicIPAllocationMethod": "dynamic",
						"region": "eastus"
					}
				];
			service.createPublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponce);
				done();
			});
		});
	});
	
	describe("updatePublicIp", function () {
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
					publicIPAddresses: {
						createOrUpdate: (resourceGroupName, publicIpAddressName, params, cb) => {
							return cb(null, [
								{
									"name": "tester-vm-ip",
									"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
									"location": "eastus",
									"ipAddress": "137.117.72.226",
									"publicIPAllocationMethod": "Dynamic",
									"tags": {}
								}
							])
						}
					},
				});
			
			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
				publicIpName: "tester-vm-ip",
				region: "eastus",
				
			};
			let expectedResponce = [
				{
					"name": "tester-vm-ip",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
					"region": "eastus",
					"address": "137.117.72.226",
					"publicIPAllocationMethod": "dynamic",
					"labels": {}
				}
			
			];
			service.updatePublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponce);
				done();
			});
		});
	});
	
	describe("deletePublicIp", function () {
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
						deleteMethod: (resourceGroupName, publicIpName, cb) => {
							return cb(null, true);
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				group: "testcase",
				publicIpName: "tester-vm-ip2",
			};
			service.deletePublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
