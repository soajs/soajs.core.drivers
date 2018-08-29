"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');
const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');


describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("createSecurityGroup", function () {
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
					createSecurityGroup: (params, cb) => {
						return cb(null, true);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					},
					authorizeSecurityGroupEgress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.createSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("updateSecurityGroup", function () {
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
					describeSecurityGroups: (params, cb) => {
						return cb(null, {});
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					},
					authorizeSecurityGroupEgress: (params, cb) => {
						return cb(null, true);
					},
					revokeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					},
					revokeSecurityGroupEgress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.updateSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("listSecurityGroups", function () {
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
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					}
				});
			service.listSecurityGroups(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.securityGroupsExpected);
				done();
			});
		});
	});
	
	describe("deleteSecurityGroup", function () {
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
					deleteSecurityGroup: (params, cb) => {
						return cb(null, true);
					}
				});
			service.deleteSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
