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

	describe("listCertificates", function () {
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
					listCertificates: (params, cb) => {
						return cb(null, info.listCertificatesRaw);
					},
					describeCertificate: (params, cb) => {
						return cb(null, info.describeCertificateRaw);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listCertificates(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listCertificates);
				done();
			});
		});
		it("Success - no certificates", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listCertificates: (params, cb) => {
						return cb(null, info.listCertificatesRaw2);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listCertificates(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, []);
				done();
			});
		});
		it("Success - empty describe", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listCertificates: (params, cb) => {
						return cb(null, info.listCertificatesRaw);
					},
					describeCertificate: (params, cb) => {
						return cb(null, info.describeCertificateRaw2);
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listCertificates(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, [{ "details": {}, "region": "us-east-2"}]);
				done();
			});
		});
		it("Fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					listCertificates: (params, cb) => {
						return cb(new Error("List Certificates Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.listCertificates(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	// TODO: complete this test section it is incomplete
	describe.skip("createCertificate", function () {
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
					requestCertificate: (params, cb) => {
						return cb(null, {}); //TODO: fill response
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createCertificate(options, function (error, response) {
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
					requestCertificate: (params, cb) => {
						return cb(null, {});
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createCertificate(options, function (error, response) {
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
					requestCertificate: (params, cb) => {
						return cb(new Error("Create Key Pair Error"));
					}
				})

			options.params = {
				region: 'us-east-2',
			};

			service.createCertificate(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("updateCertificate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.updateCertificate(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("deleteCertificate", function () {
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
					deleteCertificate: (params, cb) => {
						return cb(null, {});
					}
				})

			options.params = {
				id: 'my-key-pair',
			};

			service.deleteCertificate(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

});