"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const terraform = helper.requireModule('./infra/azure/index.js');
const terraformUtils = helper.requireModule("./lib/terraform/helper.js");
let fs = require("fs");

let dD = require('../../../../schemas/azure/cluster.js');
let tD = require('../../../../schemas/azure/terrafrom.js');
let info = {};
let terraD = {};
let options = {};
describe("testing terraform  /lib/azure/index.js", function () {
	
	describe("calling deployCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {templateOutput: {}});
			sinon
				.stub(fs, 'readFile')
				.yields(null, "{}");
			terraform.deployCluster(options, function (error, response) {
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
			terraD = tD();
			options = info.deployCluster;
			options.params = terraD;
			options.params.templateState = {
				data : {}
			};
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {templateOutput: {}});
			sinon
				.stub(fs, 'readFile')
				.yields(null, "{}");
			
		
			terraform.updateCluster(options, function (error, response) {
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
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {templateOutput: {}});
			
			terraform.deleteCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});