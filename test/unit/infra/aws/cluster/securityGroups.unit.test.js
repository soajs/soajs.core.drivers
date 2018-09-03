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
			options.params.ports = [
				{
					direction: "inbound",
					protocol: "*",
					published: "80",
					ipv6: ["::/0"],
					source: ["0.0.0.0"]
				},
				{
					direction: "outbound",
					protocol: "-1",
					published: "80",
					range: "81",
				}];
			service.createSecurityGroup(options, function (error, response) {
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
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createSecurityGroup: (params, cb) => {
						return cb(new Error("test"), true);
					}
				});
			service.createSecurityGroup(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("updateSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
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
			options.params.ports = [
				{
					direction: "inbound",
					protocol: "*",
					published: "80",
					ipv6: ["::/0"],
					source: ["0.0.0.0"]
				},
				{
					direction: "outbound",
					protocol: "-1",
					published: "80",
					range: "81",
				}];
			service.updateSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			info.listSecurityGroups.SecurityGroups[0].IpPermissions = [];
			info.listSecurityGroups.SecurityGroups[0].IpPermissionsEgress = [];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
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
		it("error", function (done) {
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
			service.updateSecurityGroup(options, function (error) {
				assert.ok(error);
				done();
			});
		});
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSecurityGroups: (params, cb) => {
						return cb(new Error("test"), {});
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
			service.updateSecurityGroup(options, function (error) {
				assert.ok(error);
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
						return cb(null, null);
					}
				});
			service.listSecurityGroups(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
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
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSecurityGroups: (params, cb) => {
						return cb(new Error("test"), null);
					}
				});
			service.listSecurityGroups(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("getSecurityGroup", function () {
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
						return cb(null, null);
					}
				});
			service.getSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, {});
				done();
			});
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
			service.getSecurityGroup(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.securityGroupsExpected[0]);
				done();
			});
		});
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeSecurityGroups: (params, cb) => {
						return cb(new Error("test"), null);
					}
				});
			service.getSecurityGroup(options, function (error, response) {
				assert.ok(error);
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
