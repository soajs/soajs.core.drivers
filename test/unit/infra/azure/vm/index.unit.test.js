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
						},
						list: (test, cb) => {
							return cb(null, [info.networkInterface["tester-ni"]]);
						},

					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						},
                        list: (test, cb) => {
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
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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
					},

				});
			let expectedResponce = {
				"name": "tester-vm",
				"id": "tester-vm",
				"executeCommand": true,
				"labels": {
					"soajs.env.code": "tester",
					"soajs.layer.name": "tester",
					"soajs.network.name": "tester",
					"soajs.service.vm.location": "eastus",
					"soajs.service.vm.group": "TESTER",
					"soajs.service.vm.size": "Standard_A1",
					"soajs.vm.name": "tester"
				},
				"ports": [
					{
						"protocol": "Tcp",
						"access": "allow",
						"priority": 100,
						"name": "ssh",
						"direction": "inbound",
						"target": "22",
						"published": "*",
						"sourceAddress": "*",
						"destinationAddress": "*",
						"isPublished": true
					}
				],
				"voluming": {
					"volumes": []
				},
				"securityGroup": ["tester-sg"],
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
								"diskSizeGB": 30,
								"image": {
									"name": "UbuntuServer__16.04-LTS",
									"prefix": "Canonical",
									"version": "latest"
								}

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
				vmName: 'tester-vm',
                group : 'test'
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
            options.env = 'tester';
            options.params = {
                vmName: 'tester-vm',
                group : 'test'
            };
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
						},
						list: (test, cb) => {
							return cb(null, [info.networkInterface["tester-ni"]]);
						},
					},
					networkSecurityGroups: {
						get: (resourceGroupName, networkSecurityGroupName, cb) => {
							return cb(null, info.networkSecurityGroup[networkSecurityGroupName]);
						},
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						},
                        list: (test, cb) => {
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                        },
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName]);
						},
						listAll: (cb) => {
							return cb(null, [info.publicIp["tester-tester-ip"]])
						},
                        list: (test, cb) => {
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                        },
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, info.loadBalancerList);
						}
					},
					loadBalancers: {
						listAll: (cb) => {
							return cb(null, info.loadBalancerList);
						},
                        list: (test, cb) => {
                            return cb(null, []);
                        },
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
				"executeCommand": true,
				"labels": {
					"soajs.env.code": "tester",
					"soajs.layer.name": "tester",
					"soajs.network.name": "tester",
					"soajs.vm.name": "tester",
					"soajs.service.vm.location": "eastus",
					"soajs.service.vm.group": "TESTER",
					"soajs.service.vm.size": "Standard_A1"
				},
				"ports": [
					{
						"name": "ssh",
						"protocol": "Tcp",
						"access": "allow",
						"priority": 100,
						"direction": "inbound",
						"target": "22",
						"published": "*",
						"sourceAddress": "*",
						"destinationAddress": "*",
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
								"diskSizeGB": 30,
								"image": {
									"name": "UbuntuServer__16.04-LTS",
									"prefix": "Canonical",
									"version": "latest"
								}

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
				"securityGroup": ["tester-sg"],
				"layer": "tester-subnet",
				"network": "tester-vn",
				"loadBalancers": [
					{
						"addressPools": [
							{
								"name": "tester-tester-lb-backend-address-pool"
							}
						],
						"ipAddresses": [
							{
								"type": "public",
								"name": "tester-tester-ip",
								"address": "23.99.134.149"
							}
						],
						"rules": [
							{
								"config": {
									"privateIPAllocationMethod": "dynamic",
									"isPublic": true,
									"publicIpAddress": {
										"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-tester-ip",
										"group": "tester",
										"name": "tester-tester-ip"
									}
								},
								"ports": [],
								"natRules": [],
								"natPools": [],
								"name": "tester-tester-lb-ip"
							}
						],
						"name": "tester-tester-lb",
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-tester-lb",
						"region": "centralus"
					}
				]
			};
			service.executeDriver('inspectService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				delete response.tasks[0].status.ts;
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
			options.params = {
				group : 'TEST'
			};
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
						},
						list: (test ,cb) => {
							return cb(null, info.virtualMachines)
						},
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
						listAll: (cb) => {
							return cb(null, [info.networkSecurityGroup["tester-sg"]]);
						},
                        list: (test, cb) => {
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                        },
					},
					publicIPAddresses: {
						get: (resourceGroupName, ipName, cb) => {
							return cb(null, info.publicIp[ipName])
						},
						listAll: (cb) => {
							return cb(null, [info.publicIp])
						},
                        list: (test, cb) => {
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                        },
					},
					networkInterfaceLoadBalancers: {
						list: (resourceGroupName, networkInterfaceName, cb) => {
							return cb(null, []);
						}
					},
					loadBalancers: {
						listAll: ( cb) => {
							return cb(null,  info.loadBalancerList);
						},
                        list: (test, cb) => {
                            return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                        },
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
					"executeCommand": true,
					"labels": {
						"soajs.env.code": "tester",
						"soajs.layer.name": "tester",
						"soajs.network.name": "tester",
						"soajs.service.vm.location": "eastus",
						"soajs.service.vm.group": "TESTER",
						"soajs.service.vm.size": "Standard_A1",
						"soajs.vm.name": "tester"
					},
					"ports": [
						{
							"protocol": "Tcp",
							"access": "allow",
							"priority": 100,
							"name": "ssh",
							"direction": "inbound",
							"target": "22",
							"published": "*",
							"sourceAddress": "*",
							"destinationAddress": "*",
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
									"diskSizeGB": 30,
									"image": {
										"name": "UbuntuServer__16.04-LTS",
										"prefix": "Canonical",
										"version": "latest"
									}

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
					"network": "tester-vn",
					"securityGroup": ["tester-sg"],
				},
				{
					"name": "mongo",
					"id": "mongo",
					"executeCommand": true,
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
								"state": "succeeded",
							},
							"ref": {
								"os": {
									"type": "Linux",
									"diskSizeGB": 30,
									"image": {
										"name": "UbuntuServer__17.10",
										"prefix": "Canonical",
										"version": "latest"
									}

								}
							}
						}
					],
					"ip": [],
					"securityGroup": [],
				},
				{
					"name": "mysql",
					"id": "mysql",
					"executeCommand": true,
					"labels": {
						"soajs.service.vm.location": "centralus",
						"soajs.service.vm.group": "SOAJS",
						"soajs.service.vm.size": "Standard_B1ms"
					},
					"ports": [],
					"voluming": {
						"volumes": []
					},
					"securityGroup": [],
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
									"diskSizeGB": 30,
									"image": {
										"name": "UbuntuServer__17.10",
										"prefix": "Canonical",
										"version": "latest"
									}

								}
							}
						}
					],
					"ip": []
				},
				{
					"name": "windows-vm",
					"id": "windows-vm",
					"executeCommand": true,
					"labels": {
						"soajs.service.vm.location": "eastus",
						"soajs.service.vm.group": "TESTER",
						"soajs.service.vm.size": "Standard_A1"
					},
					"ports": [],
					"voluming": {
						"volumes": []
					},
					"securityGroup": [],
					"tasks": [
						{
							"id": "windows-vm",
							"name": "windows-vm",
							"status": {
								"state": "succeeded",
							},
							"ref": {
								"os": {
									"type": "Windows",
									"diskSizeGB": 30,
									"image": {
										"name": "WindowsServer__10",
										"prefix": "Microsoft",
										"version": "latest"
									}

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
				delete response[3].tasks[0].status.ts;
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
			let expectedResponse =[
				{
					"name": "1e",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/1e",
					"region": "eastus"
				},
				{
					"name": "4psa",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/4psa",
					"region": "eastus"
				},
				{
					"name": "5nine-software-inc",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/5nine-software-inc",
					"region": "eastus"
				}
			];
			service.executeDriver('listVmImagePublishers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponse);
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
			let expectedResponse = [
				{
					"name": "Ubuntu15.04Snappy",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu15.04Snappy",
					"region": "eastus"
				},
				{
					"name": "Ubuntu15.04SnappyDocker",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu15.04SnappyDocker",
					"region": "eastus"
				},
				{
					"name": "UbuntuServer",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer",
					"region": "eastus"
				},
				{
					"name": "Ubuntu_Core",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Core",
					"region": "eastus"
				},
				{
					"name": "Ubuntu_Snappy_Core",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Snappy_Core",
					"region": "eastus"
				},
				{
					"name": "Ubuntu_Snappy_Core_Docker",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Snappy_Core_Docker",
					"region": "eastus"
				}
			];
			service.executeDriver('listVmImagePublisherOffers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponse);
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
			let expectedResponse =[
				{
					"name": "16",
					"id": "/Subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/Providers/Microsoft.Compute/Locations/eastus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/Ubuntu_Core/Skus/16",
					"region": "eastus"
				}
			];
			service.executeDriver('listVmImageVersions', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponse);
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


	describe("calling executeDriver - updateVmLabels", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});

		it("Success - on board vm layer", function (done) {
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
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(null,true);
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                            },
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm'],
				setVmNameAsLabel: true,
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("Success - release vm layer", function (done) {
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
								let vmRecord = Object.assign({}, info.virtualMachines[0]);
								vmRecord.tags['soajs.onBoard'] = 'true';
								return cb(null, vmRecord);
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(null,true);
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                            },
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm'],
				release: true,
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("Fail - on board for vm layer with different operating systems", function (done) {
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
								let matchingVm = info.virtualMachines.find((oneEntry) => { return oneEntry.name === vmName; });
								return cb(null, matchingVm);
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(null,true);
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                            },
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm', 'windows-vm'],
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(error);
				assert.equal(error, 'We are unable to onBoard your VM instance because we detected a mismatch between the Operating Systems of the Virtual Machine Instance.');
				done();
			});
		});

		it("Fail - on board - error while updating vm", function (done) {
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
								let matchingVm = info.virtualMachines.find((oneEntry) => { return oneEntry.name === vmName; });
								return cb(null, matchingVm);
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(new Error("An error occured while updating vm"));
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
                            },
						},
						subnets: {
							get: (resourceGroupName, vnetName, subnetName, cb) => {
								return cb(null, info.subnets[vnetName]);
							}
						}
					});

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm'],
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(error);
				assert.deepEqual(error, {
					source: 'driver',
					value: 'An error occured while updating vm',
					code: 759,
					msg: 'Unable to update virtual machine'
				});
				done();
			});
		});

		it("Fail - release - error while updating vm", function (done) {
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
								let matchingVm = info.virtualMachines.find((oneEntry) => { return oneEntry.name === vmName; });
								return cb(null, matchingVm);
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(new Error("An error occured while updating vm"));
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm'],
				release: true,
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(error);
				assert.deepEqual(error, {
					source: 'driver',
					value: 'An error occured while updating vm',
					code: 759,
					msg: 'Unable to update virtual machine'
				});
				done();
			});
		});

		it("Fail - on board - error while inspecting vm", function (done) {
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
								return cb(new Error("An error occured while inspecting vm"));
							},
							createOrUpdate: (group, vmName, vmInfo ,cb) =>{
								return cb(null, true);
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
                            list: (test, cb) => {
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
                                return cb(null, [info.networkSecurityGroup["tester-sg"]]);
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

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				ids: ['tester-vm'],
				labels: {
					tag1: 'true',
					tag2: 'false'
				}
			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(error);
				assert.deepEqual(error, {
					source: 'driver',
				  	value: 'An error occured while inspecting vm',
				  	code: 701,
				  	msg: 'Unable to get virutal machine'
				});
				done();
			});
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

					virtualMachines: {
						get: (env, vmName, cb) => {
							return cb(null, info.virtualMachines[0]);
						},
						createOrUpdate: (group, vmName, vmInfo ,cb) =>{
							return cb(null,true);
						}
					},
				});

			info = dD();
			options = info.deployCluster;
			options.params = {
				group: 'tester',
				vmNames: ['tester-vm']

			};
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

});
