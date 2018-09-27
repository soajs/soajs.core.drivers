'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const metrics = helper.requireModule('./lib/container/kubernetes/metrics.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/metrics.js", function () {
	
	describe("calling manageResources", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success no version", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						po: {
							get : (cb)=> {
								cb(null, kubeData.serviceMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						}
					}
					
				});
			
			metrics.getServicesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
			
		});
		
		it("Success v2", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						po: {
							get : (cb)=> {
								cb(null, kubeData.serviceMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSysMetricServer)
							}
						}
					}
					
				});
			
			metrics.getServicesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
			
		});
		
		it("Success v1", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			kubeData.deploymentListSysMetricServer.items[0].metadata.labels.version = "v0.1.1";
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						po: {
							get : (cb)=> {
								cb(null, kubeData.serviceMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSysMetricServer)
							}
						}
					}
					
				});
			
			metrics.getServicesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
			
		});
		
		it("error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						po: {
							get : (cb)=> {
								cb({code: 404}, kubeData.serviceMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						}
					}
					
				});
			
			metrics.getServicesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
			
		});
	});
	describe("calling getNodesMetrics", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						no: {
							get : (cb)=> {
								cb(null, kubeData.nodeMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						}
					}
					
				});
			
			metrics.getNodesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success 2", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						no: {
							get : (cb)=> {
								cb(null, kubeData.nodeMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSysMetricServer)
							}
						}
					}
					
				});
			
			metrics.getNodesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					metrics: {
						no: {
							get : (cb)=> {
								cb({code: 404}, kubeData.nodeMetrics)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						}
					}
					
				});
			
			metrics.getNodesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});