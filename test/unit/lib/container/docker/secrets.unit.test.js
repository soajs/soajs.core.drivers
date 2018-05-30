"use strict";

const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const secrets = helper.requireModule('./lib/container/docker/secrets.js');
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/secrets.js", function () {
	
	describe("calling getSecret", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let dockerData = dD();
		let options = dockerData.deployer;
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getSecret: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.secretList[0]);
							}
						};
					}
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
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success string secret", function (done) {
			options.params = {
				"name": "test-secret-2",
				"data": {
					"test-secret-2": "{\n    \"test\": \"name\"\n}"
				},
				"type": "Opaque"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createSecret: (params, cb) => {
						return cb(null, {id: "secretID"})
					}
				});
			secrets.createSecret(options, function (error, res) {
				assert.equal(res.name, "test-secret-2");
				assert.equal(res.uid, "secretID");
				done();
			});
		});
		
		it("Success object secret", function (done) {
			options.params = {
				"name": "test-secret-2",
				"data": {
					"test-secret-2": {
						"ragheb": "test"
					}
				},
				"type": "Opaque"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createSecret: (params, cb) => {
						return cb(null, {id: "secretID"})
					}
				});
			secrets.createSecret(options, function (error, res) {
				assert.equal(res.name, "test-secret-2");
				assert.equal(res.uid, "secretID");
				done();
			});
		});
	});
	
	describe("calling deleteSecret", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let dockerData = dD();
		let options = dockerData.deployer;
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getSecret: (params) => {
						return {
							remove: (cb) => {
								return cb(null, dockerData.secretList[0]);
							}
						};
					}
				});
			options.params = {
				name: 'test-secret-1'
			};
			secrets.deleteSecret(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});