"use strict";
const helper = require("../../../helper.js");
const assert = require("assert");
const sinon = require('sinon');
const service = helper.requireModule('./infra/google/index.js');
const google = require('googleapis');
let dD = require('../../../schemas/docker/local.js');

const v1Compute = google.compute('v1');

describe("testing /lib/google/index.js", function () {
	
	describe("calling authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let info = dD();
		let options = info.deployer;
		it("Success", function (done) {
			sinon
				.stub(google, compute)
				.once()
				.returns({
				
				});
			service.authenticate(options, function (error, res) {
				console.log(error, res)
				done();
			});
		});
	});
});
