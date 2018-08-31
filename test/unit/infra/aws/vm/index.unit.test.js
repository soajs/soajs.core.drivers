"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const config = helper.requireModule('./infra/azure/config.js');

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
			done();
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
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	
	describe("calling executeDriver - updateVmLabels", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
});
