"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const terraform = helper.requireModule('./infra/azure/vm/index.js');
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
				.yields(null, "{data: 123}");
			terraform.deployCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail Terraform state file not found, rollback is not possible . ", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {
						error: "Error applying plan:\n" +
						"\n" +
						"3 error(s) occurred:\n" +
						"\n" +
						"* Resource 'aws_key_pair.hashicorp-training' does not have attribute 'key_name' for variable 'aws_key_pair.hashicorp-training.key_name'\n" +
						"* Resource 'aws_security_group.hashicorp-training' does not have attribute 'id' for variable 'aws_security_group.hashicorp-training.id'\n" +
						"* Resource 'aws_subnet.hashicorp-training' does not have attribute 'id' for variable 'aws_subnet.hashicorp-training.id'\n" +
						"\n" +
						"Terraform does not automatically rollback in the face of errors.\n" +
						"Instead, your Terraform state file has been partially updated with\n" +
						"any resources that successfully completed. Please address the error\n" +
						"above and apply again to incrementally change your infrastructure."
					});
			sinon
				.stub(fs, 'readFile')
				.yields(true, "{}");
			terraform.deployCluster(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});

		it("fail 1", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(true, {templateOutput: {}});
			sinon
				.stub(fs, 'readFile')
				.yields(true, "{}");
			terraform.deployCluster(options, function (error, response) {
				assert.ok(response);
				done();
			});
		});

		it("fail 2", function (done) {
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
				assert.ok(response);
				done();
			});
		});

		it("fail 3", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(false, {stateFileData: {}});
			sinon
				.stub(fs, 'readFile')
				.yields(true, "{\n" +
					"\t\t\t\t\t\terror: \"Error applying plan:\\n\" +\n" +
					"\t\t\t\t\t\t\"\\n\" +\n" +
					"\t\t\t\t\t\t\"3 error(s) occurred:\\n\" +\n" +
					"\t\t\t\t\t\t\"\\n\" +\n" +
					"\t\t\t\t\t\t\"* Resource 'aws_key_pair.hashicorp-training' does not have attribute 'key_name' for variable 'aws_key_pair.hashicorp-training.key_name'\\n\" +\n" +
					"\t\t\t\t\t\t\"* Resource 'aws_security_group.hashicorp-training' does not have attribute 'id' for variable 'aws_security_group.hashicorp-training.id'\\n\" +\n" +
					"\t\t\t\t\t\t\"* Resource 'aws_subnet.hashicorp-training' does not have attribute 'id' for variable 'aws_subnet.hashicorp-training.id'\\n\" +\n" +
					"\t\t\t\t\t\t\"\\n\" +\n" +
					"\t\t\t\t\t\t\"Terraform does not automatically rollback in the face of errors.\\n\" +\n" +
					"\t\t\t\t\t\t\"Instead, your Terraform state file has been partially updated with\\n\" +\n" +
					"\t\t\t\t\t\t\"any resources that successfully completed. Please address the error\\n\" +\n" +
					"\t\t\t\t\t\t\"above and apply again to incrementally change your infrastructure.\"\n" +
					"\t\t\t\t\t}");
			terraform.deployCluster(options, function (error, response) {
				assert.ok(response);
				done();
			});
		});

		it("fail 4 ", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {
					error: "Error applying plan:\n" +
					"\n" +
					"3 error(s) occurred:\n" +
					"\n" +
					"* Resource 'aws_key_pair.hashicorp-training' does not have attribute 'key_name' for variable 'aws_key_pair.hashicorp-training.key_name'\n" +
					"* Resource 'aws_security_group.hashicorp-training' does not have attribute 'id' for variable 'aws_security_group.hashicorp-training.id'\n" +
					"* Resource 'aws_subnet.hashicorp-training' does not have attribute 'id' for variable 'aws_subnet.hashicorp-training.id'\n" +
					"\n" +
					"Terraform does not automatically rollback in the face of errors.\n" +
					"Instead, your Terraform state file has been partially updated with\n" +
					"any resources that successfully completed. Please address the error\n" +
					"above and apply again to incrementally change your infrastructure."
				});
			sinon
				.stub(fs, 'readFile')
				.yields(false, JSON.stringify({data: 1}));
			terraform.deployCluster(options, function (error, response) {
				//assert.ok(error);
				done();
			});
		});
		it("fail Terraform deployment failed, rolling back ... ", function (done) {
			info = dD();
			terraD = tD();
			options = info.deployCluster;
			options.params= terraD;
			sinon
				.stub(terraformUtils, 'runChildProcess')
				.yields(null, {
					error: "Error applying plan:\n" +
					"\n" +
					"3 error(s) occurred:\n" +
					"\n" +
					"* Resource 'aws_key_pair.hashicorp-training' does not have attribute 'key_name' for variable 'aws_key_pair.hashicorp-training.key_name'\n" +
					"* Resource 'aws_security_group.hashicorp-training' does not have attribute 'id' for variable 'aws_security_group.hashicorp-training.id'\n" +
					"* Resource 'aws_subnet.hashicorp-training' does not have attribute 'id' for variable 'aws_subnet.hashicorp-training.id'\n" +
					"\n" +
					"Terraform does not automatically rollback in the face of errors.\n" +
					"Instead, your Terraform state file has been partially updated with\n" +
					"any resources that successfully completed. Please address the error\n" +
					"above and apply again to incrementally change your infrastructure."
				});
			sinon
				.stub(fs, 'readFile')
				.yields(false, "{data: 123}");
			terraform.deployCluster(options, function (error, response) {
				//assert.ok(error);
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
