'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/rolebinding.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/rolebinding.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get", function (done) {
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							namespaces: () => {
								return {
									rolebindings: () => {
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
				name: "service",
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
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
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
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							namespaces: () => {
								return {
									rolebindings: {
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
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
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
		it("Success delete", function (done) {
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							namespaces: () => {
								return {
									rolebindings: () => {
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
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
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