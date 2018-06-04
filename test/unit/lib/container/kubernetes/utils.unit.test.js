"use strict";

const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/utils.js", function () {
	
	describe("calling buildNameSpace", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success id", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.deployerConfig.namespace.perService = true;
			options.params = {
				id: "1"
			};
			let res = services.buildNameSpace(options);
			assert.ok(res);
			done();
		});
		
		it("Success serviceName", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.deployerConfig.namespace.perService = true;
			options.params = {
				serviceName: "1",
				env: "test"
			};
			let res = services.buildNameSpace(options);
			assert.ok(res);
			done();
		});
		
	});
	
	describe("calling getDeployer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			
			services.getDeployer(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
	});
	
});