"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');
const AWSDriver = helper.requireModule('./infra/aws/utils/utils.js');

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("listLoadBalancers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInstanceHealth: (params, cb) => {
						return cb(null, info.listlbIstances);
					}
				});
			
			options.params = {
				elbType: 'classic',
				region: 'us-east-1'
			};
			service.listLoadBalancers(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, info.listlb);
				done();
			});
		});
		it("success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			info.listRawLb.LoadBalancerDescriptions.forEach((onelb) => {
				onelb.Subnets = [];
			});
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInstanceHealth: (params, cb) => {
						return cb(null, info.listlbIstances);
					}
				});
			
			options.params = {
				region: 'us-east-1'
			};
			service.listLoadBalancers(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				info.listlb.forEach((onelb) => {
					onelb.zones = [];
				});
				assert.deepEqual(response, info.listlb);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(new Error("ereror"), info.listRawLb);
					},
					describeSubnets: (params, cb) => {
						return cb(null, info.listSubnetRaw);
					},
					describeInstanceHealth: (params, cb) => {
						return cb(null, info.listlbIstances);
					}
				});
			
			options.params = {
				elbType: 'classic',
				region: 'us-east-1'
			};
			service.listLoadBalancers(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("createLoadBalancer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn"
					}],
				healthProbe: {
					maxSuccessAttempts: 2,
					healthProbeInterval: 30,
					healthProbePath: "/png",
					healthProbeProtocol: "HTTP",
					healthProbePort: "80",
					healthProbeTimeout: 3,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnets"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		it("fail", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					createLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
				});
			
			options.params = {
			
			};
			service.createLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("updateLoadBalancer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb);
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 81,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn"
					},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 444,
						frontendProtocol: "https",
						certificate: "arn"
					}],
				healthProbe: {
					maxSuccessAttempts: 2,
					healthProbeInterval: 30,
					healthProbePath: "/png",
					healthProbeProtocol: "HTTP",
					healthProbePort: "80",
					healthProbeTimeout: 3,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnets"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success identical", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
					],
				healthProbe: {
					healthProbePath: "/index.html",
					healthProbeProtocol: "HTTP",
					healthProbePort: "80",
					healthProbeInterval: 30,
					healthProbeTimeout: 5,
					maxSuccessAttempts: 10,
					maxFailureAttempts: 2
				},
				securityGroups: ["sg-ca3421a3"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("Success no health check", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
				],
				securityGroups: ["sg-ca3421a3"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
		
		it("fail no path for health check in HTTP/HTTPS", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
				],
				healthProbe: {
					healthProbeProtocol: "HTTP",
					healthProbePort: "80",
					healthProbeInterval: 30,
					healthProbeTimeout: 5,
					maxSuccessAttempts: 10,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("fail no health check", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, info.listRawLb); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
				],
				healthProbe: {
					healthProbeInterval: 30,
					healthProbeTimeout: 5,
					maxSuccessAttempts: 10,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("fail no LoadBalancer", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(null, null); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
				],
				healthProbe: {
					healthProbeInterval: 30,
					healthProbeTimeout: 5,
					maxSuccessAttempts: 10,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
		
		it("fail no LoadBalancer", function (done) {
			
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					describeLoadBalancers: (params, cb) => {
						return cb(new Error("test"), null); // iam using only the first one byt in real case scenario only one will be returned
					},
					configureHealthCheck: (params, cb) => {
						return cb(null, true);
					},
					deleteLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					createLoadBalancerListeners: (params, cb) => {
						return cb(null, true);
					},
					setLoadBalancerListenerSSLCertificate: (params, cb) => {
						return cb(null, true);
					},
					detachLoadBalancerFromSubnets: (params, cb) => {
						return cb(null, true);
					},
					attachLoadBalancerToSubnets: (params, cb) => {
						return cb(null, true);
					},
					applySecurityGroupsToLoadBalancer: (params, cb) => {
						return cb(null, true);
					}
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn:"
					},
				],
				healthProbe: {
					healthProbeInterval: 30,
					healthProbeTimeout: 5,
					maxSuccessAttempts: 10,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnet-97c7abf3",
					"subnet-1336e83c"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.updateLoadBalancer(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});
	
	describe("deleteLoadBalancer", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			let info = dD();
			let options = info.deployCluster;
			sinon
				.stub(AWSDriver, 'getConnector')
				.returns({
					deleteLoadBalancer: (params, cb) => {
						return cb(null, true);
					},
				});
			
			options.params = {
				name: 'test-lb',
				region: 'us-east-1',
				rules: [{
					backendPort: 80,
					backendProtocol: "http",
					frontendPort: 80,
					frontendProtocol: "http"
				},
					{
						backendPort: 443,
						backendProtocol: "https",
						frontendPort: 443,
						frontendProtocol: "https",
						certificate: "arn"
					}],
				healthProbe: {
					maxSuccessAttempts: 2,
					healthProbeInterval: 30,
					healthProbePath: "/png",
					healthProbeProtocol: "HTTP",
					healthProbePort: "80",
					healthProbeTimeout: 3,
					maxFailureAttempts: 2
				},
				securityGroups: ["securityGroups"],
				subnets: ["subnets"],
				zones: ["zone"],
				type: "internal",
				tags: [{key: "Name", Value: "test-lb"}]
			};
			service.deleteLoadBalancer(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
