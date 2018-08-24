"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("calling executeDriver - inspectService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params = {
				technology : "vm"
			};
			delete options.infra.stack;
			delete options.infra.info;
			var counter = 0;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeInstances: (params, cb) => {
						if (counter === 0){
							counter ++;
							return cb(null, info.listVmInstances);
						}
						else {
							return cb(null, null);
						}
					},
					describeImages: (params, cb) => {
						return cb(null, info.listImages);
					},
					describeSecurityGroups: (params, cb) => {
						return cb(null, info.listSecurityGroups);
					},
					describeVolumes: (params, cb) => {
						return cb(null, info.listDisks);
					},
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listlb);
					},
				});
			
			service.executeDriver('listServices', options, function (error, response) {
				let expected = info.vmExpected;
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expected);
				done();
			});
		});
	});
	
	describe("calling executeDriver - deleteService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - restartService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - redeployService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - powerOffVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - startVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmSizes", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - runCommand", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - getLogs", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	
	describe("calling executeDriver - updateVmLabels", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
});
