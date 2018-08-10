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
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, {
							"Vpcs": [
								{
									"CidrBlock": "172.31.0.0/16",
									"DhcpOptionsId": "dopt-5ab4fc23",
									"State": "available",
									"VpcId": "vpc-a5e482dd",
									"InstanceTenancy": "default",
									"Ipv6CidrBlockAssociationSet": [],
									"CidrBlockAssociationSet": [
										{
											"AssociationId": "vpc-cidr-assoc-ec3e5a86",
											"CidrBlock": "172.31.0.0/16",
											"CidrBlockState": {
												"State": "associated"
											}
										}
									],
									"IsDefault": true,
									"Tags": []
								}
							]
						});
					},
					describeSubnets: (params, cb) => {
						return cb(null, {
							"Subnets": [
								{
									"AvailabilityZone": "us-east-1a",
									"AvailableIpAddressCount": 4091,
									"CidrBlock": "172.31.0.0/20",
									"DefaultForAz": true,
									"MapPublicIpOnLaunch": true,
									"State": "available",
									"SubnetId": "subnet-97c7abf3",
									"VpcId": "vpc-a5e482dd",
									"AssignIpv6AddressOnCreation": false,
									"Ipv6CidrBlockAssociationSet": [],
									"Tags": []
								},
								{
									"AvailabilityZone": "us-east-1b",
									"AvailableIpAddressCount": 4090,
									"CidrBlock": "172.31.80.0/20",
									"DefaultForAz": true,
									"MapPublicIpOnLaunch": true,
									"State": "available",
									"SubnetId": "subnet-1336e83c",
									"VpcId": "vpc-a5e482dd",
									"AssignIpv6AddressOnCreation": false,
									"Ipv6CidrBlockAssociationSet": [],
									"Tags": []
								}
							
							]
						});
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
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
	});
});
