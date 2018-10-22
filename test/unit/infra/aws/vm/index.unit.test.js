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
		it("Success 1", function (done) {
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				let expected = info.vmExpected;
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success 2", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			delete options.infra.stack;
			delete options.infra.info;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							"Reservations": [
								{
									"Groups": [],
									"Instances": [
										{
											"State": {
												"Code": 16,
												"Name": "terminated"
											}
										}
									]
								}
							]
						});
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		
		it("Success 3", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			delete options.infra.stack;
			delete options.infra.info;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, null);
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				assert.ifError(error);
				done();
			});
		});
		
		it("Success 4", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			delete options.infra.stack;
			delete options.infra.info;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							"Reservations": [
								{
									"Groups": [],
									"Instances": [
										{
											"State": {
												"Code": 16,
												"Name": "running"
											}
										}
									]
								}
							]
						});
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		
		it("Success 5", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				region: "ca-central-1"
			};
			delete options.infra.stack;
			delete options.infra.info;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							"Reservations": [
								{
									"Groups": [],
									"Instances": [
										{
											"AmiLaunchIndex": 0,
											"ImageId": "ami-5e8bb23b",
											"InstanceId": "i-0bb24a3de714f9fba",
											"InstanceType": "t2.micro",
											"KeyName": "ragheb",
											"LaunchTime": "2018-08-23T12:05:08.000Z",
											"Monitoring": {
												"State": "disabled"
											},
											"Placement": {
												"AvailabilityZone": "us-east-2c",
												"GroupName": "",
												"Tenancy": "default"
											},
											"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
											"PrivateIpAddress": "172.31.43.192",
											"ProductCodes": [],
											"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
											"PublicIpAddress": "18.218.148.78",
											"State": {
												"Code": 16,
												"Name": "running"
											},
											"StateTransitionReason": "",
											"SubnetId": "subnet-97c7abf3",
											"VpcId": "vpc-957300fc",
											"Architecture": "x86_64",
											"BlockDeviceMappings": [
												{
													"DeviceName": "/dev/sda1",
													"Ebs": {
														"AttachTime": "2018-08-23T12:05:08.000Z",
														"DeleteOnTermination": true,
														"Status": "attached",
														"VolumeId": "vol-07cd719b38c1b2b32"
													}
												}
											],
											"ClientToken": "",
											"EbsOptimized": false,
											"EnaSupport": true,
											"Hypervisor": "xen",
											"IamInstanceProfile": {
												"Arn": "arn:aws:iam::019397354664:instance-profile/ssm-role-ec2",
												"Id": "AIPAJFEAU5GHX7L5IRDKW"
											},
											"ElasticGpuAssociations": [],
											"NetworkInterfaces": [
												{
													"Association": {
														"IpOwnerId": "amazon",
														"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
														"PublicIp": "18.218.148.78"
													},
													"Attachment": {
														"AttachTime": "2018-08-23T12:05:08.000Z",
														"AttachmentId": "eni-attach-0a4b76d42a1039d18",
														"DeleteOnTermination": true,
														"DeviceIndex": 0,
														"Status": "attached"
													},
													"Description": "",
													"Groups": [
														{
															"GroupName": "launch-wizard-4",
															"GroupId": "sg-04031e85cc930b578"
														}
													],
													"Ipv6Addresses": [],
													"MacAddress": "0a:be:23:ef:cc:68",
													"NetworkInterfaceId": "eni-072868ea5a0fb76fd",
													"OwnerId": "019397354664",
													"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
													"PrivateIpAddress": "172.31.43.192",
													"PrivateIpAddresses": [
														{
															"Association": {
																"IpOwnerId": "amazon",
																"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
																"PublicIp": "18.218.148.78"
															},
															"Primary": true,
															"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
															"PrivateIpAddress": "172.31.43.192"
														}
													],
													"SourceDestCheck": true,
													"Status": "in-use",
													"SubnetId": "subnet-110ad95c",
													"VpcId": "vpc-957300fc"
												}
											],
											"RootDeviceName": "/dev/sda1",
											"RootDeviceType": "ebs",
											"SecurityGroups": [
												{
													"GroupName": "launch-wizard-4",
													"GroupId": "sg-04031e85cc930b578"
												}
											],
											"SourceDestCheck": true,
											"Tags": [
												{
													"Key": "soajs.vm.name",
													"Value": "test1"
												}
											],
											"VirtualizationType": "hvm"
										},
										{
											"AmiLaunchIndex": 0,
											"ImageId": "ami-5e8bb23b",
											"InstanceId": "i-0bb24a3de714f9fba",
											"InstanceType": "t2.micro",
											"KeyName": "ragheb",
											"LaunchTime": "2018-08-23T12:05:08.000Z",
											"Monitoring": {
												"State": "disabled"
											},
											"Placement": {
												"AvailabilityZone": "us-east-2c",
												"GroupName": "",
												"Tenancy": "default"
											},
											"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
											"PrivateIpAddress": "172.31.43.192",
											"ProductCodes": [],
											"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
											"PublicIpAddress": "18.218.148.78",
											"State": {
												"Code": 16,
												"Name": "running"
											},
											"StateTransitionReason": "",
											"SubnetId": "subnet-97c7abf3",
											"VpcId": "vpc-957300fc",
											"Architecture": "x86_64",
											"BlockDeviceMappings": [
												{
													"DeviceName": "/dev/sda1",
													"Ebs": {
														"AttachTime": "2018-08-23T12:05:08.000Z",
														"DeleteOnTermination": true,
														"Status": "attached",
														"VolumeId": "vol-07cd719b38c1b2b32"
													}
												}
											],
											"ClientToken": "",
											"EbsOptimized": false,
											"EnaSupport": true,
											"Hypervisor": "xen",
											"IamInstanceProfile": {
												"Arn": "arn:aws:iam::019397354664:instance-profile/ssm-role-ec2",
												"Id": "AIPAJFEAU5GHX7L5IRDKW"
											},
											"ElasticGpuAssociations": [],
											"NetworkInterfaces": [
												{
													"Association": {
														"IpOwnerId": "amazon",
														"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
														"PublicIp": "18.218.148.78"
													},
													"Attachment": {
														"AttachTime": "2018-08-23T12:05:08.000Z",
														"AttachmentId": "eni-attach-0a4b76d42a1039d18",
														"DeleteOnTermination": true,
														"DeviceIndex": 0,
														"Status": "attached"
													},
													"Description": "",
													"Groups": [
														{
															"GroupName": "launch-wizard-4",
															"GroupId": "sg-04031e85cc930b578"
														}
													],
													"Ipv6Addresses": [],
													"MacAddress": "0a:be:23:ef:cc:68",
													"NetworkInterfaceId": "eni-072868ea5a0fb76fd",
													"OwnerId": "019397354664",
													"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
													"PrivateIpAddress": "172.31.43.192",
													"PrivateIpAddresses": [
														{
															"Association": {
																"IpOwnerId": "amazon",
																"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
																"PublicIp": "18.218.148.78"
															},
															"Primary": true,
															"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
															"PrivateIpAddress": "172.31.43.192"
														}
													],
													"SourceDestCheck": true,
													"Status": "in-use",
													"SubnetId": "subnet-110ad95c",
													"VpcId": "vpc-957300fc"
												}
											],
											"RootDeviceName": "/dev/sda1",
											"RootDeviceType": "ebs",
											"SecurityGroups": [
												{
													"GroupName": "launch-wizard-4",
													"GroupId": "sg-04031e85cc930b578"
												}
											],
											"SourceDestCheck": true,
											"Tags": [
												{
													"Key": "Name",
													"Value": "command"
												}
											],
											"VirtualizationType": "hvm"
										}
									]
								}
							]
						});
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
						return cb(null, {
							"LoadBalancerDescriptions": [
								{
									"LoadBalancerName": "test-lb-ragheb",
									"DNSName": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
									"CanonicalHostedZoneName": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
									"CanonicalHostedZoneNameID": "Z3AADJGX6KTTL2",
									"ListenerDescriptions": [
										{
											"Listener": {
												"Protocol": "HTTP",
												"LoadBalancerPort": 80,
												"InstanceProtocol": "HTTP",
												"InstancePort": 80
											},
											"PolicyNames": []
										}
									],
									"Policies": {
										"AppCookieStickinessPolicies": [],
										"LBCookieStickinessPolicies": [],
										"OtherPolicies": []
									},
									"BackendServerDescriptions": [],
									"AvailabilityZones": [
										"us-east-1a",
										"us-east-1b",
									],
									"Subnets": [
										"subnet-97c7abf3",
										"subnet-1336e83c"
									],
									"VPCId": "vpc-957300fc",
									"Instances": [
										{
											"InstanceId": "i-0bb24a3de714f9fba"
										}
									],
									"HealthCheck": {
										"Target": "HTTP:80/index.html",
										"Interval": 30,
										"Timeout": 5,
										"UnhealthyThreshold": 2,
										"HealthyThreshold": 10
									},
									"SourceSecurityGroup": {
										"OwnerAlias": "019397354664",
										"GroupName": "default"
									},
									"SecurityGroups": [
										"sg-ca3421a3"
									],
									"CreatedTime": "2018-08-14T16:25:32.560Z",
									"Scheme": "internet-facing"
								}]
						});
					},
					describeSubnets: (params, cb) => {
						return cb(null, {
							"Subnets": [
								{
									"AvailabilityZone": "ca-central-1",
									"AvailableIpAddressCount": 4091,
									"CidrBlock": "172.31.0.0/20",
									"DefaultForAz": true,
									"MapPublicIpOnLaunch": true,
									"State": "available",
									"SubnetId": "subnet-97c7abf3",
									"VpcId": "vpc-a5e482dd",
									"AssignIpv6AddressOnCreation": false,
									"Ipv6CidrBlockAssociationSet": [],
									"Tags": [
										{
											"Key": "Name",
											"Value": "subnetId"
										}
									]
								}
							
							]
						});
					},
					describeInternetGateways: (params, cb) => {
						return cb(null, info.gateway);
					},
					listAttachedRolePolicies: (params, cb) => {
						return cb(null, info.listPolicies);
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			service.executeDriver('listServices', options, function (error, response) {
				let expected = info.vmExpected2;
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expected);
				done();
			});
		});
		
		it("error 1", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology: "vm",
				ids: ["id-1"]
			};
			delete options.infra.stack;
			delete options.infra.info;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(new Error("test"), null);
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
                    describeInternetGateways: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
                    describeSubnets: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				assert.ok(error);
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
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
					},
                    describeVpcs: (params, cb) => {
                        return cb(null, {
                            Vpcs: [
                                {
                                    Key: 'templateInputs'
                                }
                            ]
                        });
                    },
				});
			service.executeDriver('updateVmLabels', options, function (error, response) {
				assert.ok(response);
				done();
			});
		});
	});
});
