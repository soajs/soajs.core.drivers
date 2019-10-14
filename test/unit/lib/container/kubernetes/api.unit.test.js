'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const api = helper.requireModule('./lib/container/kubernetes/api.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const heapsterD = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/deployment.js');
const heapsterS = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/service.js');
const heapsterSA = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/serviceAccount.js');
const deploymentWrapper = helper.requireModule("./lib/container/kubernetes/clients/deployment.js");
const serviceWrapper = helper.requireModule("./lib/container/kubernetes/clients/service.js");
const ServiceAccountWrapper = helper.requireModule("./lib/container/kubernetes/clients/serviceaccount.js");
const apiServiceWrapper = helper.requireModule("./lib/container/kubernetes/clients/apiservice.js");
const roleBindingWrapper = helper.requireModule("./lib/container/kubernetes/clients/rolebinding.js");
const clusterRoleBindingWrapper = helper.requireModule("./lib/container/kubernetes/clients/clusterrolebinding.js");
const clusterRoleWrapper = helper.requireModule("./lib/container/kubernetes/clients/clusterrole.js");
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/manageResources.js", function () {
	describe("calling manageResources", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success post", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "metrics-server"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(ServiceAccountWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(apiServiceWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(roleBindingWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(clusterRoleBindingWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(clusterRoleWrapper, 'post')
				.yields(null, {});
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields({code: 404});
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, {});
			sinon
				.stub(ServiceAccountWrapper, 'post')
				.yields(null, {});
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with templates", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			delete heapsterD.metadata.namespace;
			delete heapsterS.metadata.namespace;
			delete heapsterSA.metadata.namespace;
			options.params = {
				"action": "get",
				"resource": "heapster",
				"templates": [heapsterD, heapsterS, heapsterSA]
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(ServiceAccountWrapper, 'get')
				.yields(null, {});
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Error delete", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "delete",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'delete')
				.yields({code: 409}, {});
			sinon
				.stub(serviceWrapper, 'delete')
				.yields(null, {});
			sinon
				.stub(ServiceAccountWrapper, 'delete')
				.yields(null, {});
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});