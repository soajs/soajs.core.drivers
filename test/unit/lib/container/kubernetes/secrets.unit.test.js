'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/kubernetes/secrets.js');
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
			let namespaces = () => {
				return {
					secrets: {
						get: (params, cb) => {
							return cb(null, kubeData.secret)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces}
					
				});
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
			let namespaces = () => {
				return {
					secrets: {
						post: (params, cb) => {
							return cb(null, kubeData.secret)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core : {namespaces}
				});
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
			let namespaces = () => {
				return {
					secrets: {
						post: (params, cb) => {
							return cb(null, kubeData.secret)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core : {namespaces}
				});
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
			let namespaces = () => {
				return {
					secrets: {
						delete: (params, cb) => {
							return cb(null, {status: "Success"})
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core : {namespaces}
				});
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
			let namespaces = () => {
				return {
					secrets: {
						get: (params, cb) => {
							return cb(null, kubeData.secrets)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core : {
						namespaces,
						secrets: {
							get : (cb)=>{
								return cb(null, kubeData.secrets)
							}
						}
					}
				});
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
			let namespaces = () => {
				return {
					secrets: {
						get: (cb) => {
							return cb(null, kubeData.secrets)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core : {
						namespaces,
						secrets: {
							get : (cb)=>{
								return cb(null, kubeData.secrets)
							}
						}
					}
				});
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