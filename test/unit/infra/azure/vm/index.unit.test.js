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
						checkExistence:  (env, cb)=>{
							return cb(null, true)
						}
					},
					virtualMachines: {
						get:  (env, vmName, cb)=> {
							return cb(null, info.virtualMachines[0]);
						}
					},
					networkInterfaces: {
						get:  (resourceGroupName, networkInterfaceName, cb)=> {
							return cb(null, info.networkInterface[networkInterfaceName]);
						}
					},
					networkSecurityGroups: {
						get:  (resourceGroupName, networkSecurityGroupName, cb)=> {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						}
					},
					publicIPAddresses: {
						get:  (resourceGroupName, ipName, cb)=> {
							return cb(null, info.publicIp[ipName]);
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
				"voluming": {},
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
			options.params ={
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
						checkExistence:  (env, cb)=>{
							return cb(null, true)
						}
					},
					virtualMachines: {
						listAll:  (cb)=> {
							return cb(null, info.virtualMachines)
						}
					},
					networkInterfaces: {
						get:  (resourceGroupName, networkInterfaceName, cb)=> {
							return cb(null, info.networkInterface[networkInterfaceName])
						}
					},
					networkSecurityGroups: {
						get:  (resourceGroupName, networkSecurityGroupName, cb)=> {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName])
						}
					},
					publicIPAddresses: {
						get:  (resourceGroupName, ipName, cb)=> {
							return cb(null, info.publicIp[ipName])
						}
					},

				});
			let expectedResponce =  [
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
					"voluming": {},
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
					"voluming": {},
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
					"voluming": {},
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
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
});
