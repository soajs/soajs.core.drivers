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
						},
						listAll: (cb) => {
							return cb(null, [info.networkInterface["tester-ni"]]);
						}
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						}
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName]);
						},
						listAll: (cb) => {
							return cb(null, [info.publicIp])
						}
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, []);
						}
					},
					loadBalancers: {
						listAll: (cb) => {
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
							"state": "succeeded"
						},
						"ref": {
							"os": {
								"type": "Linux",
								"diskSizeGB": 30
							}
						}
					}
				],
				"ip": [
					{
						"type": "private",
						"allocatedTo": "instance",
						"address": "10.0.2.4"
					}
				],
				"layer": "tester-subnet",
				"network": "tester-vn"
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
		
		it("Success loadBalancer", function (done) {
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
						},
						listAll: (cb) => {
							return cb(null, [info.networkInterface["tester-ni"]]);
						}
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						}
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName]);
						},
						listAll: (cb) => {
							return cb(null, [info.publicIp["tester-tester-ip"]])
						}
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, info.loadBalancerList);
						}
					},
					loadBalancers: {
						listAll: (cb) => {
							return cb(null, info.loadBalancerList);
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
							"state": "succeeded"
						},
						"ref": {
							"os": {
								"type": "Linux",
								"diskSizeGB": 30
							}
						}
					}
				],
				"ip": [
					{
						"type": "private",
						"allocatedTo": "instance",
						"address": "10.0.2.4"
					},
					{
						"type": "public",
						"allocatedTo": "loadBalancer",
						"address": "23.99.134.149"
					}
				],
				"layer": "tester-subnet",
				"network": "tester-vn",
				"loadBalancers": [
					{
						"name": "tester-tester-lb",
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb",
						"region": "centralus",
						"ipAddresses": [
							{
								"type": "public",
								"name": "tester-tester-ip",
								"address": "23.99.134.149"
							}
						]
					}
				]
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
							return cb(null, info.networkInterface[networkInterfaceName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkInterface["tester-ni"]]);
						}
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						}
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName])
						},
						listAll: (cb) => {
							return cb(null, [info.publicIp])
						}
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, []);
						}
					},
					loadBalancers: {
						listAll: ( cb) => {
							return cb(null,  info.loadBalancerList);
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
								"state": "succeeded"
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"ip": [
						{
							"type": "private",
							"allocatedTo": "instance",
							"address": "10.0.2.4"
						}
					],
					"layer": "tester-subnet",
					"network": "tester-vn"
				},
				{
					"name": "mongo",
					"id": "mongo",
					"labels": {
						"soajs.service.vm.location": "centralus",
						"soajs.service.vm.group": "SOAJS",
						"soajs.service.vm.size": "Standard_B1ms"
					},
					"ports": [],
					"voluming": {
						"volumes": []
					},
					"tasks": [
						{
							"id": "mongo",
							"name": "mongo",
							"status": {
								"state": "succeeded"
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"ip": []
				},
				{
					"name": "mysql",
					"id": "mysql",
					"labels": {
						"soajs.service.vm.location": "centralus",
						"soajs.service.vm.group": "SOAJS",
						"soajs.service.vm.size": "Standard_B1ms"
					},
					"ports": [],
					"voluming": {
						"volumes": []
					},
					"tasks": [
						{
							"id": "mysql",
							"name": "mysql",
							"status": {
								"state": "succeeded"
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30
								}
							}
						}
					],
					"ip": []
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
	
	describe("calling executeDriver - getLogs", function () {
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
			service.executeDriver('getLogs', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(info.runCommand, response);
				done();
			});
		});
	});
});
