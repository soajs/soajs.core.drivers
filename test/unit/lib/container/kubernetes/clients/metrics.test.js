'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/metrics.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/metrics.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success getPods", function (done) {
			deployer = {
				apis: {
					["metrics.k8s.io"]: {
						v1beta1: {
							pods: {
								get: () => {
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
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.getPods(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("fail get", function (done) {
			deployer = {
				apis: {
					["metrics.k8s.io"]: {
						v1beta1: {
							pods: {
								get: () => {
									return new Promise((resolve, reject) => {
										reject(true);
									});
								}
							}
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.getPods(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success getNodes", function (done) {
			deployer = {
				apis: {
					["metrics.k8s.io"]: {
						v1beta1: {
							nodes: {
								get: () => {
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
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.getNodes(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("fail getNodes", function (done) {
			deployer = {
				apis: {
					["metrics.k8s.io"]: {
						v1beta1: {
							nodes: {
								get: () => {
									return new Promise((resolve, reject) => {
										reject(true);
									});
								}
							}
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.getNodes(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
	
});