'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/namespace.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/namespace.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get with name", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								get: () => {
									return new Promise((resolve, reject) => {
										resolve({
											body: true
										});
										reject(true);
									});
								}
							};
						}
					}
				}
			};
			let opts = {
				name: "soajs",
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success get", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: {
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
			};
			let opts = {
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("fail get", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: {
							get: () => {
								return new Promise((resolve, reject) => {
									reject(true);
								});
							}
						}
					}
				}
			};
			let opts = {};
			service.get(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success post", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: {
							post: () => {
								return new Promise((resolve, reject) => {
									resolve({
										body: true
									});
								});
							}
						}
					}
				}
			};
			let opts = {
				body: {}
			};
			service.post(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("fail post", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: {
							post: () => {
								return new Promise((resolve, reject) => {
									reject(true);
								});
							}
						}
					}
				}
			};
			let opts = {
				body: {}
			};
			service.post(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success delete", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								delete: () => {
									return new Promise((resolve, reject) => {
										resolve({
											body: true
										});
									});
								}
							};
						}
					}
				}
			};
			let opts = {
				name: "serviceName",
			};
			service.delete(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("Fail delete", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								delete: () => {
									return new Promise((resolve, reject) => {
										reject(true);
									});
								}
							};
						}
					}
				}
			};
			let opts = {
				name: "serviceName",
				qs: {}
			};
			service.delete(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
	});
	
});