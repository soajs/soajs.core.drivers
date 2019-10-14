"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/task.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const podWrapper = helper.requireModule("./lib/container/kubernetes/clients/pod.js");
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/task.js", function () {
	
	describe("calling inspectTask", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"taskId": "taskId"
			};
			let namespaces = () => {
				return {
					pods :{
						get: (params, cb) => {
							return cb(null, kubeData.podList[1].items[0])
						},
					}
				}
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList[1].items[0]);
			services.inspectTask(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
	});
	
	describe("calling getContainerLogs", function () {
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "testenv-mongo",
				"taskId": "mongo-7548f86496-vt8rw",
				"filter": ""
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(podWrapper, 'get')
				.yields(null, true);
			sinon
				.stub(podWrapper, 'getLogs')
				.yields(null, {});
			services.getContainerLogs(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with follow", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"id": "testenv-mongo",
				"taskId": "mongo-7548f86496-vt8rw",
				"filter": "",
				"follow": true,
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(podWrapper, 'get')
				.yields(null, true);
			sinon
				.stub(podWrapper, 'getLogs')
				.returns({});
			services.getContainerLogs(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling maintenance", function () {
		
		
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"toEnv": "TESTENV",
				"id": "testenv-controller",
				"network": "soajsnet",
				"operation": "loadProvision",
				"vmName": "controller",
				"maintenancePort": 5000
			};
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.PodListController);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					config : { url: 'https://66.66.66.66:80',
						auth: { bearer: 'eA' },
						request:
							{ strictSSL: false,
								auth: { bearer: 'eA' } } }
				});
			nock('http://66.66.66.66:80')
				.get('/api/v1/namespaces/soajs/pods/testenv-controller-6f8d5cb99f-jvs2k/exec?stdout=1&stdin=1&stderr=1&command=%2Fbin%2Fbash&command=-c&command=curl%20-s%20-X%20GET%20http%3A%2F%2Flocalhost%3A5000%2FloadProvision')
				.reply(200, {});
			services.maintenance(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});

