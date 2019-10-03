'use strict';
const assert = require("assert");
const helper = require("../../../../../helper.js");
const service = helper.requireModule('./lib/container/kubernetes/clients/apiservice.js');
let deployer = {};
describe("testing /lib/container/kubernetes/clients/apiservice.js", function () {
	describe("calling service", function () {
		before((done) => {
			done();
		});
		
		it("Success post", function (done) {
			deployer = {
				apis: {
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: {
								post: () => {
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
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: {}
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
		
		it("Success get", function (done) {
			deployer = {
				apis: {
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: () => {
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
						}
					}
				}
			};
			let opts = {
				body: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		it("fail get", function (done) {
			deployer = {
				apis: {
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: {}
						}
					}
				}
			};
			let opts = {
				namespace: "soajs",
				body: {}
			};
			service.get(deployer, opts, function (error, res) {
				assert.ok(error);
				done();
			});
		});
		
		it("Success delete", function (done) {
			deployer = {
				apis: {
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: () => {
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
						}
					}
				}
			};
			let opts = {
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
					["apiregistration.k8s.io"]: {
						v1: {
							apiservices: {}
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