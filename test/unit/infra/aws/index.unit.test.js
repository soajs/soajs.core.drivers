"use strict";
const fs = require('fs');
const helper = require("../../../helper.js");
const assert = require('assert');
const sinon = require('sinon');

let dD = require('../../../schemas/aws/cluster.js');
const driver = helper.requireModule('./infra/aws/index.js');
const clusterDriver = helper.requireModule('./infra/aws/cluster/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');
const dockerUtils = helper.requireModule("./lib/container/docker/utils.js");
const dockerDriver = helper.requireModule("./lib/container/docker/index.js");
const LBDriver = helper.requireModule("./infra/aws/cluster/lb.js");
const networkDriver = helper.requireModule("./infra/aws/cluster/networks.js");

//TODO : Move to seperate files (cluster, lb, s3)
describe("testing /infra/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	/**
	 * Cluster AWS Methods
	 */
	
	describe("calling authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeRegions: (params, cb) => {
						return cb(null, { data: 1 });
					}
				});
			driver.authenticate(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		
		//test case when nothing is returned
		it("Error", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeRegions: (params, cb) => {
						return cb(null, null);
					}
				});
			driver.authenticate(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		
		//test case with error returned
		it("Error", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeRegions: (params, cb) => {
						return cb(new Error("Invalid AWS configuration"));
					}
				});
			driver.authenticate(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling getExtras", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			driver.getExtras(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling deployCluster", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createStack: (params, cb) => {
						return cb(null, {stackId: options.infra.stack.id});
					},
					listObjectsV2: (params, cb) => {
						return cb(null, {
							Contents: [
								{
									Key: 'templateInputs'
								}
							]
						});
					},
					getObjectTagging: (params, cb) => {
						return cb(null, {
							TagSet: [
								{
									Key: 'type',
									Value: 'inputsAndDisplay'
								},
								{
									Key: 'description',
									Value: 'template inputs file'
								},
								{
									Key: 'template',
									Value: 'mydockerTemplate.tmpl'
								},
								{
									Key: 'technology',
									Value: 'docker'
								}
							]
						})
					},
					getObject: (params, cb) => {
						return cb(null, {
							ContentType: 'application/octet-stream',
							ContentLength: 11488,
							Body: new Buffer(JSON.stringify(
								{
									"inputs": [
										{
											"name": "workernodes",
											"label": "Worker Nodes",
											"type": "group",
											"entries": [
												{
													"name": "workernumber",
													"label": "Number",
													"type": "number",
													"value": 1,
													"placeholder": "1",
													"tooltip": "Enter how many Worker node machine(s) you want to deploy",
													"required": true,
													"fieldMsg": "Specify how many Work node machine(s) you want your deployment to include upon creation."
												}
											]
										}
									],
									"display": {
										"region": {
											"label": "Region",
											"fields": [
												{
													"name": "region",
													"label": "Region"
												},
												{
													"name": "infraCodeTemplate",
													"label": "Infra Code Template"
												}
											]
										}
									}
								}
							))
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

			sinon
				.stub(networkDriver, 'get')
				.yields(null, {"attachInternetGateway" : true, subnets : ["test1", "test2", "test3"]});
			
			clusterDriver.deployCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling getDeployClusterStatus", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeStacks: (params, cb) => {
						return cb(null, {
							Stacks: [
								{
									StackStatus: 'CREATE_COMPLETE',
									Outputs: [
										{
											OutputKey: 'DefaultDNSTarget',
											OutputValue: machineIP
										},
										{
											OutputKey: 'ElbName',
											OutputValue: options.infra.stack.options.ElbName
										},
										{
											OutputKey: 'ExternalLBSecurityGroupID',
											OutputValue: options.infra.stack.options.ExternalLBSecurityGroupID
										},
										{
											OutputKey: 'ZonesAvailable',
											OutputValue: options.infra.stack.options.ZonesAvailable.join("|")
										}
									]
								}
							]
						});
					}
				});
			
			sinon
				.stub(dockerUtils, 'getDeployer')
				.yields(null, {
					'listNetworks': (params, cb) => {
						return cb(null, [
							{
								Name: 'default'
							}
						]);
					},
					'createNetwork': (params, cb) => {
						return cb(null, true);
					}
				});
			
			let options2 = dD().deployCluster;
			delete options2.registry.deployer.container.docker.remote.nodes;
			driver.getDeployClusterStatus(options2, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		//todo: need a test case where stackstatus is delete in progress
		//todo: need a test case where Outputs is null
		//todo: need a test case where Stacks is null
		
	});
	
	describe("calling getDNSInfo", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			options.infra.stack.loadBalancers['AWS'] = {
				nginx: {
					name: '192.1068.50.50'
				}
			};
			driver.getDNSInfo(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling getRegions", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			
			driver.getRegions(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling getCluster", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
										}
									]
								}
							]
						});
					}
				});
			
			driver.getCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling updateCluster", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			clusterDriver.updateCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling deleteCluster", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					deleteStack: (params, cb) => {
						return cb(null, true);
					}
				});
			
			clusterDriver.deleteCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling scaleCluster", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			let attempts = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					updateStack: (params, cb) => {
						return cb(null, true);
					},
					describeInstances: (params, cb) => {
						if (attempts === 0) {
							return cb(null, {
								Reservations: [
									{
										Instances: [
											{
												PrivateDnsName: 'localdockermachine',
												PublicIpAddress: '192.168.50.50',
												InstanceId: '1'
											}
										]
									}
								]
							});
						}
						else {
							return cb(null, {
								Reservations: [
									{
										Instances: [
											{
												PrivateDnsName: 'localdockermachine',
												PublicIpAddress: '192.168.50.50',
												InstanceId: '1'
											},
											{
												PrivateDnsName: 'localdockermachine2',
												PublicIpAddress: '192.168.50.51',
												InstanceId: '2'
											}
										]
									}
								]
							});
						}
					},
					describeStacks: (params, cb) => {
						if (attempts === 0) {
							attempts++;
							return cb(null, {
								Stacks: [
									{
										StackStatus: 'UPDATE_IN_PROGRESS',
										Outputs: [
											{
												OutputKey: 'DefaultDNSTarget',
												OutputValue: machineIP
											},
											{
												OutputKey: 'ElbName',
												OutputValue: options.infra.stack.options.ElbName
											},
											{
												OutputKey: 'ExternalLBSecurityGroupID',
												OutputValue: options.infra.stack.options.ExternalLBSecurityGroupID
											},
											{
												OutputKey: 'ZonesAvailable',
												OutputValue: options.infra.stack.options.ZonesAvailable.join("|")
											}
										]
									}
								]
							});
						}
						else {
							return cb(null, {
								Stacks: [
									{
										StackStatus: 'UPDATE_COMPLETE',
										Outputs: [
											{
												OutputKey: 'DefaultDNSTarget',
												OutputValue: machineIP
											},
											{
												OutputKey: 'ElbName',
												OutputValue: options.infra.stack.options.ElbName
											},
											{
												OutputKey: 'ExternalLBSecurityGroupID',
												OutputValue: options.infra.stack.options.ExternalLBSecurityGroupID
											},
											{
												OutputKey: 'ZonesAvailable',
												OutputValue: options.infra.stack.options.ZonesAvailable.join("|")
											}
										]
									}
								]
							});
						}
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					deregisterInstancesFromLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
				});
			
			options.params.number = 2;
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'aws-nginx'
				}
			};
			driver.scaleCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		//todo: need a test cases where the number was 2 then it became 1
	});
	
	/**
	 * Load Balancer AWS Methods
	 */
	
	describe("calling publishPorts", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		
		it("Success", function (done) {
			
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			let attempts = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					published: 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'nginx'
				}
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			let attempts = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					published: 80,
					target: 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'nginx'
				}
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			let attempts = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									],
									HealthCheck: {
										Target: "tcp:80"
									}
								}
							]
						});
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					published: 80,
					target: 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'nginx'
				}
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					published: 80,
					target: 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			
			let machineIP = options.registry.deployer.container.docker.remote.nodes;
			let attempts = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					'target': 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'nginx'
				}
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					'published': true,
					'target': 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
				nginx: {
					name: 'nginx'
				}
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
											InstanceId: '1'
										}
									]
								}
							]
						});
					},
					registerInstancesWithLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancer: (params, cb) => {
						return cb(null, {
							DNSName: "abcd"
						});
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, {
							LoadBalancerDescriptions: [
								{
									ListenerDescriptions: [
										{
											Listener: {
												LoadBalancerPort: 80,
												InstancePort: 80
											}
										}
									]
								}
							]
						});
					},
					
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = 'nginx';
			options.params.ports = [
				{
					'published': true,
					'target': 80
				}
			];
			options.infra.stack.loadBalancers.AWS = {
			
			};
			
			driver.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	
	/**
	 * S3 AWS Methods
	 */
	
	describe("calling downloadFile", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					getObject: (params, cb) => {
						return cb(null, {
							ContentType: 'application/octet-stream',
							ContentLength: 11488,
							Body: new Buffer(JSON.stringify(
								{
									"inputs": [
										{
											"name": "workernodes",
											"label": "Worker Nodes",
											"type": "group",
											"entries": [
												{
													"name": "workernumber",
													"label": "Number",
													"type": "number",
													"value": 1,
													"placeholder": "1",
													"tooltip": "Enter how many Worker node machine(s) you want to deploy",
													"required": true,
													"fieldMsg": "Specify how many Work node machine(s) you want your deployment to include upon creation."
												}
											]
										}
									],
									"display": {
										"region": {
											"label": "Region",
											"fields": [
												{
													"name": "region",
													"label": "Region"
												},
												{
													"name": "infraCodeTemplate",
													"label": "Infra Code Template"
												}
											]
										}
									}
								}
							))
						});
					}
				});
			driver.downloadFile(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling getFiles", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listObjectsV2: (params, cb) => {
						return cb(null, {
							Contents: [
								{
									Key: 'templateInputs'
								}
							]
						});
					},
					getObjectTagging: (params, cb) => {
						return cb(null, {
							TagSet: [
								{
									Key: 'type',
									Value: 'inputsAndDisplay'
								},
								{
									Key: 'description',
									Value: 'template inputs file'
								},
								{
									Key: 'template',
									Value: 'mydockerTemplate.tmpl'
								},
								{
									Key: 'driver',
									Value: 'CloudFormation'
								}
							]
						})
					}
				});
			
			driver.getFiles(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling deleteFile", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteObject: (params, cb) => {
						return cb(null, true);
					}
				});
			driver.deleteFile(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling uploadFile", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		
		it("Success", function (done) {
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listBuckets: (params, cb) => {
						return cb(null, {
							Buckets: [
								{
									Name: 'default'
								}
							]
						});
					},
					createBucket: (params, cb) => {
						return cb(null, true);
					},
					putObject: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params.name = "testFile";
			options.params.description = "Test File Description";
			options.params.contenttype = 'application/octet-stream';
			options.params.size = 1024;
			options.params.tags = JSON.stringify({
				"type": "template"
			});
			fs.writeFileSync(__dirname + "/testFile.tmpl", "test file content", {encoding: "utf8"});
			options.params.stream = fs.createReadStream(__dirname + "/testFile.tmpl");
			
			driver.uploadFile(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				fs.unlinkSync(__dirname + "/testFile.tmpl");
				done();
			});
		});
	});
	
	/**
	 * AWS Docker functions
	 */
	
	describe("calling executeDriver", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let info = dD();
		let options = info.deployCluster;
		
		/**
		 * delete service
		 */
		it("Success delete 1", function (done) {
			
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, {
					service: {
						labels: {
							'soajs.service.name': 'nginx'
						}
					}
				});
			
			sinon
				.stub(dockerDriver, 'deleteService')
				.yields(null, true);
			
			sinon
				.stub(LBDriver, 'delete')
				.yields(null, true);
			
			options.infra.stack.loadBalancers = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()] = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()]['nginx'] = {
				name: "aws-lb-123456"
			};
			driver.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				
				done();
			});
		});
		
		it("Success delete 2", function (done) {
			
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, null);
			
			sinon
				.stub(dockerDriver, 'deleteService')
				.yields(null, true);
			
			sinon
				.stub(LBDriver, 'delete')
				.yields(null, true);
			
			options.infra.stack.loadBalancers = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()] = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()]['nginx'] = {
				name: "aws-lb-123456"
			};
			driver.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				
				done();
			});
		});
		
		it("Success delete 3", function (done) {
			
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, {
					service: {
						labels: {
							'soajs.service.name': 'nginx'
						}
					}
				});
			
			sinon
				.stub(dockerDriver, 'deleteService')
				.yields(null, true);
			
			sinon
				.stub(LBDriver, 'delete')
				.yields(null, true);
			
			options.infra.stack.loadBalancers = {};
			driver.executeDriver('deleteService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				
				done();
			});
		});
		
		/**
		 * list nodes
		 */
		it("Success list nodes", function (done) {
			
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						return cb(null, {
							Reservations: [
								{
									Instances: [
										{
											PrivateDnsName: 'localdockermachine',
											PublicIpAddress: '192.168.50.50',
										}
									]
								}
							]
						});
					}
				});
			
			sinon
				.stub(dockerDriver, 'listNodes')
				.yields(null, [
					{
						hostname: 'localdockermachine'
					}
				]);
			
			driver.executeDriver('listNodes', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		/**
		 * list services
		 */
		it("Success list services", function (done) {
			sinon
				.stub(dockerDriver, 'listServices')
				.yields(null, [
					{
						labels: {
							'soajs.service.type': 'server',
							'soajs.service.subtype': 'nginx',
							'soajs.service.name': 'nginx',
						},
						servicePortType: 'loadBalancer',
						ports: [
							{
								published: '30080',
								target: '80'
							}
						]
					}
				]);
			
			options.infra.stack.loadBalancers = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()] = {};
			options.infra.stack.loadBalancers[options.soajs.registry.code.toUpperCase()]['nginx'] = {
				name: "aws-lb-123456",
				DNSName: "192.168.50.50",
				ports: [
					{
						published: '30080',
						target: '80'
					}
				]
			};
			
			driver.executeDriver('listServices', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		
		/**
		 * deploy service
		 */
		it("Success deploy service", function (done) {
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, {
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: '30080',
							target: '80'
						}
					]
				});
			
			sinon
				.stub(dockerDriver, 'deployService')
				.yields(null, {id: '1234567890'});
			
			driver.executeDriver('deployService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		/**
		 * redeploy service
		 */
		it("Success redeploy service", function (done) {
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, {
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: '30080',
							target: '80'
						}
					]
				});
			
			sinon
				.stub(dockerDriver, 'redeployService')
				.yields(null, {id: '1234567890'});
			
			driver.executeDriver('redeployService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success redeploy service", function (done) {
			sinon
				.stub(dockerDriver, 'inspectService')
				.yields(null, {
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: '30080',
							target: '80'
						}
					]
				});
			
			sinon
				.stub(dockerDriver, 'redeployService')
				.yields(null, {id: '1234567890'});
			
			options.params.action = 'redeploy';
			driver.executeDriver('redeployService', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
});