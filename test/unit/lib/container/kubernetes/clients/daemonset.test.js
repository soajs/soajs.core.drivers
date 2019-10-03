'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/daemonset.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/daemonset.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									daemonsets: {
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
		
		it("Success get with service", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									daemonsets: () => {
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
				}
			};
			let opts = {
				namespace: "soajs",
				daemonset: "daemonset",
				qs: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("fail get", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {};
							}
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				qs: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success post", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									daemonsets: {
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
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {};
							}
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
		it("Success put", function (done) {
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
									daemonsets: () => {
										return {
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
		it("Fail put", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {};
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
		it("Success delete", function (done) {
			deployer = {
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {
									daemonsets: () => {
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
				apis: {
					apps: {
						v1: {
							namespaces: () => {
								return {};
							}
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