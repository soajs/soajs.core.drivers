'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/kubernetes/namespace.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/namespace.js", function () {
	
	describe("calling createNameSpace", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let kubeData = {};
		let options = {};
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.namespace = 'test';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespace: {
							post: (params, cb)=> {
								return cb(null, true);
							}
						},
						namespaces: {
							get: (params, cb)=>{
								return cb(null, kubeData.namespaces);
							}
						}
					},
				});
			secrets.createNameSpace(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling listNameSpaces", function () {
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
						namespaces: {
							get: (params, cb)=>{
								return cb(null, kubeData.namespaces);
							}
						}
					},
				});
			secrets.listNameSpaces(options, function (error, res) {
				assert.equal(res.length, 5);
				done();
			});
		});
	});
	
	describe("calling deleteNameSpace", function () {
		
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
			options.strategy = "blata";
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
});