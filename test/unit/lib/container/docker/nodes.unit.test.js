"use strict";

const assert = require("assert");
const nock = require("nock");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const nodes = helper.requireModule('./lib/container/docker/nodes.js');
const utils = helper.requireModule('./lib/container/docker/utils.js');
let dD = require('../../../../schemas/docker/local.js');

describe("testing /lib/container/docker/nodes.js", function () {
	
	describe("calling inspectCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let dockerData = dD();
		let options = dockerData.deployer;
		
		it("Success", function (done) {
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					swarmInspect: (cb) => {
						return cb(null, dockerData.swarmInspect)
					},
					info: (cb) => {
						return cb(null, dockerData.dockerInfo)
					}
				});
			nodes.inspectCluster(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling addNode", function () {
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
		it("Success", function (done) {
			options.params = {"env": "BLOOOOM", "host": "192.168.61.91", "port": 443, "role": "worker"};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					swarmInspect: (cb) => {
						return cb(null, dockerData.swarmInspect)
					},
					info: (cb) => {
						return cb(null, dockerData.dockerInfo)
					},
					swarmJoin: (params, cb) => {
						return cb(null, true)
					}
					
				});
			nodes.addNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling removeNode", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoReDeploy;
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			options.params.nodeId = 'mwdhuz0wfj6e9d40175g8kpge';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					getNode: (params) => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.nodes[0]);
							},
							remove: (parmas, cb) => {
								return cb(null, true);
							},
						};
					},
					swarmLeave: (cb) => {
						return cb(null, true);
					}
				});
			nodes.removeNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling  updateNode", function () {
		
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			"id": "mwdhuz0wfj6e9d40175g8kpge",
			"role": "manager",
			"value": "10.0.0.1",
			
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
					getNode: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.nodes[0]);
							},
							update: (param, cb) => {
								return cb(null, true);
							}
						};
					}
				});
			nodes.updateNode(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling inspectNode", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			"id": "mwdhuz0wfj6e9d40175g8kpge"
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
					getNode: () => {
						return {
							inspect: (cb) => {
								return cb(null, dockerData.nodes[0]);
							}
						};
					}
				});
			nodes.inspectNode(options, function (error, res) {
				assert.equal(res.id, 'mwdhuz0wfj6e9d40175g8kpge');
				done();
			});
		});
	});
	
	describe("calling  listNodes", function () {
		let dockerData = dD();
		let options = dockerData.mongoDeploy;
		options.params = {
			env: "bloooom"
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
					listNodes: (cb) => {
						return cb(null, dockerData.nodes)
					}
				});
			nodes.listNodes(options, function (error, res) {
				assert.equal(res.length, 1);
				assert.equal(res[0].id, "mwdhuz0wfj6e9d40175g8kpge");
				done();
			});
		});
	});
	
});