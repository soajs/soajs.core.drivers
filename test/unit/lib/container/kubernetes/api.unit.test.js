'use strict';
const assert = require("assert");
const sinon = require('sinon');
const helper = require("../../../../helper.js");
const api = helper.requireModule('./lib/container/kubernetes/api.js');
const utils = helper.requireModule('./lib/container/kubernetes/utils.js');
const heapsterD = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/deployment.js');
const heapsterS = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/service.js');
const heapsterSA = helper.requireModule('./lib/schemas/kubernetes/resources/heapster/serviceAccount.js');
let dD = require('../../../../schemas/kubernetes/local.js');
let kubeData = {};
let options = {};
describe("testing /lib/container/kubernetes/manageResources.js", function () {
	describe("calling manageResources", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success post", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: function (oneResource) {
							return {
								namespaces: (namespace) => {
									return {
										kind: (oneResource) => {
											return {
												"post": (params, cb) => {
													return cb(null, {})
												}
											}
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "post",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: function (oneResource) {
							return {
								namespaces: (namespace) => {
									return {
										kind: (oneResource) => {
											return {
												"post": (params, cb) => {
													return cb({code: 404}, {})
												}
											}
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Success with templates", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			delete heapsterD.metadata.namespace;
			delete heapsterS.metadata.namespace;
			delete heapsterSA.metadata.namespace;
			options.params = {
				"action": "get",
				"resource": "heapster",
				"templates": [heapsterD, heapsterS, heapsterSA]
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: () => {
							return {
								kind: () => {
									return {
										"get": (params, cb) => {
											return cb(null, {})
										}
									}
								}
							}
						}
					},
					
				});
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Error", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			delete heapsterD.metadata.namespace;
			delete heapsterS.metadata.namespace;
			delete heapsterSA.metadata.namespace;
			options.params = {
				"action": "get",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: () => {
							return {
								kind: () => {
									return {
										"get": (params, cb) => {
											return cb({code: 404}, {})
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Error delete", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "delete",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: () => {
							return {
								kind: () => {
									return {
										"delete": (params, cb) => {
											return cb({code: 404}, {})
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("Error delete namespace", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "delete",
				"resource": "heapster"
			};
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: () => {
							return {
								kind: () => {
									return {
										"delete": (params, cb) => {
											return cb({code: 404}, {})
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
		
		it("error delete ", function (done) {
			kubeData = dD();
			options = kubeData.deployer;
			options.params = {
				"action": "delete",
				"resource": "heapster",
				"templates": [heapsterD, heapsterS, heapsterSA]
			};
			heapsterD.metadata.namespace = 'soajs';
			heapsterS.metadata.namespace = 'soajs';
			heapsterSA.metadata.namespace = 'soajs';
			sinon
				.stub(utils, 'getDeployer')
				.yields(null, {
					api: {
						group: function (oneResource) {
							return {
								namespaces: (namespace) => {
									return {
										kind: (oneResource) => {
											return {
												"delete": (params, cb) => {
													return cb({code: 404}, {})
												}
											}
										}
									}
								}
							}
						}
					},
					
				});
			
			api.manageResources(options, function (error, res) {
				assert.ok(res);
				done();
			});
		});
	});
	
});