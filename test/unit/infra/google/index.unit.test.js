"use strict";
const helper = require("../../../helper.js");
const assert = require("assert");
const sinon = require('sinon');

const K8Api = require('kubernetes-client');
const service = helper.requireModule('./infra/google/index.js');
const googleApi = helper.requireModule('./infra/google/utils/utils.js');
const kubeDriver = helper.requireModule("./lib/container/kubernetes/index.js");
const infraUtils = helper.requireModule("./infra/utils");

let dD = require('../../../schemas/google/cluster.js');

describe("testing /lib/google/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("calling authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let info = dD();
		let options = info.deployCluster;
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			service.authenticate(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling getExtras", function () {
		let info = dD();
		let options = info.deployCluster;
		it("Success", function (done) {
			
			service.getExtras(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
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
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						}
					}
				});
			
			service.getRegions(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
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
			let attempts = 0;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					},
					'networks': {
						'insert': (params, cb) => {
							return cb(null, "operation-1234567890-1234567890")
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, []);
						},

					},
					'globalOperations': {
						'get': (params, cb) => {
							if(attempts === 0){
								attempts++;
								return cb(null, {
									status: 'PENDING'
								});
							}
							else{
								return cb(null, {
									status: 'DONE'
								});
							}
						}
					},
					'firewalls': {
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'list': (params, cb) => {
							return cb(null, []);
						},
					}
				});
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'getServerconfig': (params, cb) =>{
								return cb(null, { 'validMasterVersions': [ '1.7'] });
							},
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						},
						'locations': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			
			let options2 = dD().deployCluster;
			delete options2.infra.deployments;
			
			service.deployCluster(options2, function (error, res) {
				assert.ifError(error);
				done();
			});
		});
		
		//need a test case where get version returns the default version
		it("Success", function (done) {
			let attempts = 0;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					},
					'networks': {
						'insert': (params, cb) => {
							return cb(null, "operation-1234567890-1234567890")
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, []);
						},

					},
					'globalOperations': {
						'get': (params, cb) => {
							if(attempts === 0){
								attempts++;
								return cb(null, {
									status: 'PENDING'
								});
							}
							else{
								return cb(null, {
									status: 'DONE'
								});
							}
						}
					},
					'firewalls': {
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'list': (params, cb) => {
							return cb(null, []);
						}
					}
				});
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'getServerconfig': (params, cb) =>{
								return cb(null, { 'defaultClusterVersion': [ '1.7'] });
							},
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						},
						'locations': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			let options2 = dD().deployCluster;
			delete options2.infra.deployments;
			
			service.deployCluster(options2, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where get version returns an error
		it("Success", function (done) {
			let attempts = 0;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					},
					'networks': {
						'insert': (params, cb) => {
							return cb(null, "operation-1234567890-1234567890")
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, []);
						},
					},
					'globalOperations': {
						'get': (params, cb) => {
							if(attempts === 0){
								attempts++;
								return cb(null, {
									status: 'PENDING'
								});
							}
							else{
								return cb(null, {
									status: 'DONE'
								});
							}
						}
					},
					'firewalls': {
						'insert': (params, cb) => {
                            return cb(null, true);
                        },
                        'list': (params, cb) => {
                            return cb(null, []);
                        }
					}
				});
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'getServerconfig': (params, cb) =>{
								return cb(null, null);
							},
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						},
						'locations': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			
			let options2 = dD().deployCluster;
			delete options2.infra.deployments;
			
			service.deployCluster(options2, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		//need a test case where create cluster returns an error
		it("Success", function (done) {
			let attempts = 0;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					},
					'networks': {
						'insert': (params, cb) => {
							return cb(null, "operation-1234567890-1234567890")
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, []);
						},
					},
					'globalOperations': {
						'get': (params, cb) => {
							if(attempts === 0){
								attempts++;
								return cb(null, {
									status: 'PENDING'
								});
							}
							else{
								return cb(null, {
									status: 'DONE'
								});
							}
						}
					},
					'firewalls': {
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'list': (params, cb) => {
                            return cb(null, []);
                        }

					}
				});
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'getServerconfig': (params, cb) =>{
								return cb(null, { 'defaultClusterVersion': [ '1.7'] });
							},
							'clusters': {
								'create': (params, cb) => {
									return cb(new Error("unable to create kubernetes cluster on google!"));
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						},
						'locations': {
							'clusters': {
								'create': (params, cb) => {
									return cb(null, {name: options.infra.stack.options.operationId });
								}
							}
						}
					}
				});
			let options2 = dD().deployCluster;
			delete options2.infra.deployments;
			options2.soajs.registry.restriction =  {
				"5b044a4df920c675412f82e3" : {
					'eastus' : {
						network : 'test',
						group : ''
					}
				}
			};
			service.deployCluster(options2, function (error, res) {
				assert.ok(res);
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
		
		it("Success 1", function (done) {
			let machineip = options.registry.deployer.container.kubernetes.remote.nodes;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': {
						'secrets': {
							'get': (params, cb) => {
								return cb(null, {
									items : [
										{
											metadata: {
												name: 'default-token-1234',
												
											},
											type: 'kubernetes.io/service-account-token',
											data: {
												token: options.registry.deployer.container.kubernetes.remote.auth.token
											}
										}
									]
								});
							}
						},
						'get': (params, cb) => {
							return cb(null, {
								items : [
									{
										metadata: {
											name: 'default',
											
										}
									}
								]
							});
						}
					},
					'namespace': {
						'post': (params, cb) => {
							return cb(null, true);
						}
					}
			});
			
			let options2 = dD().deployCluster;
			options2.registry.deployer.container.kubernetes.remote.nodes = '';
			service.getDeployClusterStatus(options2, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where options2.registry.deployer.container.kubernetes.remote.nodes is not '';
		it("Success 2", function (done) {
			let machineip = options.registry.deployer.container.kubernetes.remote.nodes;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': {
						'secrets': {
							'get': (params, cb) => {
								return cb(null, {
									items : [
										{
											metadata: {
												name: 'default-token-1234',
												
											},
											type: 'kubernetes.io/service-account-token',
											data: {
												token: options.registry.deployer.container.kubernetes.remote.auth.token
											}
										}
									]
								});
							}
						},
						'get': (params, cb) => {
							return cb(null, {
								items : [
									{
										metadata: {
											name: 'default',
											
										}
									}
								]
							});
						}
					},
					'namespace': {
						'post': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			service.getDeployClusterStatus(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where v1Container().projects.zones.clusters.get is null
		it("Success 3", function (done) {
			let machineip = options.registry.deployer.container.kubernetes.remote.nodes;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, null);
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': {
						'secrets': {
							'get': (params, cb) => {
								return cb(null, {
									items : [
										{
											metadata: {
												name: 'default-token-1234',
												
											},
											type: 'kubernetes.io/service-account-token',
											data: {
												token: options.registry.deployer.container.kubernetes.remote.auth.token
											}
										}
									]
								});
							}
						},
						'get': (params, cb) => {
							return cb(null, {
								items : [
									{
										metadata: {
											name: 'default',
											
										}
									}
								]
							});
						}
					},
					'namespace': {
						'post': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			let options2 = dD().deployCluster;
			options2.registry.deployer.container.kubernetes.remote.nodes = '';
			service.getDeployClusterStatus(options2, function (error, res) {
				assert.ifError(error);
				done();
			});
		});
		
		//need a test case where v1Container().projects.zones.operations.get is pending
		it("Success 4", function (done) {
			let machineip = options.registry.deployer.container.kubernetes.remote.nodes;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						},
						'get': (params, cb) => {
							return cb (null, info.region);
						}
					},
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb(null, {
									"kind": "compute#addressList",
									"id": "projects/soajs-test-/regions/asia-northeast1/addresses",
									"items": [
										{
											"kind": "compute#address",
											"id": "2033832849827816932",
											"creationTimestamp": "2019-01-01T22:32:43.258-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-1",
											"description": "",
											"address": "35.243.98.13",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-1",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test-/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-4xc1"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "2888439983482463715",
											"creationTimestamp": "2019-01-01T22:32:44.852-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-2",
											"description": "",
											"address": "35.221.64.78",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-2",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-kfs2"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "8719778344675171157",
											"creationTimestamp": "2019-01-01T23:18:18.891-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-3",
											"description": "",
											"address": "35.243.80.107",
											"status": "RESERVED",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soaj/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-3",
											"networkTier": "PREMIUM"
										}
									],
									"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-221814/regions/asia-northeast1/addresses"
								}
							)
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'insert': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, null);
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'CREATE_CLUSTER', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': {
						'secrets': {
							'get': (params, cb) => {
								return cb(null, {
									items : [
										{
											metadata: {
												name: 'default-token-1234',
												
											},
											type: 'kubernetes.io/service-account-token',
											data: {
												token: options.registry.deployer.container.kubernetes.remote.auth.token
											}
										}
									]
								});
							}
						},
						'get': (params, cb) => {
							return cb(null, {
								items : [
									{
										metadata: {
											name: 'default',
											
										}
									}
								]
							});
						}
					},
					'namespace': {
						'post': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			let options2 = dD().deployCluster;
			options2.registry.deployer.container.kubernetes.remote.nodes = '';
			service.getDeployClusterStatus(options2, function (error, res) {
				assert.ifError(error);
				done();
			});
		});
		
	});
	
	describe("calling getDNSInfo", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': (namespaceValue) => {
						return {
							'services': {
								'get': (params, cb) => {
									return cb(null, {
										metadata: {
											name: 'nginx',
										},
										spec: {
											type: 'LoadBalancer',
											
										},
										status: {
											loadBalancer: {
												ingress: [
													{
														ip: "192.168.50.50"
													}
												]
											}
										}
									});
								}
							}
						}
					}
				});
			
			
			service.getDNSInfo(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where deployment is node port
		it("Success", function (done) {
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': (namespaceValue) => {
						return {
							'services': {
								'get': (params, cb) => {
									return cb(null, {
										metadata: {
											name: 'nginx',
										},
										spec: {
											type: 'NodePort',
											clusterIP: "192.168.50.50"
											
										}
									});
								}
							}
						}
					}
				});
			
			
			service.getDNSInfo(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where names is per service
		it("Success", function (done) {
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': (namespaceValue) => {
						return {
							'services': {
								'get': (params, cb) => {
									return cb(null, {
										metadata: {
											name: 'nginx',
										},
										spec: {
											type: 'NodePort',
											clusterIP: "192.168.50.50"
											
										}
									});
								}
							}
						}
					}
				});
			
			let options2 = dD().deployCluster;
			options2.registry.deployer.container.kubernetes.remote.namespace.perService = true;
			service.getDNSInfo(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where cluster has no data
		it("Success", function (done) {
			sinon
				.stub(K8Api, 'Core')
				.returns({
					'namespaces': (namespaceValue) => {
						return {
							'services': {
								'get': (params, cb) => {
									return cb(null, null);
								}
							}
						}
					}
				});
			
			
			service.getDNSInfo(options, function (error, res) {
				assert.ok(error);
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
		
		it("Success 1", function (done) {
			options.params.number = 2;
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'nodePools': {
									'setSize': (params, cb) => {
										return cb(null, true);
									}
								},
								'get': (params, cb) => {
									return cb(null, {currentNodeCount: 1});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						},
						'get': (params, cb) => {
							return cb (null, info.region);
						}
					},
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb(null, {
									"kind": "compute#addressList",
									"id": "projects/soajs-test-/regions/asia-northeast1/addresses",
									"items": [
										{
											"kind": "compute#address",
											"id": "2033832849827816932",
											"creationTimestamp": "2019-01-01T22:32:43.258-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-1",
											"description": "",
											"address": "35.243.98.13",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-1",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test-/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-4xc1"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "2888439983482463715",
											"creationTimestamp": "2019-01-01T22:32:44.852-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-2",
											"description": "",
											"address": "35.221.64.78",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-2",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-kfs2"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "8719778344675171157",
											"creationTimestamp": "2019-01-01T23:18:18.891-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-3",
											"description": "",
											"address": "35.243.80.107",
											"status": "RESERVED",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soaj/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-3",
											"networkTier": "PREMIUM"
										}
									],
									"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-221814/regions/asia-northeast1/addresses"
								}
							)
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'insert': (params, cb) => {
							return cb (null, true);
						}
					},
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			
			service.scaleCluster(options, function (error, res) {
				setTimeout(function () {
					assert.ifError(error);
					assert.ok(res);
					done();
				}, 1000);
				
			});
		});
		
		it("Success 2", function (done) {
			options.params.number = 1;
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'nodePools': {
									'setSize': (params, cb) => {
										return cb(null, true);
									}
								},
								'get': (params, cb) => {
									return cb(null, {currentNodeCount: 2});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						},
						'get': (params, cb) => {
							return cb (null, info.region);
						}
					},
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb(null, {
									"kind": "compute#addressList",
									"id": "projects/soajs-test-/regions/asia-northeast1/addresses",
									"items": [
										{
											"kind": "compute#address",
											"id": "2033832849827816932",
											"creationTimestamp": "2019-01-01T22:32:43.258-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-1",
											"description": "",
											"address": "35.243.98.13",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-1",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test-/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-4xc1"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "2888439983482463715",
											"creationTimestamp": "2019-01-01T22:32:44.852-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-2",
											"description": "",
											"address": "35.221.64.78",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-2",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-kfs2"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "8719778344675171157",
											"creationTimestamp": "2019-01-01T23:18:18.891-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-3",
											"description": "",
											"address": "35.243.80.107",
											"status": "RESERVED",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soaj/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-3",
											"networkTier": "PREMIUM"
										}
									],
									"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-221814/regions/asia-northeast1/addresses"
								}
							)
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'insert': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			
			service.scaleCluster(options, function (error, res) {
				setTimeout(function () {
					assert.ifError(error);
					assert.ok(res);
					done();
				}, 1000);
			});
		});
		
		it("Success 3", function (done) {
			options.params.number = 2;
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'nodePools': {
									'setSize': (params, cb) => {
										return cb(null, true);
									}
								},
								'get': (params, cb) => {
									return cb(null, {currentNodeCount: 2});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						},
						'get': (params, cb) => {
							return cb (null, info.region);
						}
					},
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb(null, {
									"kind": "compute#addressList",
									"id": "projects/soajs-test-/regions/asia-northeast1/addresses",
									"items": [
										{
											"kind": "compute#address",
											"id": "2033832849827816932",
											"creationTimestamp": "2019-01-01T22:32:43.258-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-1",
											"description": "",
											"address": "35.243.98.13",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-1",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test-/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-4xc1"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "2888439983482463715",
											"creationTimestamp": "2019-01-01T22:32:44.852-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-2",
											"description": "",
											"address": "35.221.64.78",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-2",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-kfs2"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "8719778344675171157",
											"creationTimestamp": "2019-01-01T23:18:18.891-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-3",
											"description": "",
											"address": "35.243.80.107",
											"status": "RESERVED",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soaj/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-3",
											"networkTier": "PREMIUM"
										}
									],
									"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-221814/regions/asia-northeast1/addresses"
								}
							)
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'insert': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			
			service.scaleCluster(options, function (error, res) {
				setTimeout(function () {
					assert.ifError(error);
					assert.ok(res);
					done();
				}, 1000);
			});
		});
		
		it("Success 4", function (done) {
			options.params.number = 1;
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'nodePools': {
									'setSize': (params, cb) => {
										return cb(null, true);
									}
								},
								'get': (params, cb) => {
									return cb(null, {currentNodeCount: 2});
								}
							}
						}
					}
				});
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'regions': {
						'list': (params, cb) => {
							return cb (null, {
								items: [
									info.region
								]
							});
						},
						'get': (params, cb) => {
							return cb (null, info.region);
						}
					},
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb(null, {
									"kind": "compute#addressList",
									"id": "projects/soajs-test-/regions/asia-northeast1/addresses",
									"items": [
										{
											"kind": "compute#address",
											"id": "2033832849827816932",
											"creationTimestamp": "2019-01-01T22:32:43.258-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-1",
											"description": "",
											"address": "35.243.98.13",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-1",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test-/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-4xc1"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "2888439983482463715",
											"creationTimestamp": "2019-01-01T22:32:44.852-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-2",
											"description": "",
											"address": "35.221.64.78",
											"status": "IN_USE",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-2",
											"users": [
												"https://www.googleapis.com/compute/v1/projects/soajs-test/zones/asia-northeast1-a/instances/gke-htlocalcix25ddz4ac4-template-pool-de1d2727-kfs2"
											],
											"networkTier": "PREMIUM"
										},
										{
											"kind": "compute#address",
											"id": "8719778344675171157",
											"creationTimestamp": "2019-01-01T23:18:18.891-08:00",
											"name": "gke-htlocalcix25ddz4ac4-template-pool-3",
											"description": "",
											"address": "35.243.80.107",
											"status": "RESERVED",
											"region": "https://www.googleapis.com/compute/v1/projects/soajs-test-/regions/asia-northeast1",
											"selfLink": "https://www.googleapis.com/compute/v1/projects/soaj/regions/asia-northeast1/addresses/gke-htlocalcix25ddz4ac4-template-pool-3",
											"networkTier": "PREMIUM"
										}
									],
									"selfLink": "https://www.googleapis.com/compute/v1/projects/soajs-test-221814/regions/asia-northeast1/addresses"
								}
							)
						},
						'delete': (params, cb) => {
							return cb (null, true);
						},
						'insert': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE_1', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									return cb(null, { operationType: 'SET_NODE_POOL_SIZE_1', status: 'DONE'})
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'endpoint': machineip,
										'masterAuth': options.registry.deployer.container.kubernetes.remote.auth.token
									});
								}
							}
						}
					}
				});
			
			service.scaleCluster(options, function (error, res) {
				setTimeout(function () {
					assert.ifError(error);
					assert.ok(res);
					done();
				}, 1000);
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
		
		it("Success 1", function (done) {
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, info.zones);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, info.region);
						},
						'list': (params, cb) => {
							{
								return cb (null, true);
							}
						}
					}
				});
			
			service.getCluster(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success 2", function (done) {
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, info.zones);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (new Error("not found"), null);
						},
						'list': (params, cb) => {
							{
								return cb (null, true);
							}
						}
					}
				});
			
			service.getCluster(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
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
			service.updateCluster(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
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
			
			let attempt = 0;
			sinon
				.stub(googleApi, 'v1beta1container')
				.returns({
					'projects': {
						'zones': {
							'operations': {
								'get': (params, cb) => {
									if(attempt === 0){
										attempt++;
										return cb(null, { operationType: 'DELETE_CLUSTER', status: 'PENDING'})
									}
									else{
										return cb(null, { operationType: 'DELETE_CLUSTER', status: 'DONE'})
									}
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								},
								'delete': (params, cb) => {
									return cb(null, 'operation-1234567890');
								}
							}
						},
						'locations': {
							'operations': {
								'get': (params, cb) => {
									if(attempt === 0){
										attempt++;
										return cb(null, { operationType: 'DELETE_CLUSTER', status: 'PENDING'})
									}
									else{
										return cb(null, { operationType: 'DELETE_CLUSTER', status: 'DONE'})
									}
								}
							},
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								},
								'delete': (params, cb) => {
									return cb(null, 'operation-1234567890');
								}
							}
						}
					}
				});
			let attempts = 0;
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'networks': {
						'delete': (params, cb) => {
							return cb(null, true);
						},
                        'list': (params, cb) => {
                            return cb(null, []);
                        },
					},
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					},
					'firewalls': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'delete': (params, cb) => {
							return cb (null, true);
						}
					},
					'addresses': {
						'list': (params, cb) => {
							return cb (null, {
								items: [{
									name: 'name',
									address: "12.1.1.1"
								}]
							});
						},
						'delete': (params, cb) => {
							return cb (null, true);
						}
					},
					'globalOperations': {
						'get': (params, cb) => {
							if(attempts === 0){
								attempts++;
								return cb(null, {
									status: 'PENDING'
								});
							}
							else{
								return cb(null, {
									status: 'DONE'
								});
							}
						}
					},
				});
			
			service.deleteCluster(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				setTimeout(()=> {
					done();
				}, 10);
			});
		});
	});
	
	/**
	 * Load Balancer
	 */
	describe("calling publishPorts", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'controller';
			options.params.version = '1';
			
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			delete options.params.version;
			options.params.name = 'controller';
			options.params.type = 'service';
			
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			delete options.params.version;
			delete options.params.type;
			options.params.name = 'controller';
			
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where ports is null
		it("Success", function (done) {
			
			let attempt = 0;
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [];
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where 	v1Container().projects.zones.clusters.get return null
		it("Success", function (done) {
			
			let attempt = 0;
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, null);
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		//need a test case where 	v1Container().projects.zones.clusters.get return an error
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(new Error("Something went Wrong!"));
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		//need a test case where 	v1Compute().firewalls.list return null
		it("Success", function (done) {
			
			let attempt = 0;
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		//need a test case where 	v1Compute().firewalls.list return an error
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(new Error("Something Went Wrong!"));
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		//need a test case where 	v1Compute().firewalls.insert return an error
		it("Success", function (done) {
			
			let attempt = 0;
			
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'nginx-allow-tcp-'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(new Error("Something Went Wrong!"));
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			
			service.publishPorts(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		//need a test case where v1Compute().firewalls.update is triggered
		it("Success", function (done) {
			sinon
				.stub(googleApi, 'container')
				.returns({
					'projects': {
						'zones': {
							'clusters': {
								'get': (params, cb) => {
									return cb(null, {
										'network': 'htlocal123456'
									});
								}
							}
						}
					}
				});
			
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'firewalls': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: 'htlocalabcdefgh-allow-tcp-google-nginx'
									}
								]
							});
						},
						'insert': (params, cb) => {
							return cb(null, true);
						},
						'update': (params, cb) => {
							return cb(null, true);
						}
					}
				});
			
			options.params.ports = [
				{
					published: 80
				}
			];
			options.params.name = 'nginx';
			options.params.type = 'server';
			service.publishPorts(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling createLoadBalancer", function () {
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			service.createLoadBalancer(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling updateLoadBalancer", function () {
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			service.updateLoadBalancer(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling deleteLoadBalancer", function () {
		let info = dD();
		let options = info.deployCluster;
		
		it("Success", function (done) {
			service.deleteLoadBalancer(options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
	
	/**
	 * Google Kuberentes specific functions
	 */
	describe("calling executeDriver", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let info = dD();
		let options = info.deployCluster;
		
		it("Success - listNodes", function (done) {
			sinon
				.stub(googleApi, 'compute')
				.returns({
					'instances': {
						'list': (params, cb) => {
							return cb(null, {
								items: [
									{
										name: "localmachine",
										networkInterfaces: [
											{
												accessConfigs: [
													{
														name: 'external-nat',
														natIP: '192.168.50.50'
													}
												]
											}
										]
									}
								]
							})
						}
					},
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						},
						'get': (params, cb) => {
							return cb (null, true);
						}
					},
					'regions': {
						'get': (params, cb) => {
							return cb (null, true);
						},
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			
			sinon
				.stub(kubeDriver, 'listNodes')
				.yields(null, [
					{
						hostname: 'localmachine'
					}
				]);
			delete options.params;
			service.executeDriver('listNodes', options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success - deployService", function (done) {
			sinon
				.stub(kubeDriver, 'deployService')
				.yields(null,{
					id: '123456789'
				});
			
			sinon
				.stub(kubeDriver, 'inspectService')
				.yields(null,{
					/////
				});
			
			sinon
				.stub(infraUtils, 'updateEnvSettings')
				.yields(null,{
					/////
				});
			
			service.executeDriver('deployService', options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
		
		it("Success - redeployService", function (done) {
			sinon
				.stub(kubeDriver, 'redeployService')
				.yields(null,{
					id: '123456789'
				});
			
			sinon
				.stub(kubeDriver, 'inspectService')
				.yields(null,{
					/////
				});
			
			sinon
				.stub(infraUtils, 'updateEnvSettings')
				.yields(null,{
					/////
				});
			
			service.executeDriver('redeployService', options, function (error, res) {
				assert.ifError(error);
				assert.ok(res);
				done();
			});
		});
	});
});
