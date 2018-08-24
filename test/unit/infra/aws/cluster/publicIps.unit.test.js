"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

let dD = require('../../../../schemas/aws/cluster.js');
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
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeAddresses: (params, cb) => {
						return cb(null, info.listIpsRaw);
					}
				});

			options.params = {
				region: 'us-east-2',
			};

			service.listPublicIps(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listIps);
				done();
			});
		});
		it("Success - empty response", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeAddresses: (params, cb) => {
						return cb(null, {Addresses:[]});
					}
				})

			options.params = {
				region: 'us-east-1',
			};

			service.listPublicIps(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		it("Fail - error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeAddresses: (params, cb) => {
						return cb(new Error("List IPs Error"));
					}
				});

			options.params = {
				region: 'us-east-1'
			};
			service.listPublicIps(options, function (error, response) {
				assert.ok(error);
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
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					allocateAddress: (params, cb) => {
						return cb(null, info.createPublicIpResponse);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createPublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					allocateAddress: (params, cb) => {
						return cb(new Error("Create IP Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createPublicIp(options, function (error, response) {
				assert.ok(error);
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
			service.updatePublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
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
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					releaseAddress: (params, cb) => {
						return cb(null, {});
					}
				})

			options.params = {
				id: 'eipalloc-0aa52c83a0ee8196a',
			};

			service.deletePublicIp(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					releaseAddress: (params, cb) => {
						return cb(new Error("Delete Public IP Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.deletePublicIp(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

});
