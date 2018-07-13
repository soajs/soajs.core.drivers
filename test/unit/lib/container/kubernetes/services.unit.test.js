"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/services.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
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
				.yields(null, {
					core : {
						nodes : {
							get : (params, cb) => {
								return cb(null, kubeData.nodeList)
							}
						},
						services : {
							get : (params, cb) => {
								return cb(null, kubeData.serviceList)
							}
						},
						pods : {
							get : (params, cb) => {
								return cb(null, kubeData.podList)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						},
						daemonsets : {
							get : (params, cb) => {
								return cb(null, kubeData.daemonsetListSys)
							}
						}
					},
					autoscaling: {
						namespaces : ()=>{
							return {
								hpa: {
									get : (params, cb) => {
										return cb(null, {})
									}
								}
							}
						}
					}
				});
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 4);
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
				.yields(null, {
					core : {
						nodes : {
							get : (params, cb) => {
								return cb(null, kubeData.nodeList)
							}
						},
						services : {
							get : (params, cb) => {
								return cb(null, kubeData.serviceList)
							}
						},
						pods : {
							get : (params, cb) => {
								return cb(null, kubeData.podList)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							}
						},
						daemonsets : {
							get : (params, cb) => {
								return cb(null, kubeData.daemonsetListSys)
							}
						}
					},
					autoscaling: {
						namespaces : ()=>{
							return {
								hpa: {
									get : (params, cb) => {
										return cb(null, {})
									}
								}
							}
						}
					}
				});
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 4);
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
				.yields(null, {
					core : {
						nodes : {
							get : (params, cb) => {
								return cb(null, kubeData.nodeList)
							}
						},
						services : {
							get : (params, cb) => {
								return cb(null, kubeData.serviceList)
							}
						},
						pods : {
							get : (params, cb) => {
								return cb(null, kubeData.podList)
							}
						}
					},
					extensions : {
						deployments : {
							get : (params, cb) => {
								return cb(null, kubeData.deploymentMongo)
							}
						},
						daemonsets : {
							get : (params, cb) => {
								return cb(null, null)
							}
						}
					},
					autoscaling: {
						namespaces : ()=>{
							return {
								hpa: {
									get : (params, cb) => {
										return cb(null, {})
									}
								}
							}
						}
					}
				});
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
			
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					deployment :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
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
			
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					daemonset :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
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
			
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					deployment :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
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
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, [])
						},
						put: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					deployment :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
					},
					daemonset :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
			
			services.redeployService(options, function (error, res) {
				assert.ok(res)
				done();
			});
		});
		
		it("Success with action 'rebuild' mongo", function (done) {
			let kubeData = dD();
			kubeData = dD();
			options = kubeData.deployer;
			options.params = kubeData.redepolyServiceParams;
			options.params.action = kubeData.redepolyServiceParams.inputmaskData.action;
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
						put: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					deployment :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
					},
					daemonset :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
			
			services.redeployService(options, function (error, res) {
				assert.ok(res)
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
			let namespaces = () => {
				return {
					services: {
						post: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
						put: (params, cb) => {
							return cb(null, true)
						}
					},
					hpa: {
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					serviceaccounts :{
						post: (params, cb) => {
							return cb(null, true)
						}
					},
					deployment :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
					},
					daemonset :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						}
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						secrets : {
							get: (cb) => {
								return cb(null, kubeData.secrets)
							}
						},
						namespace: {
							post: (params, cb)=>{
								return cb(null, true);
							}
						}
					},
					autoscaling: {
						namespaces: namespaces,
					},
					extensions: {
						namespaces: namespaces,
					}
				});
			
			services.redeployService(options, function (error, res) {
				assert.ok(res)
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
			let namespaces = () => {
				return {
					deployments :{
						post: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null, true)
						},
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
					}
				}
			};
			namespaces.get = (params, cb)=>{
				return cb(null, kubeData.namespaces)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					extensions: {
						namespaces: namespaces,
					}
				});
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
			let namespaces = () => {
				return {
					deployments :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentListSys)
						},
					},
					daemonsets :{
						get: (params, cb) => {
							return cb(null,  kubeData.daemonsetListSys)
						},
					},
					services :{
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						nodes: {
							get: (params, cb) => {
								return cb(null, kubeData.nodeList)
							},
						},
						namespaces: namespaces
					},
					extensions: {
						namespaces: namespaces,
					}
				});
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
				.yields(null, {
					core: {
						services :{
							get: (params, cb) => {
								return cb(null, kubeData.serviceList)
							}
						}
					}
				});
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
			
			let namespaces = () => {
				return {
					deployment :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					deployments :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null,  true)
						},
					},
					daemonset :{
						get: (params, cb) => {
							return cb(null,  kubeData.daemonsetNginx)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					services :{
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					replicasets :{
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					pods :{
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					hpa :{
						get: (params, cb) => {
							return cb(null, kubeData.autoscale)
						},
						delete: (params, cb) => {
							return cb(null, true)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces},
					extensions: {namespaces},
					autoscaling: {namespaces}
				});
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
			
			let namespaces = () => {
				return {
					deployment :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					deployments :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null,  true)
						},
					},
					daemonset :{
						get: (params, cb) => {
							return cb(null,  kubeData.daemonsetNginx)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					services :{
						get: (params, cb) => {
							return cb(null, [])
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					replicasets :{
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					pods :{
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					hpa :{
						get: (params, cb) => {
							return cb(null, kubeData.autoscale)
						},
						delete: (params, cb) => {
							return cb(null, true)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces},
					extensions: {namespaces},
					autoscaling: {namespaces}
				});
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
			
			let namespaces = () => {
				return {
					deployments :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentListSys)
						},
					},
					daemonsets :{
						get: (params, cb) => {
							return cb(null,  kubeData.daemonsetListSys)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					extensions: {
						deployments :{
							get: (params, cb) => {
								return cb(null, kubeData.deploymentListSys)
							},
						},
						daemonsets :{
							get: (params, cb) => {
								return cb(null,  kubeData.daemonsetListSys)
							},
						}
					}
				});
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
			let namespaces = () => {
				return {
					deployment :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					deployments :{
						get: (params, cb) => {
							return cb(null, kubeData.deploymentMongo)
						},
						put: (params, cb) => {
							return cb(null,  true)
						},
					},
					daemonset :{
						get: (params, cb) => {
							return cb(null,  kubeData.daemonsetNginx)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					services :{
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					replicasets :{
						delete: (params, cb) => {
							return cb(null,  true)
						},
					},
					pods :{
						get: (params, cb) => {
							return cb(null,  {})
						},
					},
					hpa :{
						get: (params, cb) => {
							return cb(null, kubeData.autoscale)
						},
						delete: (params, cb) => {
							return cb(null, true)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
						nodes: {
							get: (params, cb) => {
								return cb(null, kubeData.nodeList)
							},
						}
					},
					extensions : {
						namespaces: namespaces,
					}
				});
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
			
			let namespaces = () => {
				return {
					services :{
						get: (params, cb) => {
							return cb(null, kubeData.serviceList)
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces}
				});
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
			
			let namespaces = () => {
				return {
					services :{
						get: (params, cb) => {
							return cb(null,{items: []})
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces}
				});
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
			
			let namespaces = () => {
				return {
					services :{
						get: (params, cb) => {
							return cb(null, {items: [{}]})
						},
					}
				}
			};
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {namespaces}
				});
			services.getServiceHost(options, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
});