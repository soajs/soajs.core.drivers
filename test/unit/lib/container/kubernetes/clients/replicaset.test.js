'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/replicaset.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/replicaset.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success delete", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									replicasets: {
										delete: () => {
											return new Promise((resolve, reject) => {
												resolve({
													body: true
												});
											});
										}
									}
								};
							}
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.delete(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("Fail delete", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									replicasets: {
										delete: () => {
											return new Promise((resolve, reject) => {
												reject(true);
											});
										}
									}
								};
							}
						}
					}
				}
			};
			service.delete(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
	
});