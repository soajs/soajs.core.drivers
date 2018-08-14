"use strict";
const helper = require("../../../../helper");
const assert = require("assert");

const service = helper.requireModule('./infra/aws/index.js');


describe("testing /lib/aws/index.js", function () {
	
	describe("listGroups", function () {
		it("Success", function (done) {
			service.listGroups({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, 'N/A');
				done();
			});
		});
	});
	
	describe("createGroup", function () {
		it("Success", function (done) {
			service.createGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, 'N/A');
				done();
			});
		});
	});
	
	describe("updateGroup", function () {
		it("Success", function (done) {
			service.updateGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, 'N/A');
				done();
			});
		});
	});
	
	describe("deleteGroup", function () {
		it("Success", function (done) {
			service.deleteGroup({}, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, 'N/A');
				done();
			});
		});
	});
});
