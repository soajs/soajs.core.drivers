"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/services.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const serviceWrapper = helper.requireModule("./lib/container/kubernetes/clients/service.js");
const deploymentWrapper = helper.requireModule("./lib/container/kubernetes/clients/deployment.js");
const daemonsetWrapper = helper.requireModule("./lib/container/kubernetes/clients/daemonset.js");
const autoScaleWrapper = helper.requireModule("./lib/container/kubernetes/clients/autoscale.js");
const namespaceWrapper = helper.requireModule("./lib/container/kubernetes/clients/namespace.js");
const nodeWrapper = helper.requireModule("./lib/container/kubernetes/clients/node.js");
const podWrapper = helper.requireModule("./lib/container/kubernetes/clients/pod.js");
const secretWrapper = helper.requireModule("./lib/container/kubernetes/clients/secret.js");
const cronJobWrapper = helper.requireModule("./lib/container/kubernetes/clients/cronjob.js");
const serviceAccountWrapper = helper.requireModule("./lib/container/kubernetes/clients/serviceaccount.js");
const replicaWrapper = helper.requireModule("./lib/container/kubernetes/clients/replicaset.js");
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/services.js", function () {
	
	describe("calling listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"env": "testenv"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetListSys);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 8);
				done();
			});
		});
		
		it("Success with custom", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"env": "testenv",
				"custom": true
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetListSys);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 8);
				done();
			});
		});
		
		it("Success with no deployment", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"env": "testenv"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 1);
				done();
			});
		});
		
	});
	
	describe("calling deployService", function () {
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {

			done();
		});
		it("Success deploy mongo deployment", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.deployServiceParams;
			let response = {
				name: '3.4.10',
				full_size: 131854682,
				images:
					[{
						size: 2926599685,
						architecture: 'amd64',
						variant: null,
						features: null,
						os: 'windows',
						os_version: '10.0.16299.125',
						os_features: null
					},
						{
							size: 5441722307,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'windows',
							os_version: '10.0.14393.2007',
							os_features: null
						},
						{
							size: 131854682,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'linux',
							os_version: null,
							os_features: null
						}],
				id: 17096438,
				repository: 21412,
				creator: 1156886,
				last_updater: 1156886,
				last_updated: '2018-01-05T04:53:33.261088Z',
				image_id: null,
				v2: true
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/library/mongo/tags/3.4.10')
				.reply(200, response);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.deployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success deploy mongo daemonset", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.deployServiceParams;
			options.params.inputmaskData.deployConfig.replication.mode ='daemonset';
			delete options.params.inputmaskData.autoScale;
			let response = {
				name: '3.4.10',
				full_size: 131854682,
				images:
					[{
						size: 2926599685,
						architecture: 'amd64',
						variant: null,
						features: null,
						os: 'windows',
						os_version: '10.0.16299.125',
						os_features: null
					},
						{
							size: 5441722307,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'windows',
							os_version: '10.0.14393.2007',
							os_features: null
						},
						{
							size: 131854682,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'linux',
							os_version: null,
							os_features: null
						}],
				id: 17096438,
				repository: 21412,
				creator: 1156886,
				last_updater: 1156886,
				last_updated: '2018-01-05T04:53:33.261088Z',
				image_id: null,
				v2: true
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/library/mongo/tags/3.4.10')
				.reply(200, response);
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(daemonsetWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.deployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success deploy mongo no service", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.deployServiceParams;
			options.params.serviceAccount = [{
				metadata: {
					name: "test"
				}
			}];
			options.params.catalog.recipe.deployOptions.ports = [];
			let response = {
				name: '3.4.10',
				full_size: 131854682,
				images:
					[{
						size: 2926599685,
						architecture: 'amd64',
						variant: null,
						features: null,
						os: 'windows',
						os_version: '10.0.16299.125',
						os_features: null
					},
						{
							size: 5441722307,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'windows',
							os_version: '10.0.14393.2007',
							os_features: null
						},
						{
							size: 131854682,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'linux',
							os_version: null,
							os_features: null
						}],
				id: 17096438,
				repository: 21412,
				creator: 1156886,
				last_updater: 1156886,
				last_updated: '2018-01-05T04:53:33.261088Z',
				image_id: null,
				v2: true
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/library/mongo/tags/3.4.10')
				.reply(200, response);
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(daemonsetWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.deployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});

	describe("calling redeployService", function () {

		
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			let response = {
				name: '3.4.10',
				full_size: 131854682,
				images:
					[{
						size: 2926599685,
						architecture: 'amd64',
						variant: null,
						features: null,
						os: 'windows',
						os_version: '10.0.16299.125',
						os_features: null
					},
						{
							size: 5441722307,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'windows',
							os_version: '10.0.14393.2007',
							os_features: null
						},
						{
							size: 131854682,
							architecture: 'amd64',
							variant: null,
							features: null,
							os: 'linux',
							os_version: null,
							os_features: null
						}],
				id: 17096438,
				repository: 21412,
				creator: 1156886,
				last_updater: 1156886,
				last_updated: '2018-01-05T04:53:33.261088Z',
				image_id: null,
				v2: true
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/library/mongo/tags/3.4.10')
				.reply(200, response);
			done();
		});
		it("Success with action 'rebuild' mongo no service list", function (done) {
			let kubeData = dD();
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.redepolyServiceParams;
			options.params.action = kubeData.redepolyServiceParams.inputmaskData.action;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(serviceWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(daemonsetWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(autoScaleWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.redeployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with action 'rebuild' mongo", function (done) {
			let kubeData = dD();
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.redepolyServiceParams;
			options.params.action = kubeData.redepolyServiceParams.inputmaskData.action;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(serviceWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(daemonsetWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(autoScaleWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.redeployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with action 'redeploy' mongo", function (done) {
			let kubeData = dD();
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.redepolyServiceParams;
			kubeData.redepolyServiceParams.inputmaskData.action = 'redeploy';
			options.params.action = 'redeploy';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(serviceWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(daemonsetWrapper, 'post')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(autoScaleWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(namespaceWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			services.redeployService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});

	describe("calling scaleService", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				"id": "9xabk0pf9wdfdul8vh913jvqs",
				"scale": 2
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'post')
				.yields(null, true);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'patch')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			services.scaleService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});

	describe("calling findService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "controller",
				version : "1"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetListSys);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null, kubeData.nodeList);
			services.findService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});

		it.skip("Success", function (done) {

			//increase branches
			done();
		});
	});
	
	describe("calling listKubeServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			services.listKubeServices(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
	});

	describe("calling  deleteService", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				"id": "9xabk0pf9wdfdul8vh913jvqs"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(serviceWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'patch')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetNginx);
			sinon
				.stub(daemonsetWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(podWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(cronJobWrapper, 'delete')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'delete')
				.yields(null, null);
			sinon
				.stub(replicaWrapper, 'delete')
				.yields(null, null);
			services.deleteService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Succes nos services", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				"id": "9xabk0pf9wdfdul8vh913jvqs"
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, []);
			sinon
				.stub(serviceWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'patch')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(deploymentWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(deploymentWrapper, 'put')
				.yields(null, true);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetNginx);
			sinon
				.stub(daemonsetWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(autoScaleWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(podWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(cronJobWrapper, 'delete')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'delete')
				.yields(null, null);
			sinon
				.stub(replicaWrapper, 'delete')
				.yields(null, null);
			services.deleteService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});

	describe("calling  getLatestVersion", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});

		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "kube-proxy"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentListSys);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetListSys);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			services.getLatestVersion(options, function (error, res) {
				assert.equal(res, "0");
				done();
			});
		});
	});
	
	describe("calling  inspectService", function () {
		
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success version", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "mongo-service"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			sinon
				.stub(secretWrapper, 'get')
				.yields(null, kubeData.secrets);
			sinon
				.stub(deploymentWrapper, 'get')
				.yields(null, kubeData.deploymentMongo);
			sinon
				.stub(daemonsetWrapper, 'get')
				.yields(null, kubeData.daemonsetNginx);
			sinon
				.stub(autoScaleWrapper, 'get')
				.yields(null, {});
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			sinon
				.stub(podWrapper, 'get')
				.yields(null, kubeData.podList);
			sinon
				.stub(cronJobWrapper, 'get')
				.yields(null, null);
			sinon
				.stub(serviceAccountWrapper, 'post')
				.yields(null, null);
			sinon
				.stub(nodeWrapper, 'get')
				.yields(null,  kubeData.nodeList);
			services.inspectService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling  getServiceHost", function () {
		
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "kube-proxy",
				version: 1
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, kubeData.serviceList);
			services.getServiceHost(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("err Service not found", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "kube-proxy"
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, []);
			services.getServiceHost(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		it("Success Unable to get service host", function (done) {
			let kubeData = dD();
			let options = kubeData.deployer;
			options.params = {
				env : "kubetest",
				serviceName : "kube-proxy"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(serviceWrapper, 'get')
				.yields(null, {items: [{}]});
			services.getServiceHost(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
});