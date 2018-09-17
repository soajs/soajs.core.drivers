"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const terraformIndex = helper.requireModule('./infra/aws/vm/index.js');
const terraformUtils = helper.requireModule("./lib/terraform/index.js");


let dD = require('../../../../schemas/aws/cluster.js');
let info = {};
let terraD = {};
let options = {};
describe("testing terraform  /lib/aws/index.js", function () {
	
	describe("calling deployCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			options.params = terraD;
			options.params.templateState = {};
			sinon
				.stub(terraformUtils, 'apply')
				.yields(null, true);
			terraformIndex.deployCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling updateCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			options.params = terraD;
			sinon
				.stub(terraformUtils, 'apply')
				.yields(null, true);
			terraformIndex.updateCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("error", function (done) {
			info = dD();
			options = info.deployCluster;
			options.params = terraD;
			sinon
				.stub(terraformUtils, 'apply')
				.yields(null, true);
			terraformIndex.updateCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
	
	describe("calling deleteCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			options.params = terraD;
			sinon
				.stub(terraformUtils, 'destroy')
				.yields(null, true);
			terraformIndex.deleteCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});