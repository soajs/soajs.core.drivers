'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/clusterrolebinding.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/clusterrolebinding.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success get", function (done) {
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							clusterrolebindings: () => {
								return {
									get: () => {
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
		
		it("fail get", function (done) {
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							clusterrolebindings: () => {
								return {
									get: () => {
										return new Promise((resolve, reject) => {
											reject(true);
										});
									}
								};
							}
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
			//return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.clusterrolebindings.post({body: opts.body});
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							clusterrolebindings: {
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
							clusterrolebindings: () => {
								return {
									post: () => {
										return new Promise((resolve, reject) => {
											reject(true);
										});
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
		
		it("Success delete", function (done) {
			deployer = {
				apis: {
					["rbac.authorization.k8s.io"]: {
						v1alpha1: {
							clusterrolebindings: () => {
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
							clusterrolebindings: () => {
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