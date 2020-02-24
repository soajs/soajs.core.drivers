'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/pod.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/pod.js", function () {
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
		
		it("Success get with pod", function (done) {
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
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
				pod: "service",
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
				qs: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success getLogs no follow", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
									return {
										log: {
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
						}
					}
				}
			};
			service.getLogs(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success getLogs with follow ", function (done) {
			let opts = {
				namespace: "soajs",
				pod: "test",
				qs: {
					follow: true
				}
			};
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
									return {
										log: {
											getByteStream: () => {
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
			};
			service.getLogs(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Fail getLogs", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
									return {
										log: {
											get: () => {
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
			};
			service.getLogs(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success podExec", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
									return {
										exec: {
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
						}
					}
				}
			};
			service.podExec(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("Fail podExec", function (done) {
			let opts = {
				namespace: "soajs",
				body: {}
			};
			deployer = {
				api: {
					v1: {
						namespaces: () => {
							return {
								pods: () => {
									return {
										exec: {
											get: () => {
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
			};
			service.podExec(deployer, opts, function (error, res) {
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
								pods: {
									delete: () => {
										return new Promise((resolve, reject) => {
											resolve({
												body: true
											});
										});
									}
								}
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