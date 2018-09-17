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
	
	describe("syncPortsFromCatalogRecipe", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success security groups", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "http",
					target: 80,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success no security groups", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "http",
					target: 80,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.vms = ["vm-1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissionsEgress": [
									{
										"FromPort": 22,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 22,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissions": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success security groups 2", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "http",
					target: 80,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissions": [
									{
										"FromPort": 80,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 80,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissionsEgress": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success security groups 3", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					target: 81,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissions": [
									{
										"FromPort": 80,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 80,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissionsEgress": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success security groups 4", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "*",
					target: 81,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissions": [
									{
										"FromPort": 80,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 80,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissionsEgress": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success security groups 5", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "icmp",
					target: 81,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissions": [
									{
										"FromPort": 80,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 80,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissionsEgress": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success security groups 5", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "icmp",
					target: 81,
					isPublished: false,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {
							"SecurityGroups": [{
								"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
								"GroupName": "launch-wizard-4",
								"IpPermissions": [
									{
										"FromPort": 80,
										"IpProtocol": "tcp",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"ToPort": 80,
										"UserIdGroupPairs": []
									}
								],
								"OwnerId": "019397354664",
								"GroupId": "sg-04031e85cc930b578",
								"IpPermissionsEgress": [
									{
										"IpProtocol": "-1",
										"IpRanges": [
											{
												"CidrIp": "0.0.0.0/0"
											}
										],
										"Ipv6Ranges": [],
										"PrefixListIds": [],
										"UserIdGroupPairs": []
									}
								],
								"Tags": [],
								"VpcId": "vpc-957300fc"
							}]
						});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success empty", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [];
			options.params.vms = ["vm-1"];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("error number 1", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "http",
					target: 80,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.vms = "vm-1";
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, null);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("error number 2", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [{
				name: "http",
				target: 80,
				isPublished: true,
				preserveClientIP: true
			}];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("error number 3", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.ports = [
				{
					name: "icmp",
					target: 81,
					isPublished: true,
					preserveClientIP: true
				}
			];
			options.params.securityGroups = ['sg-123'];
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, info.listVmInstances);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, {});
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					authorizeSecurityGroupIngress: (params, cb) => {
						return cb(null, true);
					}
				});
			service.syncPortsFromCatalogRecipe(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
	});
});
