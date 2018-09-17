"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

let dD = require('../../../../schemas/aws/cluster.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("listRoles", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listRoles: (params, cb) => {
						return cb(null, info.listRoles);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			let expected = [
				{
					"name": "aws-elasticbeanstalk-ec2-role"
				},
				{
					"name": "ssm-role-ec2"
				}
			];
			service.listRoles(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expected);
				done();
			});
		});
		
		it("error 1", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listRoles: (params, cb) => {
						return cb(new Error("test"));
					}
				});
			let info = dD();
			let options = info.deployCluster;
			service.listRoles(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("success empty", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listRoles: (params, cb) => {
						return cb(null, null);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			service.listRoles(options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
		it("success 2", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listRoles: (params, cb) => {
						return cb(null, {
							"ResponseMetadata": {
								"RequestId": "9e1f719d-ba79-11e8-8d6d-2d5dd18438b8"
							},
							"Roles": [
								{
									"Path": "/",
									"RoleName": "eks-role",
									"RoleId": "1",
									"Arn": "arn:aws:iam::019397354664:role/eks-role",
									"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statements%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22support.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
									"CreateDate": "2018-07-27T10:17:37.000Z",
									"Description": "Allows EKS to manage clusters on your behalf."
								}
							],
							"IsTruncated": false
						});
					}
				});
			let info = dD();
			let options = info.deployCluster;
			service.listRoles(options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("createRole", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			service.createRole(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("updateRole", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			service.updateRole(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("deleteRole", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			service.deleteRole(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
