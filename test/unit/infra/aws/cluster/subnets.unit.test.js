"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

let dD = require('../../../../schemas/aws/cluster.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("listSubnets", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				network: 'vpc-a5e482dd', /* required */
			};
			service.listSubnets(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listSubnets);
				done();
			});
		});
		
		it("Success empty", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSubnets: (params, cb) => {
						return cb(null, null);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				network: 'vpc-a5e482dd', /* required */
			};
			service.listSubnets(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		it("fail", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSubnets: (params, cb) => {
						return cb(new Error("test err"));
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				network: 'vpc-a5e482dd', /* required */
			};
			service.listSubnets(options, function (error, response) {
				assert.ok(error);
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
			done();
		});
	});

	describe("updateSubnet", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("deleteSubnet", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
});
