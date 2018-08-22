"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');


describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("createSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.createSecurityGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("updateSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.updateSecurityGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});

	describe("listSecurityGroups", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.listSecurityGroups({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("deleteSecurityGroup", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.deleteSecurityGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
