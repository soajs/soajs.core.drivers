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

	describe("listSubnets", function () {
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
			service.listSubnets(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, [
					{
						"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/virtualNetworks/tester-vn/subnets/tester-subnet",
						"address": "10.0.2.0/24",
						"name": "tester-subnet",
					}
				]);
				done();
			});
		});
	});

	describe("createSubnet", function () {
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
						createOrUpdate: (resourceGroupName, virtualNetworkName, subnetName, params, cb) => {
							return cb(null, {
								"id": "/subscriptions/d6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-net/subnets/test-sn",
								"addressPrefix": "10.0.0.0/24",
								"provisioningState": "Succeeded",
								"name": "test-sn",
								"etag": "W/\"9db2f506-2b45-4546-ba87-9edefdddf432\""
							})
						}
					},
				});
			options.params = {
				group: "testcase",
				virtualNetworkName: "test-net",
				subnetName: "test-sn",
			};
			service.createSubnet(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, {
					"name": "test-sn",
					"id": "/subscriptions/d6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-net/subnets/test-sn",
					"address": "10.0.0.0/24"
				});
				done();
			});
		});
	});

	describe("updateSubnet", function () {
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
						createOrUpdate: (resourceGroupName, virtualNetworkName, subnetName, params, cb) => {
							return cb(null, {
								"id": "/subscriptions/d6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-net/subnets/test-sn",
								"addressPrefix": "10.0.0.0/24",
								"provisioningState": "Succeeded",
								"name": "test-sn",
								"etag": "W/\"9db2f506-2b45-4546-ba87-9edefdddf432\""
							})
						}
					},
				});
			options.params = {
				group: "testcase",
				virtualNetworkName: "test-net",
				subnetName: "test-sn",
				addressPrefix: '10.0.0.0/24',
			};
			service.updateSubnet(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, {
					"name": "test-sn",
					"id": "/subscriptions/d6/resourceGroups/testcase/providers/Microsoft.Network/virtualNetworks/test-net/subnets/test-sn",
					"address": "10.0.0.0/24"
				});
				done();
			});
		});
	});

	describe("deleteSubnet", function () {
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
						deleteMethod: (resourceGroupName, virtualNetworkName, subnetName, cb) => {
							return cb(null, true)
						}
					},
				});
			options.params = {
				group: "testcase",
				virtualNetworkName: "tester-vn",
				subnetName: "tester-sn",
			};
			service.deleteSubnet(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
