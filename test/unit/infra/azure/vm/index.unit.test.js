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
						}
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						}
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName]);
						}
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, []);
						}
					},
					subnets: {
						get: (resourceGroupName, vnetName, subnetName, cb) => {
							return cb(null, info.subnets[vnetName]);
						}
					},
					
				});
			let expectedResponce = {
				"name": "tester-vm",
				"network": "tester-vn",
				"id": "tester-vm",
				"labels": {
					"soajs.env.code": "tester",
					"soajs.service.vm.location": "eastus",
					"soajs.service.vm.group": "TESTER",
					"soajs.service.vm.size": "Standard_A1"
				},
				"ports": [
					{
						"protocol": "Tcp",
						"target": "*",
						"published": "22",
						"isPublished": true
					}
				],
				"voluming": {
					"volumes": []
				},
				"tasks": [
					{
						"id": "tester-vm",
						"name": "tester-vm",
						"status": {
							"state": "succeeded",
						},
						"ref": {
							"os": {
								"type": "Linux",
								"diskSizeGB": 30
							}
						}
					}
				],
				"env": [],
				"ip": "40.121.55.181"
			};
			options.env = 'tester';
			options.params = {
				vmName: 'tester-vm'
			};
			service.executeDriver('inspectService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				delete response.tasks[0].status.ts;
				assert.deepEqual(expectedResponce, response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listServices", function () {
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
					resourceGroups: {
						checkExistence: (env, cb) => {
							return cb(null, true)
						}
					},
					virtualMachines: {
						listAll: (cb) => {
							return cb(null, info.virtualMachines)
						}
					},
					networkInterfaces: {
						get: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, info.networkInterface[networkInterfaceName])
						}
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName])
						}
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName])
						}
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, []);
						}
					},
					subnets: {
						get: (resourceGroupName, vnetName, subnetName, cb) => {
							return cb(null, info.subnets[vnetName]);
						}
					},
					
				});
			let expectedResponce = [
				{
					"name": "tester-vm",
					"network": "tester-vn",
					"id": "tester-vm",
					"labels": {
						"soajs.env.code": "tester",
						"soajs.service.vm.location": "eastus",
						"soajs.service.vm.group": "TESTER",
						"soajs.service.vm.size": "Standard_A1"
					},
					"ports": [
						{
							"protocol": "Tcp",
							"target": "*",
							"published": "22",
							"isPublished": true
						}
					],
					"voluming": {
						"volumes": []
					},
					"tasks": [
						{
							"id": "tester-vm",
							"name": "tester-vm",
							"status": {
								"state": "succeeded",
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"env": [],
					"ip": "40.121.55.181"
				},
				{
					"name": "mongo",
					"network": "soajs-vn",
					"id": "mongo",
					"labels": {
						"soajs.service.vm.location": "centralus",
						"soajs.service.vm.group": "SOAJS",
						"soajs.service.vm.size": "Standard_B1ms"
					},
					"ports": [
						{
							"protocol": "TCP",
							"target": "*",
							"published": "22",
							"isPublished": true
						},
						{
							"protocol": "tcp/udp",
							"target": "*",
							"published": "27017",
							"isPublished": true
						}
					],
					"voluming": {
						"volumes": []
					},
					"tasks": [
						{
							"id": "mongo",
							"name": "mongo",
							"status": {
								"state": "succeeded",
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"env": [],
					"ip": "104.43.136.85"
				},
				{
					"name": "mysql",
					"network": "soajs-vn",
					"id": "mysql",
					"labels": {
						"soajs.service.vm.location": "centralus",
						"soajs.service.vm.group": "SOAJS",
						"soajs.service.vm.size": "Standard_B1ms"
					},
					"ports": [
						{
							"protocol": "TCP",
							"target": "*",
							"published": "22",
							"isPublished": true
						},
						{
							"protocol": "tcp/udp",
							"target": "*",
							"published": "3306",
							"isPublished": true
						}
					],
					"voluming": {
						"volumes": []
					},
					"tasks": [
						{
							"id": "mysql",
							"name": "mysql",
							"status": {
								"state": "succeeded",
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"env": [],
					"ip": "104.43.151.227"
				}
			];
			options.env = 'tester';
			service.executeDriver('listServices', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				delete response[0].tasks[0].status.ts;
				delete response[1].tasks[0].status.ts;
				delete response[2].tasks[0].status.ts;
				assert.deepEqual(expectedResponce, response);
				done();
			});
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
						deleteMethod: (env, id, cb) => {
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
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachines: {
						restart: (env, vmName, cb) => {
							return cb(null, {
								"name": "773283f6-f0f1-4f30-ac7b-49bab3ac4663",
								"status": "Succeeded",
								"startTime": "2018-06-11T12:31:11.006Z",
								"endTime": "2018-06-11T12:31:11.131Z"
							})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.env = 'tester';
			options.params = {
				vmName: 'tester-vm'
			};
			service.executeDriver('restartService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, {
					"name": "773283f6-f0f1-4f30-ac7b-49bab3ac4663",
					"status": "Succeeded",
					"startTime": "2018-06-11T12:31:11.006Z",
					"endTime": "2018-06-11T12:31:11.131Z"
				});
				done();
			});
		});
	});
	
	describe("calling executeDriver - redeployService", function () {
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
						redeploy: (env, vmName, cb) => {
							return cb(null, {})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.env = 'tester';
			options.params = {
				vmName: 'tester-vm'
			};
			service.executeDriver('redeployService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				//todo need to see result
				done();
			});
		});
	});
	
	describe("calling executeDriver - powerOffVM", function () {
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
						powerOff: (env, vmName, cb) => {
							return cb(null, {
								"name": "773283f6-f0f1-4f30-ac7b-49bab3ac4663",
								"status": "Succeeded",
								"startTime": "2018-06-11T12:31:11.006Z",
								"endTime": "2018-06-11T12:31:11.131Z"
							})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.env = 'tester';
			options.params = {
				vmName: 'tester-vm'
			};
			service.executeDriver('powerOffVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.equal(response.status, "Succeeded");
				done();
			});
		});
	});
	
	describe("calling executeDriver - startVM", function () {
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
						start: (env, vmName, cb) => {
							return cb(null, {
								"name": "773283f6-f0f1-4f30-ac7b-49bab3ac4663",
								"status": "Succeeded",
								"startTime": "2018-06-11T12:31:11.006Z",
								"endTime": "2018-06-11T12:31:11.131Z"
							})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.env = 'tester';
			options.params = {
				vmName: 'tester-vm'
			};
			service.executeDriver('startVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.equal(response.status, "Succeeded");
				done();
			});
		});
	});
	
	describe("calling executeDriver - deleteResourceGroup", function () {
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
					resourceGroups: {
						deleteMethod: (location, cb) => {
							return cb(null, true)
						}
					},
				});
			
			options = info.deployCluster;
			options.params = {
				env: "tester"
			};
			service.executeDriver('deleteResourceGroup', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listVmSizes", function () {
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
					virtualMachineSizes: {
						list: (location, cb) => {
							return cb(null, info.vmSize)
						}
					},
				});
			
			options = info.deployCluster;
			options.params = {
				location: "eastus"
			};
			service.executeDriver('listVmSizes', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.vmSize);
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
			info = dD();
			
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineImages: {
						listPublishers: (location, cb) => {
							return cb(null, info.vmImagePublisher)
						}
					},
				});
			options = info.deployCluster;
			options.params = {
				location: "eastus"
			};
			service.executeDriver('listVmImagePublishers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.vmImagePublisher);
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
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					virtualMachineImages: {
						listOffers: (location, publisher, cb) => {
							return cb(null, info.vmPublisherOffers)
						}
					},
				});
			
			options = info.deployCluster;
			options.params = {
				location: "eastus",
				publisher: "Canonical"
			};
			service.executeDriver('listVmImagePublisherOffers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.vmPublisherOffers);
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
						listSkus: (location, publisher, offer, cb) => {
							return cb(null, info.vmImageVersions)
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				location: "eastus",
				publisher: "Canonical",
				offer: "Ubuntu_Core"
			};
			service.executeDriver('listVmImageVersions', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.vmImageVersions);
				done();
			});
		});
	});
	
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
						list: (resourceGroupName, cb) => {
							return cb(null, info.virtualNetworks);
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
			};
			service.executeDriver('listNetworks', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.virtualNetworks);
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
							return cb(null, info.loadBalancers)
						}
					},
				});
			options.params = {
				resourceGroupName: "tester",
			};
			let expectedRes = [
				{
					"name": "tester-lb",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb",
					"region": "centralus"
				}
			];
			service.executeDriver('listLoadBalancers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedRes, response);
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
					subnets: {
						list: (resourceGroupName, virtualNetworkName, cb) => {
							return cb(null, info.subnets)
						}
					},
				});
			options.params = {
				resourceGroupName: "tester",
				virtualNetworkName: "tester-vn",
			};
			service.executeDriver('listSubnets', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.subnets);
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
							return cb(null, [info.networkSecurityGroup["tester-sg"]])
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
					"name": "tester-sg",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/networkSecurityGroups/tester-sg",
					"region": "eastus",
					"tags": {}
				}
			];
			
			service.executeDriver('listSecurityGroups', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expectedResponce, response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listPublicIps", function () {
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
							return cb(null, [info.publicIp["tester-ip"]])
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
					"location": "eastus",
					"ipAddress": "40.121.55.181",
					"publicIPAllocationMethod": "Dynamic",
					"tags": {}
				}
			];
			service.executeDriver('listPublicIps', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponce);
				done();
			});
		});
	});
	
	
	describe("calling executeDriver - listDisks", function () {
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
					disks: {
						list: (resourceGroupName, cb) => {
							return cb(null, info.Disks)
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				resourceGroupName: "dynamic-template",
			};
			service.executeDriver('listDisks', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(info.Disks, response);
				done();
			});
		});
	});
	
	
	describe("calling executeDriver - runCommand", function () {
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
						runCommand: (resourceGroupName, vmName, params, cb) => {
							return params.script && params.script.length ? cb(null, info.runCommand) : cb(true);
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			options.params = {
				command: [
					"#!/bin/bash"
				],
				args: ["sudo apt-get -y update"],
				env: ["rayan=test"]
			};
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(info.runCommand, response);
				done();
			});
		});
	});
});
