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
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});

			options.params = {
				region: 'us-east-1', /* required */
			};
			service.listNetworks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listNetwork);
				done();
			});
		});
		it("Success empty", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, null);
					}
				});

			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, [])
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(new Error("test error"));
					}
				});

			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("getNetwork", function () {
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
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});

			options.params = {
				region: 'us-east-1', /* required */
			};
			service.getNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.getNetwork);
				done();
			});
		});
		it("Success empty", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(null, null);
					}
				});

			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, [])
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeVpcs: (params, cb) => {
						return cb(new Error("test error"));
					}
				});

			options.params = {
				region: 'us-east-1'
			};
			service.listNetworks(options, function (error, response) {
				assert.ok(error);
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
						return cb(null, {Vpc: {VpcId: 1}});
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					createInternetGateway: (params, cb) => {
						return cb(null, {
							InternetGateway: {
								InternetGatewayId: "1"
							}
						});
					},
					attachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				address: '10.0.0.0/16', /* required */
				AmazonProvidedIpv6CidrBlock: false,
				DryRun: false,
				InstanceTenancy: "default",
				name: "test",
				attachInternetGateway: true
			};
			service.createNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("Success default tenancy", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createVpc: (params, cb) => {
						return cb(null, {Vpc: {VpcId: 1}});
					},
					createTags: (params, cb) => {
						return cb(null, true);
					},
					createInternetGateway: (params, cb) => {
						return cb(null, {
							InternetGateway: {
								InternetGatewayId: "1"
							}
						});
					},
					attachInternetGateway: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				address: '10.0.0.0/16', /* required */
				AmazonProvidedIpv6CidrBlock: false
			};
			service.createNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createVpc: (params, cb) => {
						return cb(new Error("test error"));
					}
				});

			options.params = {
				address: '10.0.0.0/16', /* required */
				region: 'us-east-1', /* required */
				AmazonProvidedIpv6CidrBlock: false,
				DryRun: false,
				InstanceTenancy: "default",
			};
			service.createNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("updateNetwork", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success add one address block plus modify tenancy", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					createInternetGateway: (params, cb) => {
						return cb(null, {
							InternetGateway: {
								InternetGatewayId: 1
							}
						});
					},
					attachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, {});
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					}
				});
			options.params = {
				id: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{address: '172.31.0.0/16'}, {address: '172.32.0.0/16', ipv6: true}], /* required */
				instanceTenancy: 'default',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}],
				attachInternetGateway: true

			};
			service.updateNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("Success add one address block and delete one", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, {
							"Vpcs": [
								{
									"CidrBlock": "172.31.0.0/16",
									"DhcpOptionsId": "dopt-5ab4fc23",
									"State": "available",
									"VpcId": "vpc-a5e482dd",
									"InstanceTenancy": "dedicated",
									"Ipv6CidrBlockAssociationSet": [],
									"CidrBlockAssociationSet": [
										{
											"AssociationId": "vpc-cidr-assoc-ec3e5a86",
											"CidrBlock": "172.31.0.0/16",
											"CidrBlockState": {
												"State": "associated"
											}
										},
										{
											"AssociationId": "vpc-cidr-assoc-ec3e5a86",
											"CidrBlock": "172.32.0.0/16",
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
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					},
					deleteRoute: (params, cb) => {
						return cb(null, true);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{address: '172.31.0.0/16'}, {address: '172.33.0.0/16'}], /* required */
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});

		it("fail Primary Network address can't be modified", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					}

				});
			options.params = {
				region: 'vpc-09fcf25a62b4d020f',
				addresses: [{address: '172.32.0.0/16'}], /* required */
				instanceTenancy: 'default',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
		});

		it("fail Invalid network address", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
		});

		it("fail Invalid network address empty array", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
		});

		it("fail cannot change the instance tenancy attribute", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{address: '172.31.0.0/16'}], /* required */
				instanceTenancy: 'host',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
		});

		it("fail error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(true);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{address: '172.31.0.0/16'}], /* required */
				instanceTenancy: 'host',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
		});

		it("fail no network", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					modifyVpcTenancy: (params, cb) => {
						return cb(null, true);
					},
					associateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					disassociateVpcCidrBlock: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, {Vpcs: []});
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnets);
					},
					createSubnet: (params, cb) => {
						return cb(null, true);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			options.params = {
				network: 'vpc-09fcf25a62b4d020f',
				region: 'us-east-1',
				addresses: [{address: '172.31.0.0/16'}], /* required */
				instanceTenancy: 'host',
				subnets: [{
					address: "172.31.1.0/16",
					availabilityZone: "us-east-1a"
				}]
			};
			service.updateNetwork(options, function (error) {
				assert.ok(error);
				done();
			});
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
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, info.gateway);
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					deleteSecurityGroup: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(null, true);
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, null);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, info.gateway);
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					deleteSecurityGroup: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(new Error("test error"));
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, info.gateway);
					},
					describeRouteTables: (params, cb) => {
						return cb(null, info.describeRouteTables);
					},
					createRoute: (params, cb) => {
						return cb(null, true);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					deleteSecurityGroup: (params, cb) => {
						return cb(null, true);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("fail", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(new Error("test error"));
					},
					describeVpcs: (params, cb) => {
						return cb(new Error("test error"), info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		it("fail", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteVpc: (params, cb) => {
						return cb(new Error("test error"));
					},
					describeVpcs: (params, cb) => {
						return cb(null, info.listNetworkRaw);
					},
					describeSubnets: (params, cb) => {
						return cb(new Error("test error"), info.listSubnetRaw);
					},
					deleteSubnet: (params, cb) => {
						return cb(null, true);
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					detachInternetGateway: (params, cb) => {
						return cb(null, true);
					},
					deleteInternetGateway: (params, cb) => {
						return cb(null, info.gateway);
					}
				});
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				region: 'us-east-1',
				network: "vpc-a01106c2", /* required */
			};
			service.deleteNetwork(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
});
