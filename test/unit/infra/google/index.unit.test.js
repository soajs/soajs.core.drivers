"use strict";
const helper = require("../../../helper.js");
const assert = require("assert");
const sinon = require('sinon');
const service = helper.requireModule('./infra/google/index.js');
const googleApi = helper.requireModule('./infra/google/utils/utils.js');
let dD = require('../../../schemas/kubernetes/google.js');

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
				.stub(googleApi, 'compute')
				.returns({
					'zones': {
						'list': (params, cb) => {
							return cb (null, true);
						}
					}
				});
			service.authenticate(options, function (error, res) {
				done();
			});
		});
	});
});
