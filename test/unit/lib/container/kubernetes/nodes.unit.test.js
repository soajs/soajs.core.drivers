'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/kubernetes/nodes.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');

describe("testing /lib/container/kubernetes/nodes.js", function () {
	
	describe("calling inspectNode", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let kubeData;
		let options;
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
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
		let kubeData;
		let options;
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
				// assert.equal(res.name, "test-secret-2");
				// assert.equal(res.uid, "secretID");
				console.log(error)
				console.log(res)
				done();
			});
		});
	});
	
	describe.skip("calling removeNode", function () {
		
		let kubeData;
		let options;
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deleteSecret;
			options.namespace = 'test';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: {
							delete: (params, cb)=>{
								return cb(null, kubeData.namespaces);
							}
						}
					},
				});
			secrets.deleteNameSpace(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		
	});
	
	
	describe.skip("calling updateNode", function () {
		
		let kubeData;
		let options;
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deleteSecret;
			options.namespace = 'test';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: {
							delete: (params, cb)=>{
								return cb(null, kubeData.namespaces);
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