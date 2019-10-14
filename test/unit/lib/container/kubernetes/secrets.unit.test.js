'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/kubernetes/secrets.js');
const secretWrapper = helper.requireModule("./lib/container/kubernetes/clients/secret.js");
const namespaceWrapper = helper.requireModule("./lib/container/kubernetes/clients/namespace.js");
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/secrets.js", function () {
	
	describe("calling getSecret", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secret);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			options.params = {
				name: 'test-secret-1'
			};
			secrets.getSecret(options, function (error, res) {
				assert.equal(res.name, 'test-secret-1');
				done();
			});
		});
	});
	
	describe("calling createSecret", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success 1 secret", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"name": "test-secret-1",
				"data": {
					"test-secret-1": "123456"
				},
				"type": "Opaque"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'post')
				.yields(null,  kubeData.secret);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.createSecret(options, function (error, res) {
				assert.equal(res.name, "test-secret-1");
				done();
			});
		});

		it("Success 2 secrets", function (done) {
			options.params = {
				"name": "test-secret-1",
				"data": {
					"test-secret-1": "123456",
					"test-secret-12": "7890",
				},
				"type": "Opaque"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'post')
				.yields(null, kubeData.secret);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.createSecret(options, function (error, res) {
				assert.equal(res.name, 'test-secret-1');
				done();
			});
		});
		
		it("Success 3 secrets", function (done) {
			options.params = {
				"name": "test-secret-1",
				"data": {
					"test-secret-1": "123456",
				},
				"type": "kubernetes.io/dockercfg"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'post')
				.yields(null, kubeData.secret);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.createSecret(options, function (error, res) {
				assert.equal(res.name, 'test-secret-1');
				done();
			});
		});
	});
	
	describe("calling deleteSecret", function () {
		
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
				"name": "test-secret-1"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'delete')
				.yields(null, {status: "Success"});
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.deleteSecret(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling listSecret", function () {
		
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
				.stub(secretWrapper, 'get')
				.yields(null,  kubeData.secrets);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.listSecrets(options, function (error, res) {
				assert.ok(res);
				assert.equal(res.length, 2);
				assert.equal(res[0].name, 'default-token-mh6vv');
				assert.equal(res[1].name, 'test-secret-1');
				done();
			});
		});
		it("Success with namespace", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"name": "test-secret-1"
			};
			options.params.namespace = 'soajs';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(secretWrapper, 'get')
				.yields(null,  kubeData.secrets);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			secrets.listSecrets(options, function (error, res) {
				assert.ok(res);
				assert.equal(res.length, 2);
				assert.equal(res[0].name, 'default-token-mh6vv');
				assert.equal(res[1].name, 'test-secret-1');
				done();
			});
		});
	});
});