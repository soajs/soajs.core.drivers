'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const metrics = helper.requireModule('./lib/container/kubernetes/metrics.js');
const metricsWrapper = helper.requireModule("./lib/container/kubernetes/clients/metrics.js");
const deploymentWrapper = helper.requireModule("./lib/container/kubernetes/clients/deployment.js");
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
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(metricsWrapper, 'getPods')
				.yields(null, kubeData.serviceMetrics);
			
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
				.yields(null, {});
			sinon
				.stub(metricsWrapper, 'getPods')
				.yields({code: 404});
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
				.yields(null, {});
			sinon
				.stub(metricsWrapper, 'getNodes')
				.yields(null, kubeData.nodeMetrics);
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
				.yields(null, {});
			sinon
				.stub(metricsWrapper, 'getNodes')
				.yields({code: 404});
			metrics.getNodesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling getVersion", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success 1", function (done) {
			kubeData = dD();
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			metrics.getVersion({}, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success 2", function (done) {
			kubeData = dD();
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSysMetricServer);
			metrics.getVersion({}, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("err", function (done) {
			kubeData = dD();
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, null);
			metrics.getVersion({}, function (error, res) {
				done();
			});
		});
		
	});
	
});