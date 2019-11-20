'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const pvc = helper.requireModule('./lib/container/kubernetes/persistentvolumeclaims.js');
const pvcWrapper = helper.requireModule("./lib/container/kubernetes/clients/persistentvolumeclaim.js");
const namespaceWrapper = helper.requireModule("./lib/container/kubernetes/clients/namespace.js");
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/persistentvolumeclaim.js", function () {
	
	describe("calling getPVC", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(pvcWrapper, 'get')
				.yields(null, kubeData.pvc);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			options.params = {
				name: 'test-pvc'
			};
			pvc.getPVC(options, function (error, res) {
				assert.equal(res.name, 'test-pvc');
				done();
			});
		});
	});
	
	describe("calling createPVC", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success 1 secret", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"name": "test-pvc",
				"storage": "1Gi",
				"accessModes": ["ReadWriteOnce"]
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(pvcWrapper, 'post')
				.yields(null,  kubeData.pvc);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			pvc.createPVC(options, function (error, res) {
				assert.equal(res.name, "test-pvc");
				done();
			});
		});
	});
	
	describe("calling deletePVC", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"name": "test-pvc"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(pvcWrapper, 'delete')
				.yields(null, true);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			pvc.deletePVC(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
	describe("calling listPVCs", function () {
		
		afterEach((done) => {
			sinon.restore();
			done();
		});
		beforeEach((done) => {
			done();
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"namespace": "volume"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(pvcWrapper, 'get')
				.yields(null,  kubeData.pvcList);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			pvc.listPVCs(options, function (error, res) {
				assert.ok(res);
				assert.equal(res.length, 2);
				assert.equal(res[0].name, 'ragheb');
				assert.equal(res[1].name, 'ragheb2');
				done();
			});
		});
		it("Success", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {});
			sinon
				.stub(pvcWrapper, 'get')
				.yields(null,  kubeData.pvcList);
			sinon
				.stub(namespaceWrapper, 'get')
				.yields(null, kubeData.namespaces);
			pvc.listPVCs(options, function (error, res) {
				assert.ok(res);
				assert.equal(res.length, 2);
				assert.equal(res[0].name, 'ragheb');
				assert.equal(res[1].name, 'ragheb2');
				done();
			});
		});
	});
});