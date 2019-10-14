'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/secret.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/secret.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								secrets: {
									get: () => {
										return new Promise((resolve, reject) => {
											resolve({
												body: true
											});
											reject(true);
										});
									}
								}
							};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success get with secret", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								secrets: () => {
									return {
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
							};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				secret: "service",
				qs: {}
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
						namespaces: () => {
							return {};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				service: "service",
				qs: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success post", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								secrets: {
									post: () => {
										return new Promise((resolve, reject) => {
											resolve({
												body: true
											});
											reject(true);
										});
									}
								}
							};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
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
						namespaces: () => {
							return {};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
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
								secrets: () => {
									return {
										delete: () => {
											return new Promise((resolve, reject) => {
												resolve({
													body: true
												});
												reject(true);
											});
										}
									}
								}
							};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				name: "serviceName",
				qs: {}
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
							return {};
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
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