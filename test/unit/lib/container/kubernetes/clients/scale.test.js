'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/scale.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/scale.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success scale", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				apis: {
					apps: {
						v1beta1: {
							namespaces: () => {
								return {
									deployments: () => {
										return {
											scale: {
												put: () => {
													return new Promise((resolve, reject) => {
														resolve({
															body: true
														});
														reject(true);
													});
												}
											}
										}
									}
								};
							}
						}
					}
				}
			};
			service.put(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("Fail scale", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				apis: {
					apps: {
						v1beta1: {
							namespaces: () => {
								return {
									deployments: () => {
										return {
											scale: {
												put: () => {
													return new Promise((resolve, reject) => {
														reject(true);
													});
												}
											}
										}
									}
								};
							}
						}
					}
				}
			};
			service.put(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
	
});