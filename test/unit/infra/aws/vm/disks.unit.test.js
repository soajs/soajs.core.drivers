"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/vm/index.js');
let dD = require('../../../../schemas/aws/cluster.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

describe("testing /lib/disks/index.j", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	describe("list", function () {
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
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
				});
			service.listDisks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVolumes: (params, cb) => {
						return cb(null, null);
					},
				});
			service.listDisks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVolumes: (params, cb) => {
						return cb(new Error("Er"));
					},
				});
			service.listDisks(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	describe("create", function () {
		afterEach((done) => {
			done();
		});
		it("Success", function (done) {
			service.createDisks({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	describe("update", function () {
		afterEach((done) => {
			done();
		});
		it("Success", function (done) {
			service.updateDisks({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	describe("delete", function () {
		afterEach((done) => {
			done();
		});
		it("Success", function (done) {
			service.deleteDisks({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});