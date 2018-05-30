"use strict";

const assert = require("assert");
const helper = require("../../../../helper.js");
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/utils.js", function () {
	
	describe("calling getDeployer", function () {
		let dockerData = dD();
		let options;
		
		it("Success", function (done) {
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with target host and port", function (done) {
			dockerData.deployer.params.targetHost = "domain.com";
			dockerData.deployer.params.targetPort = "443";
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with target host only", function (done) {
			delete dockerData.deployer.params.targetPort;
			dockerData.deployer.returnApiInfo = true;
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Error no registry", function (done) {
			delete dockerData.deployer.env;
			delete dockerData.deployer.soajs;
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success", function (done) {
			let dockerData = dD();
			delete dockerData.deployer.env;
			delete dockerData.deployer.params.env;
			
			dockerData.deployer.driver = "docker.local";
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("error", function (done) {
			let dockerData = dD();
			delete dockerData.deployer.deployerConfig;
			
			options = dockerData.deployer;
			utils.getDeployer(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
	describe("calling ping", function () {
		let options = {
			deployer: {
				ping: (cb)=>{
					return cb(null, true);
				}
			}
		};
		it("Success", function (done) {
			utils.ping(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});