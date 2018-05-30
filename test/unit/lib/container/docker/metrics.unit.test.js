"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const metrics = helper.requireModule('./lib/container/docker/metrics.js');
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/metrics.js", function () {
	
	describe("calling getServicesMetrics", function () {
		let dockerData = dD();
		let options = dockerData.deployer;
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			let response = {
				'mongotest.1.8427jtmss5lxybb3e6cpymjjj':
					{
						cpuPercent: '0.76',
						memory: 68788224,
						online_cpus: 6,
						memoryLimit: 524288000,
						memPercent: '13.12',
						timestamp: '2018-05-28T16:32:39.596625237Z',
						blkRead: 35319808,
						blkWrite: 24350720,
						netIn: 2608,
						netOut: 0
					},
				'manager-docker-api':
					{
						cpuPercent: '0.00',
						memory: 70782976,
						online_cpus: 6,
						memoryLimit: 8360284160,
						memPercent: '0.85',
						timestamp: '2018-05-28T16:32:39.600142122Z',
						blkRead: 98304,
						blkWrite: 0,
						netIn: 12430162,
						netOut: 26844843
					}
			};
			let nocks = nock(dockerData.deployer.deployerConfig.apiProtocol + '://' + dockerData.deployer.deployerConfig.nodes + ":" + dockerData.deployer.deployerConfig.apiPort,
				{'Content-Type': 'application/json', 'token': dockerData.deployer.deployerConfig.auth.token})
				.get('/metrics')
				.reply(200, response);
			done();
		});
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					host: dockerData.deployer.deployerConfig.apiProtocol + '://' + dockerData.deployer.deployerConfig.nodes + ":" + dockerData.deployer.deployerConfig.apiPort,
					token: dockerData.deployer.deployerConfig.auth.token
				});
			metrics.getServicesMetrics(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
});