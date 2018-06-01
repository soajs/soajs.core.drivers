"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const tasks = helper.requireModule('./lib/container/docker/task.js');
const services = helper.requireModule('./lib/container/docker/services.js');
const engine = Object.assign(tasks, services);
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/tasks.js", function () {
	
	describe("calling inspectTask", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let dockerData = dD();
		let options = dockerData.deployer;
		options.driver = "docker.local";
		it("Success", function (done) {
			options.params.env = "bloooom";
			options.params.id = "kryfpx1uuj33t4z31mvkzvjod";
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getTask: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.servicesTasks[0]);
							}
						};
					},
					getService: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.inspectService);
							}
						};
					}
				});
			engine.inspectTask(options, function (error, res) {
				assert.equal(res.id, 'kryfpx1uuj33t4z31mvkzvjod');
				assert.equal(res.ref.service.id, '2z3amlp3y2gg67f83rfrrznf9');
				done();
			});
		});
	});
	
	describe("calling getContainerLogs", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
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
		it("Success  with follow", function (done) {
			options.params.taskId = 'kryfpx1uuj33t4z31mvkzvjod';
			options.params.tail = 100;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getTask: (taskId) => {
						if (taskId === 'kryfpx1uuj33t4z31mvkzvjod') {
							return {
								logs: (taskId, cb) => {
									return cb(null, "�2018-05-29T08:08:02.946+0000 I CONTROL  [initandlisten] MongoDB starting : pid=1 port=27017 dbpath=/data/db 64-bit host=d0e0e0bdd0d2");
								}
							};
						}
						else {
							return {};
						}
					}
				});
			tasks.getContainerLogs(options, function (error, res) {
				assert.ok(res.data);
				done();
			});
		});
		
		it("Success  with out follow", function (done) {
			options.params.taskId = 'kryfpx1uuj33t4z31mvkzvjod';
			options.params.follow = true;
			delete 	options.params.tail;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getTask: (taskId) => {
						if (taskId === 'kryfpx1uuj33t4z31mvkzvjod') {
							return {
								logs: (taskId, cb) => {
									return cb(null, "�2018-05-29T08:08:02.946+0000 I CONTROL  [initandlisten] MongoDB starting : pid=1 port=27017 dbpath=/data/db 64-bit host=d0e0e0bdd0d2");
								}
							};
						}
						else {
							return {};
						}
					
					}
				});
			tasks.getContainerLogs(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling  maintenance", function () {
		
		let dockerData = dD();
		let options = dockerData.deployer;
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			let response = [
				{
					"id": "vczh6r7d49makps2qycbmox4d",
					"response": {
						"result": true,
						"ts": 1527587228250,
						"service": {
							"service": "CONTROLLER",
							"type": "rest",
							"route": "/loadProvision"
						}
					}
				}
			];
			let nocks = nock(dockerData.deployer.deployerConfig.apiProtocol + '://' + dockerData.deployer.deployerConfig.nodes + ":" + dockerData.deployer.deployerConfig.apiPort,
				{'Content-Type': 'application/json', 'token': dockerData.deployer.deployerConfig.auth.token})
				.get('/maintenance')
				.query({ toEnv: 'BLOOOOM',
					id: 'it7q5tr3uojdt5wy371n4bk8e',
					network: 'soajsnet',
					operation: 'loadProvision',
					vmName: 'controller',
					maintenancePort: 5000 })
				.reply(200, response);
			
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					host: dockerData.deployer.deployerConfig.apiProtocol + '://' + dockerData.deployer.deployerConfig.nodes + ":" + dockerData.deployer.deployerConfig.apiPort,
					token: dockerData.deployer.deployerConfig.auth.token
				});
			options.params = {
				toEnv: 'BLOOOOM',
				id: 'it7q5tr3uojdt5wy371n4bk8e',
				network: 'soajsnet',
				operation: 'loadProvision',
				vmName: 'controller',
				maintenancePort: 5000
			};
			engine.maintenance(options, function (error, res) {
				assert.equal(res.length, 1);
				assert.equal(res[0].id, response[0].id);
				done();
			});
		});
	});
});