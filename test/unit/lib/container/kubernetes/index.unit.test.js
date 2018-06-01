"use strict";
const helper = require("../../../../helper.js");
const services = helper.requireModule('./lib/container/kubernetes/index.js');
let options = {};

describe("testing /lib/container/kubernetes/index.js", function () {
	
	before(() => {
	
	});
	//todo add assertion that an error has occured
	describe("calling  inspectCluster", function () {
		
		it("Success", function (done) {
			services.inspectCluster(options, function () {
				done();
			});
		});
	});
	
	describe("calling  addNode", function () {
		
		it("Success", function (done) {
			services.addNode(options, function () {
				done();
			});
		});
	});
	
	describe("calling  removeNode", function () {
		
		it("Success", function (done) {
			services.removeNode(options, function () {
				done();
			});
		});
	});
	
	describe("calling  updateNode", function () {
		
		it("Success", function (done) {
			services.updateNode(options, function () {
				done();
			});
		});
	});
	
	describe("calling  inspectNode", function () {
		
		it("Success", function (done) {
			services.inspectNode(options, function () {
				done();
			});
		});
	});
	
	describe("calling  listNodes", function () {
		
		it("Success", function (done) {
			services.listNodes(options, function () {
				done();
			});
		});
	});
	
	describe("calling  listServices", function () {
		
		it("Success", function (done) {
			services.listServices(options, function () {
				done();
			});
		});
	});
	
	describe("calling  deployService", function () {
		
		it("Success", function (done) {
			services.deployService(options, function () {
				done();
			});
		});
	});
	
	describe("calling  redeployService", function () {
		
		it("Success", function (done) {
			services.redeployService(options, function () {
				done();
			});
		});
	});
	describe("calling  scaleService", function () {
		
		it("Success", function (done) {
			services.scaleService(options, function () {
				done();
			});
		});
	});
	describe("calling  inspectService", function () {
		
		it("Success", function (done) {
			services.inspectService(options, function () {
				done();
			});
		});
	});
	describe("calling  findService", function () {
		
		it("Success", function (done) {
			services.findService(options, function () {
				done();
			});
		});
	});
	describe("calling  deleteService", function () {
		
		it("Success", function (done) {
			services.deleteService(options, function () {
				done();
			});
		});
	});
	describe("calling  inspectTask", function () {
		
		it("Success", function (done) {
			services.inspectTask(options, function () {
				done();
			});
		});
	});
	describe("calling  getContainerLogs", function () {
		
		it("Success", function (done) {
			services.getContainerLogs(options, function () {
				done();
			});
		});
	});
	describe("calling  maintenance", function () {
		
		it("Success", function (done) {
			services.maintenance(options, function () {
				done();
			});
		});
	});
	describe("calling  getLatestVersion", function () {
		
		it("Success", function (done) {
			services.getLatestVersion(options, function () {
				done();
			});
		});
	});
	describe("calling  getServiceHost", function () {
		
		it("Success", function (done) {
			services.getServiceHost(options, function () {
				done();
			});
		});
	});
	
	describe("calling  getNodesMetrics", function () {
		
		it("Success", function (done) {
			services.getNodesMetrics(options, function () {
				done();
			});
		});
	});
	
	describe("calling  getServicesMetrics", function () {
		
		it("Success", function (done) {
			services.getServicesMetrics(options, function () {
				done();
			});
		});
	});
	
	describe("calling  getSecret", function () {
		
		it("Success", function (done) {
			services.getSecret(options, function () {
				done();
			});
		});
	});
	
	describe("calling  createSecret", function () {
		
		it("Success", function (done) {
			services.createSecret(options, function () {
				done();
			});
		});
	});
	
	describe("calling  deleteSecret", function () {
		
		it("Success", function (done) {
			services.deleteSecret(options, function () {
				done();
			});
		});
	});
	
	describe("calling  listSecrets", function () {
		
		it("Success", function (done) {
			services.listSecrets(options, function () {
				done();
			});
		});
	});
	
	describe("calling  createNameSpace", function () {
		
		it("Success", function (done) {
			services.createNameSpace(options, function () {
				done();
			});
		});
	});
	
	describe("calling  listNameSpaces", function () {
		
		it("Success", function (done) {
			services.listNameSpaces(options, function () {
				done();
			});
		});
	});
	
	describe("calling  deleteNameSpace", function () {
		
		it("Success", function (done) {
			services.deleteNameSpace(options, function () {
				done();
			});
		});
	});
	
	describe("calling  listKubeServices", function () {
		
		it("Success", function (done) {
			services.listKubeServices(options, function () {
				done();
			});
		});
	});
	
	describe("calling  getAutoscaler", function () {
		
		it("Success", function (done) {
			services.getAutoscaler(options, function () {
				done();
			});
		});
	});
	
	describe("calling  createAutoscaler", function () {
		
		it("Success", function (done) {
			services.createAutoscaler(options, function () {
				done();
			});
		});
	});
	
	describe("calling  updateAutoscaler", function () {
		
		it("Success", function (done) {
			services.updateAutoscaler(options, function () {
				done();
			});
		});
	});
	
	describe("calling  deleteAutoscaler", function () {
		
		it("Success", function (done) {
			services.deleteAutoscaler(options, function () {
				done();
			});
		});
	});
	
	describe("calling  manageResources", function () {
		
		it("Success", function (done) {
			services.manageResources(options, function () {
				done();
			});
		});
	});
	
});