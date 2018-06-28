"use strict";
const helper = require("../../../helper");
const terraform = helper.requireModule("./lib/terraform/helper.js");
let dD = require('../../../schemas/azure/cluster.js');
const { stubSpawnOnce } = require('stub-spawn-once')
describe("testing terraform /lib/terraform/helper.js", function () {
	
	describe("calling deployCluster", function () {
		afterEach((done) => {
			done();
		});
		
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			options.params.command = 'ls';
			options.params.cwd = '.';
			stubSpawnOnce(
				'#!/bin/bash -c ls',
				0, // exit code
				'hi from stub!', // stdout
				'and some error output' // stderr
			);
			terraform.runChildProcess(options, function (error, response) {
				done();
			});
		});
		
	});
	
});