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

	describe("deleteGroup", function () {
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
			service.deleteGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("listGroups", function () {
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
						list: (cb) => {
							return cb(null, info.Groups)
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			let expected = [
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/dashboard",
					"name": "dashboard"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/demo",
					"name": "demo"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/dynamic-template",
					"name": "dynamic-template"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/memsql",
					"name": "memsql"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/mongo",
					"name": "mongo"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/ragheb",
					"name": "ragheb"
				},
				{
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/soajs",
					"name": "soajs"
				}
			];

			service.listGroups(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expected, response);
				done();
			});
		});
	});

	describe("createGroup", function () {
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
						createOrUpdate: (group, params, cb) => {
							return cb(null, {
								id: '/subscriptions/d/resourceGroups/testcase',
								name: 'testcase',
								properties: {provisioningState: 'Succeeded'},
								location: 'eastus',
								tags: {test: "case"}
							})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			let expected = {
				id: '/subscriptions/d/resourceGroups/testcase',
				name: 'testcase',
				region: 'eastus',
				labels: {
					test: "case"
				}
			};
			options.params = {
				group: "testcase",
				region: 'eastus',
				tags: {test: "case"}
			};

			service.createGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expected, response);
				done();
			});
		});
	});

	describe("updateGroup", function () {
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
						createOrUpdate: (group, params, cb) => {
							return cb(null, {
								id: '/subscriptions/d/resourceGroups/testcase',
								name: 'testcase',
								properties: {provisioningState: 'Succeeded'},
								location: 'eastus',
								tags: {test: "case"}
							})
						}
					},
				});
			info = dD();
			options = info.deployCluster;
			let expected = {
				id: '/subscriptions/d/resourceGroups/testcase',
				name: 'testcase',
				region: 'eastus',
				labels: {
					test: "case"
				}
			};
			options.params = {
				group: "testcase",
				region: 'eastus',
				tags: {test: "case"}
			};

			service.updateGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(expected, response);
				done();
			});
		});
	});

});
