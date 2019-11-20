"use strict";
const helper = require("../../../../helper.js");
const pvc = helper.requireModule('./lib/container/docker/persistentvolumeclaim.js');

describe("testing /lib/container/docker/persistentvolumeclaim.js", function () {
	
	describe("calling getPVC", function () {
		
		it("Success", function (done) {
			pvc.getPVC({}, function () {
				done();
			});
		});
	});
	
	describe("calling createPVC", function () {
		it("Success", function (done) {
			pvc.createPVC({}, function () {
				done();
			});
		});
		
	});
	
	describe("calling deletePVC", function () {
		it("Success", function (done) {
			pvc.deletePVC({}, function () {
				done();
			});
		});
	});
	
	describe("calling listPVCs", function () {
		it("Success", function (done) {
			pvc.listPVCs({}, function () {
				done();
			});
		});
	});
});