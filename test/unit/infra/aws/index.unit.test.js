"use strict";
const helper = require("../../../helper.js");
const driver = helper.requireModule('./infra/aws/index.js');
const utils = helper.requireModule('./infra/aws/utils/utils.js');

const nock = require("nock");
const sinon = require('sinon');

let options = {
	params: {},
	infra: {
		api: {}
	}
};

describe("testing /infra/aws/index.js", function () {
	
	before(() => {
		
	});

	afterEach((done) => {
		sinon.restore(utils);
		done();
	});

	describe("calling authenticate", function () {
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getConnector')
				.returns({
					describeRegions: (params, cb) => {
						return cb(null, { data: 1 });
					}
				});
			driver.authenticate(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getExtras", function () {
		
		it("Success", function (done) {
			driver.getExtras(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling deployCluster", function () {
		
		it("Success", function (done) {
			driver.deployCluster(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getDeployClusterStatus", function () {
		
		it("Success", function (done) {
			driver.getDeployClusterStatus(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getDNSInfo", function () {
		
		it("Success", function (done) {
			driver.getDNSInfo(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getRegions", function () {
		
		it("Success", function (done) {
			driver.getRegions(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling scaleCluster", function () {
		
		it("Success", function (done) {
			driver.scaleCluster(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getCluster", function () {
		
		it("Success", function (done) {
			driver.getCluster(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling updateCluster", function () {
		
		it("Success", function (done) {
			driver.updateCluster(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling deleteCluster", function () {
		
		it("Success", function (done) {
			driver.deleteCluster(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling publishPorts", function () {
		
		it("Success", function (done) {
			driver.publishPorts(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling deployExternalLb", function () {
		
		it("Success", function (done) {
			driver.deployExternalLb(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling updateExternalLB", function () {
		
		it("Success", function (done) {
			driver.updateExternalLB(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling deleteExternalLB", function () {
		
		it("Success", function (done) {
			driver.deleteExternalLB(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling getFiles", function () {
		
		it("Success", function (done) {
			driver.getFiles(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling downloadFile", function () {
		
		it("Success", function (done) {
			driver.downloadFile(options, function () {
				done();
			});
		});
	});
	
	describe("calling deleteFile", function () {
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getConnector')
				.returns({
					deleteObject: (params, cb) => {
						return cb(null);
					}
				});
			driver.deleteFile(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling uploadFile", function () {
		
		it("Success", function (done) {
			driver.uploadFile(options, function () {
				done();
			});
		});
	});
	
	describe.skip("calling executeDriver", function () {
		let method = '';
		it("Success", function (done) {
			driver.executeDriver(method, options, function () {
				done();
			});
		});
	});
	
});