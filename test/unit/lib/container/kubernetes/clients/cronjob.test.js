'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/cronjob.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/cronjob.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get", function (done) {
			deployer = {
				apis: {
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: {
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
			//return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs(opts.name).get({qs: opts.qs});
			deployer = {
				apis: {
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: () => {
										return {
											get: () => {
												return new Promise((resolve, reject) => {
													resolve({
														body: true
													});
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
				name: "cron",
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: {
										get: () => {
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: {
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: {
										post: () => {
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: () => {
										return {
											put: () => {
												return new Promise((resolve, reject) => {
													resolve({
														body: true
													});
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: () => {
										return {
											put: () => {
												return new Promise((resolve, reject) => {
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
				assert.ok(error);
				done();
			});
		});
		it("Success delete", function (done) {
			deployer = {
				apis: {
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: () => {
										return {
											delete: () => {
												return new Promise((resolve, reject) => {
													resolve({
														body: true
													});
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
					batch: {
						v1beta1: {
							namespaces: () => {
								return {
									cronjobs: () => {
										return {
											delete: () => {
												return new Promise((resolve, reject) => {
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
				assert.ok(error);
				done();
			});
		});
	});
	
});