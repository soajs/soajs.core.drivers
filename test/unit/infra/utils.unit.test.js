"use strict";
const fs = require('fs');
const helper = require("../../helper.js");
const assert = require('assert');
const sinon = require('sinon');

const driver = helper.requireModule('./infra/utils.js');
let dD = require('../../schemas/utils.js');

describe("testing /infra/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("calling updateEnvSettings", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		let options = dD();
		
		//nginx special test + https
		it("Success", function (done) {
			
			let attempts = 0;
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					env: [
						"SOAJS_NX_API_HTTPS=true"
					],
					ports: [
						{
							published: 30080,
							target: 80
						},
						{
							published: 30443,
							target: 443
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					let inspectedService = JSON.parse(JSON.stringify(deployedServiceDetails));
					if(attempts === 0){
						attempts++;
						inspectedService.service.ports.forEach((onePort) => {
							delete onePort.published;
						});
						return cb(null, inspectedService);
					}
					else{
						return cb(null, inspectedService);
					}
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.inputmaskData = {
				soajs_project: 'local'
			};
			
			options.params.catalog = {
				"name" : "Nginx Recipe",
				"type" : "server",
				"subtype" : "nginx",
				"description" : "This recipe allows you to deploy an nginx server",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "nginx",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 80,
								"isPublished" : true,
								"preserveClientIP" : true
							},
							{
								"name" : "https",
								"target" : 443,
								"isPublished" : true,
								"preserveClientIP" : true
							}
						]
					}
				}
			};
			options.soajs.registry.protocol = 'http';
			options.soajs.registry.port = 80;
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error) {
				assert.ifError(error);
				done();
			});
		});
		
		//nginx special test + http
		it("Success", function (done) {
			
			let attempts = 0;
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: 30080,
							target: 80
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					let inspectedService = JSON.parse(JSON.stringify(deployedServiceDetails));
					if(attempts === 0){
						attempts++;
						inspectedService.service.ports.forEach((onePort) => {
							delete onePort.published;
						});
						return cb(null, inspectedService);
					}
					else{
						return cb(null, inspectedService);
					}
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.inputmaskData = {
				soajs_project: 'local'
			};
			
			options.params.catalog = {
				"name" : "Nginx Recipe",
				"type" : "server",
				"subtype" : "nginx",
				"description" : "This recipe allows you to deploy an nginx server",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "nginx",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 80,
								"isPublished" : true,
								"preserveClientIP" : true
							}
						]
					}
				}
			};
			options.soajs.registry.protocol = 'http';
			options.soajs.registry.port = 80;
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error) {
				assert.ifError(error);
				done();
			});
		});
		
		//not nginx test
		it("Success", function (done) {
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'service',
						'soajs.service.subtype': 'soajs',
						'soajs.service.name': 'controller',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: 30400,
							target: 4000
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					return cb(null, JSON.parse(JSON.stringify(deployedServiceDetails)));
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.inputmaskData = {
				soajs_project: 'local'
			};
			
			options.params.catalog = {
				"name" : "Service Recipe",
				"type" : "service",
				"subtype" : "soajs",
				"description" : "test description",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "soajs",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 4000,
								"isPublished" : true,
								"preserveClientIP" : true
							}
						]
					}
				}
			};
			
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error) {
				assert.ifError(error);
				done();
			});
		});
		
		//invalid catalog
		it("Success", function (done) {
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'service',
						'soajs.service.subtype': 'soajs',
						'soajs.service.name': 'controller',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: 30400,
							target: 4000
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					return cb(null, JSON.parse(JSON.stringify(deployedServiceDetails)));
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.catalog = {
				"name" : "Nginx Recipe",
				"type" : "server",
				"subtype" : "nginx",
				"description" : "This recipe allows you to deploy an nginx server",
				"recipe" : null
			};
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error, response) {
				assert.ifError(error);
				done();
			});
		});
		
		//catalog has no published ports
		it("Success", function (done) {
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'service',
						'soajs.service.subtype': 'soajs',
						'soajs.service.name': 'controller',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: 30400,
							target: 4000
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					return cb(null, JSON.parse(JSON.stringify(deployedServiceDetails)));
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.catalog = {
				"name" : "Nginx Recipe",
				"type" : "server",
				"subtype" : "nginx",
				"description" : "This recipe allows you to deploy an nginx server",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "nginx",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 80
							},
							{
								"name" : "https",
								"target" : 443
							}
						]
					}
				}
			};
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error, response) {
				assert.ifError(error);
				done();
			});
		});
		
		//not nginx and no published ports in catalog
		it("Success", function (done) {
			
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'service',
						'soajs.service.subtype': 'soajs',
						'soajs.service.name': 'controller',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					ports: [
						{
							published: 30400,
							target: 4000
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					return cb(null, JSON.parse(JSON.stringify(deployedServiceDetails)));
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.inputmaskData = {
				soajs_project: 'local'
			};
			
			options.params.catalog = {
				"name" : "Service Recipe",
				"type" : "service",
				"subtype" : "soajs",
				"description" : "test description",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "soajs",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 4000
							}
						]
					}
				}
			};
			
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error) {
				assert.ifError(error);
				done();
			});
		});
		
		//inspect service returned and error
		it("Success", function (done) {
			let deployedServiceDetails = {
				service:{
					id: '1234567890',
					labels: {
						'soajs.service.type': 'server',
						'soajs.service.subtype': 'nginx',
						'soajs.service.name': 'nginx',
						'soajs.service.version': '1',
					},
					servicePortType: 'loadBalancer',
					env: [
						"SOAJS_NX_API_HTTPS=true"
					],
					ports: [
						{
							published: 30080,
							target: 80
						},
						{
							published: 30443,
							target: 443
						}
					]
				}
			};
			
			let containerDriver = {
				inspectService: (params, cb) => {
					return cb(new Error("Service not found!"))
				}
			};
			
			let cluster = {
				publishPorts: (params, cb) => {
					return cb(null, true);
				}
			};
			
			options.params.inputmaskData = {
				soajs_project: 'local'
			};
			
			options.params.catalog = {
				"name" : "Nginx Recipe",
				"type" : "server",
				"subtype" : "nginx",
				"description" : "This recipe allows you to deploy an nginx server",
				"recipe" : {
					"deployOptions" : {
						"image" : {
							"prefix" : "soajsorg",
							"name" : "nginx",
							"tag" : "latest",
							"pullPolicy" : "IfNotPresent"
						},
						"sourceCode" : {},
						"certificates" : "optional",
						"readinessProbe" : {},
						"restartPolicy" : {
							"condition" : "any",
							"maxAttempts" : 5
						},
						"container" : {
							"network" : "soajsnet",
							"workingDir" : "/opt/soajs/deployer/"
						},
						"voluming" : [],
						"ports" : [
							{
								"name" : "http",
								"target" : 80,
								"isPublished" : true,
								"preserveClientIP" : true
							},
							{
								"name" : "https",
								"target" : 443,
								"isPublished" : true,
								"preserveClientIP" : true
							}
						]
					}
				}
			};
			options.soajs.registry.protocol = 'http';
			options.soajs.registry.port = 80;
			driver.updateEnvSettings(containerDriver, cluster, options, deployedServiceDetails, function (error) {
				assert.ok(error);
				done();
			});
		});
	});
});