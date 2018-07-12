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
});
describe.skip("calling executeDriver - createLoadBalancer", function () {
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
					createOrUpdate: (resourceGroupName, cb) => {
						return cb(null, info.loadBalancers)
					}
				},
			});
		options.params = {
			resourceGroupName: "tester",
			loadBalancerName: "tester-lb"
		};
		let expectedRes = [
			{
				"name": "tester-lb",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb",
				"region": "centralus"
			}
		];
		service.executeDriver('createLoadBalancer', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual(expectedRes, response);
			done();
		});
	});
});

describe.skip("calling executeDriver - updateLoadBalancer", function () {
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
					createOrUpdate: (resourceGroupName,loadBalancerName, params,cb) => {
						return cb(null, info.loadBalancers)
					}
				},
			});
		options.params = {
			resourceGroupName: "tester",
			loadBalancerName: "tester-lb"
		};
		let expectedRes = [
			{
				"name": "tester-lb",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/loadBalancers/tester-lb",
				"region": "centralus"
			}
		];
		service.executeDriver('updateLoadBalancer', options, function (error, response) {
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
			loadBalancerName:"tester-lb",
		};
		service.executeDriver('deleteLoadBalancer', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			done();
		});
	});
});