"use strict";
const helper = require("../../../helper.js");
const assert = require("assert");

const awsDriver = helper.requireModule("./infra/aws/utils/utils.js");

describe("testing aws library /infra/aws/utils/utils.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	it("success ec2", (done) => {
		
		let ec2 = awsDriver.getConnector({
			api: 'ec2',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(ec2);
		done();
	});
	
	it("success cloudFormation", (done) => {
		
		let cloudFormation = awsDriver.getConnector({
			api: 'cloudFormation',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(cloudFormation);
		done();
	});
	
	it("success acm", (done) => {
		
		let acm = awsDriver.getConnector({
			api: 'acm',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(acm);
		done();
	});
	
	it("success elb", (done) => {
		
		let elb = awsDriver.getConnector({
			api: 'elb',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(elb);
		done();
	});
	
	it("success s3", (done) => {
		
		let s3 = awsDriver.getConnector({
			api: 's3',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(s3);
		done();
	});
	it("success iam", (done) => {
		
		let iam = awsDriver.getConnector({
			api: 'iam',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(iam);
		done();
	});
	it("success ssm", (done) => {
		
		let ssm = awsDriver.getConnector({
			api: 'ssm',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(ssm);
		done();
	});
	
	it("success default", (done) => {
		
		let ec2 = awsDriver.getConnector({
			api: 'iam',
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi",
			region: 'us-east-1'
		});
		
		assert.ok(ec2);
		done();
	});
	
	it("success default", (done) => {
		
		let ec2 = awsDriver.getConnector({
			keyId: '1234567890',
			secretAccessKey: "abdce-12345-efghi"
		}, {
			api:{
				region: 'us-east-1'
			}
		});
		
		assert.ok(ec2);
		done();
	});
});