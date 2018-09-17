"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("calling executeDriver - inspectService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "us-east-1"
			};
			delete options.infra.stack;
			delete options.infra.info;
			var counter = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						if (counter === 0) {
							counter++;
							return cb(null, info.listVmInstances);
						}
						else {
							return cb(null, null);
						}
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
				});
			
			service.executeDriver('inspectService', options, function (error, response) {
				let expected = info.vmExpected;
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expected[0]);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			delete options.infra.stack;
			delete options.infra.info;
			var counter = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						if (counter === 0) {
							counter++;
							return cb(null, info.listVmInstances);
						}
						else {
							return cb(null, null);
						}
					},
					describeImages: (params, cb) => {
						return cb(null, null);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, null);
					},
					describeVolumes: (params, cb) => {
						return cb(null, null);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, null);
					},
					describeSubnets: (params, cb) => {
						return cb(null, null);
					},
				});
			
			service.executeDriver('inspectService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			delete options.infra.stack;
			delete options.infra.info;
			var counter = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						if (counter === 0) {
							counter++;
							return cb(null, info.listVmInstances);
						}
						else {
							return cb(null, null);
						}
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, info.listPolicies);
					}
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				let expected = info.vmExpected;
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expected);
				done();
			});
		});
	});
	
	describe("calling executeDriver - deleteService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = "1";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					terminateInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = ["1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					terminateInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					terminateInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('deleteService', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling executeDriver - restartService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = "1";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					rebootInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('restartService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = ["1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					rebootInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('restartService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					rebootInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('restartService', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling executeDriver - redeployService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			service.executeDriver('redeployService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - powerOffVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = "1";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					stopInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('powerOffVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = ["1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					stopInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('powerOffVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					stopInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('powerOffVM', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling executeDriver - startVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = "1";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					startInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('startVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.id = ["1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					startInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('startVM', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					startInstances: (params, cb) => {
						return cb(null, true);
					}
				});
			service.executeDriver('startVM', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling executeDriver - runCommand", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							AttachedPolicies: [
								{
									PolicyName: "AmazonEC2RoleforSSM",
								},
								{
									PolicyName: "test",
								}]
						});
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							AttachedPolicies: [
								{
									PolicyName: "AmazonEC2RoleforSSM",
								},
								{
									PolicyName: "test",
								}]
						});
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("error 1", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			delete info.listVmInstances.Reservations[0].Instances[0].IamInstanceProfile;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							AttachedPolicies: [
								{
									PolicyName: "AmazonEC2RoleforSSM",
								},
								{
									PolicyName: "test",
								}]
						});
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("error 2", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(new Error("test"));
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							AttachedPolicies: [
								{
									PolicyName: "AmazonEC2RoleforSSM",
								},
								{
									PolicyName: "test",
								}]
						});
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("error 3", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							AttachedPolicies: [
								{
									PolicyName: "test",
								}]
						});
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("error 4", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(new Error("test"), true);
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("error 4", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			options.params.vmName = "name";
			options.params.command =[
				"#!/bin/bash"
			];
			options.params.args =["sudo apt-get -y update"];
			options.params.env =[
				"#!/bin/bash"
			];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, null);
					},
					sendCommand: (params, cb) => {
						return cb(null, true);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(new Error("test"), true);
					}
				});
			service.executeDriver('runCommand', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling executeDriver - getLogs", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			service.executeDriver('getLogs', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listVmSizes", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			service.executeDriver('listVmSizes', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	
	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			
			service.executeDriver('listVmImagePublishers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		})
	});
	
	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			
			service.executeDriver('listVmImagePublisherOffers', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm"
			};
			
			service.executeDriver('listVmImageVersions', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	
	describe("calling executeDriver - updateVmLabels", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			options.params.labels = {"Name": "hadi", "label": "test"};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					deleteTags: (params, cb) => {
						return cb(null, true);
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, info.listPolicies);
					}
				});
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			let vmInstances = info.listVmInstances;
			let badVm =  JSON.parse(JSON.stringify(info.listVmInstances.Reservations[0].Instances[0]));
			badVm.ImageId = "wrong";
			vmInstances.Reservations[0].Instances.push(badVm);
			options.params.labels = {"Name": "hadi", "label": "test"};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					deleteTags: (params, cb) => {
						return cb(null, true);
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, {
							"InternetGateways": [
								{
									"Attachments": [
										{
											"State": "available",
											"VpcId": "vpc-957300fc"
										}
									],
									"InternetGatewayId": "igw-0d1f93acd9d874950",
									"Tags": [
										{
											"Key": "Name",
											"Value": "ragheb"
										}
									]
								}
							]
						});
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							"ResponseMetadata": {
								"RequestId": "43c"
							},
							"AttachedPolicies": [
								{
									"PolicyName": "AmazonEC2RoleforSSM",
									"PolicyArn": "arn:aws:iam::aws:policy/service-role/ssm-role-ec2"
								}
							],
							"IsTruncated": false
						});
					}
				});
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			options.params.labels = {"Name": "hadi", "label": "test"};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					deleteTags: (params, cb) => {
						return cb(null, true);
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, {
							"InternetGateways": [
								{
									"Attachments": [
										{
											"State": "available",
											"VpcId": "vpc-957300fc"
										}
									],
									"InternetGatewayId": "igw-0d1f93acd9d874950",
									"Tags": [
										{
											"Key": "Name",
											"Value": "ragheb"
										}
									]
								}
							]
						});
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							"ResponseMetadata": {
								"RequestId": "43c"
							},
							"AttachedPolicies": [
								{
									"PolicyName": "AmazonEC2RoleforSSM",
									"PolicyArn": "arn:aws:iam::aws:policy/service-role/ssm-role-ec2"
								}
							],
							"IsTruncated": false
						});
					}
				});
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
		
		it("Success release", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1",
				release: true
			};
			options.params.labels = {"Name": "hadi", "label": "test"};
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					deleteTags: (params, cb) => {
						return cb(null, true);
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, {
							"InternetGateways": [
								{
									"Attachments": [
										{
											"State": "available",
											"VpcId": "vpc-957300fc"
										}
									],
									"InternetGatewayId": "igw-0d1f93acd9d874950",
									"Tags": [
										{
											"Key": "Name",
											"Value": "ragheb"
										}
									]
								}
							]
						});
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, {
							"ResponseMetadata": {
								"RequestId": "43c"
							},
							"AttachedPolicies": [
								{
									"PolicyName": "AmazonEC2RoleforSSM",
									"PolicyArn": "arn:aws:iam::aws:policy/service-role/ssm-role-ec2"
								}
							],
							"IsTruncated": false
						});
					}
				});
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
	});
});
