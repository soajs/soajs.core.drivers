'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const nodes = helper.requireModule('./lib/container/kubernetes/nodes.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const nodeWrapper = helper.requireModule("./lib/container/kubernetes/clients/node.js");
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
				.yields(null, {});
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList.items[0]);
			nodes.inspectNode(options, function (error, res) {
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
				.yields(null, {});
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			nodes.listNodes(options, function (error, res) {
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
				.yields(null, {});
			sinon
				.stub(nodeWrapper, 'delete')
				.yields(null, true);
			nodes.removeNode(options, function (error, res) {
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
				.yields(null, {});
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList.items[0]);
			sinon
				.stub(nodeWrapper, 'put')
				.yields(null, true);
			nodes.updateNode(options, function (error, res) {
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
				.yields(null, {});
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList.items[0]);
			sinon
				.stub(nodeWrapper, 'put')
				.yields(null, true);
			nodes.updateNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
});