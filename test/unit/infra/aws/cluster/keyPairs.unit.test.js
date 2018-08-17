"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

let dD = require('../../../../schemas/aws/cluster.js');
let info = {};
let options = {};

describe("testing /lib/azure/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("listKeyPairs", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeKeyPairs: (params, cb) => {
						return cb(null, info.listKeyPairsRaw);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listKeyPairs(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listKeyPairs);
				done();
			});
		});
		it("Success - no key pairs", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeKeyPairs: (params, cb) => {
						return cb(null, {"KeyPairs": []});
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listKeyPairs(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		it("Success - arrays has empty objects", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeKeyPairs: (params, cb) => {
						return cb(null, {"KeyPairs": [{},{}]});
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listKeyPairs(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		it("Fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeKeyPairs: (params, cb) => {
						return cb(new Error("List KeyPairs Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listKeyPairs(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("createKeyPair", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createKeyPair: (params, cb) => {
						return cb(null, info.createKeyPairRaw);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createKeyPair(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.createKeyPair)
				done();
			});
		});
		it("Success - response empty object", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createKeyPair: (params, cb) => {
						return cb(null, {});
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createKeyPair(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, {})
				done();
			});
		});
		it("Fail - error", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createKeyPair: (params, cb) => {
						return cb(new Error("Create Key Pair Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createKeyPair(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("updateKeyPair", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.updateKeyPair(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("deleteKeyPair", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteKeyPair: (params, cb) => {
						return cb(null, {});
					}
				})

			options.params = {
				name: 'my-key-pair',
			};

			service.deleteKeyPair(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

});
