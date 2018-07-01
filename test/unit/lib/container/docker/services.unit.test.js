"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/docker/services.js');
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/services.js", function () {
	
	describe("calling listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let dockerData = dD();
		let options = dockerData.deployer;
		let servicesList = dockerData.serviceList;
		let servicesTasks = dockerData.servicesTasks;
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listServices: (params, cb) => {
						return cb(null, servicesList)
					},
					listTasks: (params, cb) => {
						return cb(null, servicesTasks)
					}
				});
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 1);
				assert.equal(res[0].id, '2z3amlp3y2gg67f83rfrrznf9');
				done();
			});
		});
		
		it("Success with no tasks", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listServices: (params, cb) => {
						return cb(null, servicesList)
					}
				});
			options.params.excludeTasks = true;
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 1);
				assert.equal(res[0].id, '2z3amlp3y2gg67f83rfrrznf9');
				done();
			});
		});
		
		it("Success with no labels", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listServices: (params, cb) => {
						return cb(null, servicesList)
					}
				});
			options.params.excludeTasks = true;
			delete servicesList[0].Spec.Labels['soajs.env.code'];
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 1);
				assert.equal(res[0].id, '2z3amlp3y2gg67f83rfrrznf9');
				done();
			});
		});
		
		it("Success with no custom and no 'soajs.env.code' label", function (done) {
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listServices: (params, cb) => {
						return cb(null, servicesList)
					},
					listTasks: (params, cb) => {
						return cb(null, [])
					}
				});
			options.params.custom = {};
			options.params.excludeTasks = true;
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 1);
				done();
			});
		});
		
		it("Success with custom only", function (done) {
			let dockerData = dD();
			let options = dockerData.deployer;
			let servicesList = dockerData.serviceList;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listServices: (params, cb) => {
						return cb(null, servicesList)
					},
					listTasks: (params, cb) => {
						return cb(null, [])
					}
				});
			options.params.custom = {};
			options.params.excludeTasks = true;
			services.listServices(options, function (error, res) {
				assert.equal(res.length, 0);
				done();
			});
		});
	});
	
	describe("calling deployService", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			
			done();
		});
		it("Success deploy mongo", function (done) {
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
				.yields(null, {
					createService: (params, cb) => {
						return cb(null, {id: "serviceId"})
					},
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					}
				});
			services.deployService(options, function (error, res) {
				assert.equal(res.id, "serviceId");
				done();
			});
		});
		
		it("Success deploy service", function (done) {
			options = dockerData.constrollerDeploy;
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createService: (params, cb) => {
						return cb(null, {id: "serviceId"})
					},
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.deployService(options, function (error, res) {
				assert.equal(res.id, "serviceId");
				done();
			});
		});
		
		it("Success deploy service without command", function (done) {
			options = dockerData.constrollerDeploy;
			options.params.catalog.recipe.buildOptions.cmd.deploy.command = [];
			options.params.catalog.recipe.buildOptions.cmd.deploy.args = [];
			
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createService: (params, cb) => {
						return cb(null, {id: "serviceId"})
					},
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.deployService(options, function (error, res) {
				assert.equal(res.id, "serviceId");
				done();
			});
		});
		
		it("error deploy service no secrets found", function (done) {
			options = dockerData.constrollerDeploy;
			options.params.catalog.recipe.buildOptions.cmd.deploy.command = [];
			options.params.catalog.recipe.buildOptions.cmd.deploy.args = [];
			
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createService: (params, cb) => {
						return cb(null, {id: "serviceId"})
					},
					listSecrets: (cb) => {
						return cb(null, [])
					}
				});
			services.deployService(options, function (error, res) {
				assert.equal(error.code, 725);
				done();
			});
		});
		
		it("error deploy service without secrets", function (done) {
			options = dockerData.constrollerDeploy;
			options.params.inputmaskData.custom.secrets = [];
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					createService: (params, cb) => {
						return cb(null, {id: "serviceId"})
					},
					listSecrets: (cb) => {
						return cb(null, [])
					},
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.deployService(options, function (error, res) {
				assert.equal(res.id, 'serviceId');
				done();
			});
		});
	});
	
	describe("calling redeployService", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoReDeploy;
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
		it("Success with action 'rebuild' mongo", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'rebuild';
			options.params.inputmaskData.action = 'rebuild';
			services.redeployService(options, function (error, res) {
				assert.equal(res.id, "9xabk0pf9wdfdul8vh913jvqs");
				done();
			});
		});
		
		it("Success with action 'rebuild' mongo no Spec", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								dockerData.inspectService.Spec = {};
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'rebuild';
			options.params.inputmaskData.action = 'rebuild';
			services.redeployService(options, function (error, res) {
				assert.equal(res.id, "9xabk0pf9wdfdul8vh913jvqs");
				done();
			});
		});
		
		it("Success with action 'redeploy' no Spec", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								dockerData.inspectService.Spec = {};
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'redeploy';
			options.params.inputmaskData.action = 'redeploy';
			services.redeployService(options, function (error, res) {
				assert.equal(res.id, "9xabk0pf9wdfdul8vh913jvqs");
				done();
			});
		});
		
		it("Success with action 'redeploy'", function (done) {
			let dockerData = dD();
			let options = dockerData.mongoReDeploy;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'redeploy';
			options.params.inputmaskData.action = 'redeploy';
			services.redeployService(options, function (error, res) {
				assert.equal(res.id, "9xabk0pf9wdfdul8vh913jvqs");
				done();
			});
		});
		
		it("Success with action 'rebuild' controller", function (done) {
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			let dockerData = dD();
			let options = dockerData.controllerRedeploy;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectController);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'rebuild';
			options.params.inputmaskData.action = 'rebuild';
			services.redeployService(options, function (error, res) {
				assert.equal(res.id, "5aornksipp1ulqs0ojcebamcd");
				done();
			});
		});
		
		it("Error no secrets found", function (done) {
			let response = {
				"statusCode": 200,
				"body": {
					"name": "latest",
					"full_size": 244020253,
					"images": [
						{
							"size": 244020253,
							"architecture": "amd64",
							"variant": null,
							"features": null,
							"os": "linux",
							"os_version": null,
							"os_features": null
						}
					],
					"id": 169967,
					"repository": 192252,
					"creator": 274272,
					"last_updater": 216113,
					"last_updated": "2018-03-28T13:32:32.636155Z",
					"image_id": null,
					"v2": true
				},
				"headers": {
					"date": "Tue, 29 May 2018 14:50:32 GMT",
					"content-type": "application/json",
					"transfer-encoding": "chunked",
					"connection": "close",
					"vary": "Cookie",
					"x-frame-options": "deny",
					"allow": "GET, DELETE, HEAD, OPTIONS",
					"server": "nginx",
					"x-content-type-options": "nosniff",
					"x-xss-protection": "1; mode=block",
					"strict-transport-security": "max-age=31536000"
				},
				"request": {
					"uri": {
						"protocol": "https:",
						"slashes": true,
						"auth": null,
						"host": "hub.docker.com",
						"port": 443,
						"hostname": "hub.docker.com",
						"hash": null,
						"search": null,
						"query": null,
						"pathname": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"path": "/v2/repositories/soajsorg/soajs/tags/latest/",
						"href": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest/"
					},
					"method": "GET",
					"headers": {
						"cache-control": "no-cache",
						"accept": "application/json",
						"referer": "https://hub.docker.com/v2/repositories/soajsorg/soajs/tags/latest"
					}
				}
			};
			let nocks = nock('https://hub.docker.com', {'cache-control': 'no-cache'})
				.get('/v2/repositories/soajsorg/soajs/tags/latest')
				.reply(200, response);
			let dockerData = dD();
			let options = dockerData.controllerRedeploy;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						dockerData.secretList[0].Spec.Name = "notFound";
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectController);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'rebuild';
			options.params.inputmaskData.action = 'rebuild';
			services.redeployService(options, function (error, res) {
				assert.equal(error.code, 726);
				done();
			});
		});
		
		it("Success with action 'test'", function (done) {
		
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					listSecrets: (cb) => {
						return cb(null, dockerData.secretList)
					},
					getService: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							},
							id: params
						};
					}
				});
			options.params.action = 'test';
			options.params.inputmaskData.action = 'test';
			services.redeployService(options, function (error, res) {
				assert.equal(error.code, 501);
				done();
			});
		});
	});
	
	describe("calling scaleService", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			"id": "9xabk0pf9wdfdul8vh913jvqs",
			"scale": 2
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getService: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							}
						};
					}
				});
			services.scaleService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling inspectService", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			"id": "9xabk0pf9wdfdul8vh913jvqs"
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					getService: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							}
						};
					},
					listTasks: (params, cb) => {
						return cb(null, dockerData.servicesTasks)
					}
				});
			services.inspectService(options, function (error, res) {
				assert.equal(res.service.id, "9xabk0pf9wdfdul8vh913jvqs");
				assert.equal(res.tasks.length, 1);
				done();
			});
		});
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					getService: () => {
						return {
							inspect: (cb) => {
								delete dockerData.inspectService.Endpoint.Spec.Ports[0].PublishedPort;
								delete dockerData.inspectService.Endpoint.Ports[0].PublishedPort;
								return cb(null, dockerData.inspectService);
							}
						};
					},
					listTasks: (params, cb) => {
						return cb(null, dockerData.servicesTasks)
					}
				});
			services.inspectService(options, function (error, res) {
				assert.equal(res.service.id, "9xabk0pf9wdfdul8vh913jvqs");
				assert.equal(res.tasks.length, 1);
				done();
			});
		});
		
		it("Success excludeTask on", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getService: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							},
							update: (param, cb) => {
								return cb(null, true);
							}
						};
					},
					listTasks: (params, cb) => {
						return cb(null, dockerData.servicesTasks)
					}
				});
			options.params.excludeTasks = true;
			services.inspectService(options, function (error, res) {
				let assertCheck = !res.tasks;
				assert.equal(res.service.id, "9xabk0pf9wdfdul8vh913jvqs");
				assert.ok(assertCheck);
				done();
			});
		});
	});
	
	describe("calling findService", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			env : "bloooom",
			serviceName : "controller",
			version : "1"
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.findService(options, function (error, res) {
				assert.equal(res.id, "2z3amlp3y2gg67f83rfrrznf9");
				done();
			});
		});
		
		it.skip("Success", function (done) {
			
			//increase branches
			done();
		});
	});
	
	describe("calling  deleteService", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			"id": "9xabk0pf9wdfdul8vh913jvqs"
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getService: () => {
						return {
							remove: (cb) => {
								return cb(null, true);
							}
						};
					}
				});
			services.deleteService(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling  getLatestVersion", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			env : "bloooom",
			serviceName : "controller"
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.getLatestVersion(options, function (error, res) {
				assert.equal(res, "1");
				done();
			});
		});
		
		it.skip("Success", function (done) {
			
			//increase branches
			done();
		});
	});
	
	describe("calling  getServiceHost", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			env : "bloooom",
			serviceName : "controller",
			version : "1"
		};
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					listServices: (params, cb) => {
						return cb(null, dockerData.serviceList)
					}
				});
			services.getServiceHost(options, function (error, res) {
				assert.equal(res, "10.0.0.36");
				done();
			});
		});
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					
					listServices: (params, cb) => {
						return cb(null, [])
					}
				});
			services.getServiceHost(options, function (error, res) {
				assert.equal(error.code, 661);
				done();
			});
		});
		
		it.skip("Success", function (done) {
			
			//increase branches
			done();
		});
	});
});