'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const api = helper.requireModule('./lib/container/kubernetes/autoscale.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const austoScaleWrapper = helper.requireModule("./lib/container/kubernetes/clients/autoscale.js");
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/autoscale.js", function () {
	
	describe("calling getAutoscaler", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "service"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'get')
				.yields({code: 404}, kubeData.hpa);
			
			api.getAutoscaler(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "service"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'get')
				.yields(null, kubeData.hpa);
			api.getAutoscaler(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling createAutoscaler", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "service",
				"type" : 'deployment',
				"min" : 10,
				"max" : 100,
				"metrics": {
					"cpu": 1
				}
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'post')
				.yields(null, kubeData);
			api.createAutoscaler(options, function (error, res) {
				//assert.ok(error);
				done();
			});
		});
		it("fail", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "service",
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'post')
				.yields(null, kubeData);
			api.createAutoscaler(options, function (error, res) {
				//assert.ok(error);
				done();
			});
		});
	});
	
	describe("calling updateAutoscaler", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "mongo",
				"type": "deployment",
				"min": 1,
				"max": 4,
				"metrics": {
					"cpu": {
						"percent": 70
					}
				}
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'get')
				.yields(null,  kubeData.hpa);
			sinon
				.stub(austoScaleWrapper, 'put')
				.yields(null, true);
			api.updateAutoscaler(options, function (error, res) {
				//assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling deleteAutoscaler", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "service"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(austoScaleWrapper, 'delete')
				.yields(null, true);
			api.deleteAutoscaler(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});