"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/task.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
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
				.yields(null, {
					core : {namespaces}
				});
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
			let pods = () => {
				return {
					log : {
						getStream: (params, cb)=>{
							return cb(null, {})
						},
						get: (params, cb)=>{
							return cb(null, {})
						}
					}
				}
			};
			
			let namespaces = () => {
				return {
					pods: pods
				}
			};
			
			pods.get = (params, cb)=>{
				return cb(null, true)
			};
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
					}
				});
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
			let pods = () => {
				return {
					log : {
						getStream: (params)=>{
							return {params};
						},
						get: (params, cb)=>{
							return cb(null, {});
						}
					}
				}
			};
			
			let namespaces = () => {
				return {
					pods: pods
				}
			};
			
			pods.get = (params, cb)=>{
				return cb(null, true)
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
					}
				});
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
			let namespaces = () => {
				return {
					pods: {
						get: (params, cb) => {
							return cb(null, kubeData.PodListController)
						}
					}
				}
			};
			
			//deployer.core.namespaces.get
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					core: {
						namespaces: namespaces,
					},
					config : { url: 'https://192.168.61.51:6443',
						auth: { bearer: 'eA' },
						request:
							{ strictSSL: false,
								auth: { bearer: 'eA' } } }
				});
			services.maintenance(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});

