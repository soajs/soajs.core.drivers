"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

let dD = require('../../../../schemas/aws/cluster.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("listNetworks", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					}
				});
			
			options.params = {
				region: 'us-east-1', /* required */
			};
			service.listNetworks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listNetwork)
				done();
			});
		});
		it("Success empty", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, null);
					}
				});
			
			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, [])
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(new Error("test error"));
					}
				});
			
			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("createNetwork", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createVpc: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				address: '10.0.0.0/16', /* required */
				AmazonProvidedIpv6CidrBlock: false,
				DryRun: false,
				InstanceTenancy: "default",
			};
			service.createNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createVpc: (params, cb) => {
						return cb(new Error("test error"));
					}
				});
			
			options.params = {
				address: '10.0.0.0/16', /* required */
				region: 'us-east-1', /* required */
				AmazonProvidedIpv6CidrBlock: false,
				DryRun: false,
				InstanceTenancy: "default",
			};
			service.createNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("updateNetwork", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("deleteNetwork", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(new Error("test error"));
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
});
