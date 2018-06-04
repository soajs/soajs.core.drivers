'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/kubernetes/nodes.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/nodes.js", function () {
	
	describe("calling inspectNode", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				id: "docker-for-desktop"
			};
			options.namespace = 'test';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						node: {
							get: (params, cb)=> {
								return cb(null, kubeData.nodeList.items[0]);
							}
						}
					},
				});
			secrets.inspectNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling listNodes", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						nodes: {
							get: (params, cb)=> {
								return cb(null, kubeData.nodeList);
							}
						}
					},
				});
			secrets.listNodes(options, function (error, res) {
				assert.equal(res[0].id, "docker-for-desktop");
				done();
			});
		});
	});
	
	describe("calling removeNode", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				id: 'test'
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						node: {
							delete: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
				});
			secrets.removeNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		
	});
	
	describe("calling updateNode", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success availability active", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				availability: 'active'
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						node: {
							get: (params, cb)=>{
								return cb(null, kubeData.nodeList.items[0]);
							}
						},
						nodes: {
							put: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
				});
			secrets.updateNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success availability drain", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				availability: 'drain'
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						node: {
							get: (params, cb)=>{
								return cb(null, kubeData.nodeList.items[0]);
							}
						},
						nodes: {
							put: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
				});
			secrets.updateNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		
	});
});