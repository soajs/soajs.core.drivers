const randomString = require("randomstring");
const async = require('async');
const config = require("../config");
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');
const _ = require('lodash');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

function getElbMethod(type, action, cb) {
	let method, api, helper;
	switch (type) {
		case 'classic':
			switch (action) {
				case 'list':
					method = "describeLoadBalancers";
					helper = "buildClassicLbRecord";
					break;
				case 'create':
					method = "createLoadBalancer";
					helper = "N/A";
					break;
				case 'update':
					method = "describeLoadBalancers";
					helper = "N/A";
					break;
				case 'healthCheck':
					method = "configureHealthCheck";
					helper = "N/A";
					break;
				case 'delete':
					method = "deleteLoadBalancer";
					helper = "N/A";
					break;
			}
			api = 'elb';
			break;
	}
	return cb({method, api, helper});
}

const AWSLB = {
	/**
	 *  This method return a list of Load Balancers
	 * @param options
	 * @param mCb
	 */
	"list": function (options, mCb) {
		const aws = options.infra.api;
		getElbMethod(options.params.elbType || 'classic', 'list', (elbResponse) => {
			const elb = getConnector({
				api: elbResponse.api,
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			const ec2 = getConnector({
				api: 'ec2',
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			elb[elbResponse.method]({}, function (err, response) {
				if (err) {
					return mCb(err);
				}
				async.map(response.LoadBalancerDescriptions, function (lb, callback) {
					async.parallel({
						subnets: function (callback) {
							if (lb && lb.Subnets && Array.isArray(lb.Subnets) && lb.Subnets.length > 0) {
								let sParams = {SubnetIds: lb.Subnets};
								ec2.describeSubnets(sParams, callback);
							}
							else {
								return callback(null, null);
							}
						},
						instances: function (callback) {
							let iParams = {LoadBalancerName: lb.LoadBalancerName};
							elb.describeInstanceHealth(iParams, callback);
						}
					}, function (err, results) {
						return callback(err, helper[elbResponse.helper]({
							lb,
							region: options.params.region,
							subnets: results.subnets ? results.subnets.Subnets : [],
							instances: results.instances ? results.instances.InstanceStates : []
						}));
					});
				}, mCb);
			});
		});
	},
	
	/**
	 * This method returns the instruction to update the dns to link the domain of this environment
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"getDNSInfo": function (options, mCb) {
		let stack = options.infra.stack;
		let ipAddress;
		
		if (stack && stack.loadBalancers && stack.loadBalancers[options.soajs.registry.code.toUpperCase()] && stack.loadBalancers[options.soajs.registry.code.toUpperCase()]["nginx"]) {
			ipAddress = stack.loadBalancers[options.soajs.registry.code.toUpperCase()]["nginx"].name;
			let response = {
				"id": stack.id,
				"dns": {
					"msg": "<table>" +
						"<thead>" +
						"<tr><th>Field Type</th><th>Field Value</th></tr>" +
						"</thead>" +
						"<tbody>" +
						"<tr><td>DNS Type</td><td>CNAME</td></tr>" +
						"<tr class='even'><td>Domain Value</td><td>%domain%</td></tr>" +
						"<tr><td>IP Address</td><td>" + ipAddress + "</td></tr>" +
						"<tr class='even'><td>TTL</td><td>5 minutes</td></tr>" +
						"</tbody>" +
						"</table>"
				}
			};
			return mCb(null, response);
		}
		else {
			return mCb(null, {"id": stack.id});
		}
	},
	
	/**
	 * This method add service published ports to ELB listeners
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"publishPorts": function (options, cb) {
		/**
		 ==> service found in project
		 //service already has a load balancer
		 ==> case 1: ports in recipe are different than load balancer
		 ==> trigger update load balancer exposed ports
		 ==> case 2: ports in recipe are the same in load balancer
		 ==> don’t do anything
		 ==> case 3: no exposed ports in recipe but load balancer has exposed ports
		 ==> delete load balancer
		 
		 ==> service not found in project
		 ==> case1: service has no load balancer, creating load balancer for the first time
		 ==> case2: service has no load balancer, but it is being redeployed with exposed ports
		 ==> iza fi exposed ports aw ispublished true, then create and expose load balancer
		 * */
			
			//get the service
		let service = options.params.name;
		let ports = options.params.ports;
		const stack = options.infra.stack;
		const envCode = options.params.envCode.toUpperCase();
		
		options.params.info = options.infra.info;
		let listeners = [];
		options.params.ElbName = null;
		if (stack.loadBalancers && options.params.envCode.toUpperCase() && stack.loadBalancers[options.params.envCode.toUpperCase()] && stack.loadBalancers[options.params.envCode.toUpperCase()][service]) {
			options.params.ElbName = stack.loadBalancers[options.params.envCode.toUpperCase()][service];
		}
		if (ports.length === 0 && !options.params.ElbName) {
			return cb(null, true);
		}
		if (ports[0] && ports[0].published) {
			for (let i = 0; i < ports.length; i++) {
				let listener = {
					backendPort: ports[i].published,
					backendProtocol: "TCP",
					frontendPort: ports[i].target,
					frontendProtocol: "TCP",
				};
				if (ports[i].target === 80) {
					listener.frontendProtocol = 'HTTP';
					listener.backendProtocol = 'HTTP';
				}
				listeners.push(listener);
			}
		}
		
		options.params.region = stack.options.zone;
		options.params.rules = listeners;
		//service is found in project record
		if (options.params.ElbName) {
			//service have ports to be exposed
			//update listeners
			
			if (listeners.length > 0) {
				AWSLB.updateExternalLB(options, function (err) {
					return cb(err, true);
				});
			}
			//service have no ports to be exposed
			//delete load balancer
			else {
				if (!options.params.ElbName.name) {
					return cb(null, true);
				}
				else {
					options.params.name = options.params.ElbName.name;
				}
				AWSLB.delete(options, function (err) {
					if (err) {
						return cb(err);
					}
					else {
						options.params.info = options.infra.info;
						const envCode = options.params.envCode.toUpperCase();
						options.params.name = service;
						if (options.infra.deployments && options.infra.deployments[options.params.info[2]]
							&& options.infra.deployments[options.params.info[2]].loadBalancers
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode]
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode][service]) {
							delete options.infra.deployments[options.params.info[2]].loadBalancers[envCode][service];
						}
						return cb(null, true);
					}
				});
			}
		}
		//service is not found in project record
		else {
			//service have ports to be exposed
			if (listeners.length > 0) {
				if (!options.params.info || options.params.info.length === 0) {
					return cb(new Error("Did not find any deployment information in infra details provided!"));
				}
				const aws = options.infra.api;
				const ec2 = getConnector({
					api: 'ec2',
					region: stack.options.zone,
					keyId: aws.keyId,
					secretAccessKey: aws.secretAccessKey
				});
				const elb = getConnector({
					api: 'elb',
					region: stack.options.zone,
					keyId: aws.keyId,
					secretAccessKey: aws.secretAccessKey
				});
				
				let name = `ht${options.params.soajs_project}-External-`; //ht + projectname + service name
				
				name += randomString.generate({
					length: 31 - name.length,
					charset: 'alphanumeric',
					capitalization: 'uppercase'
				});
				let lbParams = {
					rules: listeners,
					name: name,
					securityGroups: [
						stack.options.ExternalLBSecurityGroupID
					],
					tags: [
						{
							Key: 'ht:cloudformation:stack-name', /* required */
							Value: stack.name
						},
						{
							Key: 'ht:cloudformation:stack-id', /* required */
							Value: stack.id
						},
						{
							Key: 'Type', /* required */
							Value: "External"
						},
						{
							Key: 'Name', /* required */
							Value: name
						}
					]
				};
				if (stack.options.ZonesAvailable) {
					if (!Array.isArray(stack.options.ZonesAvailable)) {
						lbParams.subnets = [stack.options.ZonesAvailable];
					}
					else {
						lbParams.subnets = stack.options.ZonesAvailable;
					}
				}
				lbParams.region = stack.options.zone;
				options.soajs.log.debug(lbParams);
				let params = JSON.parse(JSON.stringify(options.params));
				options.params = lbParams;
				AWSLB.create(options, function (err, loadBalancer) {
					if (err) {
						return cb(err);
					}
					options.params = params;
					const instanceParams = {
						Filters: [
							{
								Name: 'tag:aws:cloudformation:stack-name',
								Values: [
									stack.name
								]
							}
						]
					};
					let instanceIds = [];
					ec2.describeInstances(instanceParams, function (err, instances) {
						if (err) {
							return cb(err);
						}
						else {
							for (let i = 0; i < instances.Reservations.length; i++) {
								for (let y = 0; y < instances.Reservations[i].Instances.length; y++) {
									instanceIds.push({InstanceId: instances.Reservations[i].Instances[y].InstanceId});
								}
							}
							if (instanceIds.length === 0) {
								return cb(new Error("No instances found in stack"));
							}
							const registerParams = {
								Instances: instanceIds,
								LoadBalancerName: name
							};
							elb.registerInstancesWithLoadBalancer(registerParams, function (err) {
								if (err) {
									return cb(err);
								}
								
								//manipulate and add the record
								let deployment = options.infra.deployments;
								//if no loadBalancers object found create one
								if (!deployment[options.params.info[2]].loadBalancers) {
									deployment[options.params.info[2]].loadBalancers = {};
								}
								//if no environment in loadBalancers object found create one
								if (!deployment[options.params.info[2]].loadBalancers[envCode]) {
									deployment[options.params.info[2]].loadBalancers[envCode] = {};
								}
								deployment[options.params.info[2]].loadBalancers[envCode][options.params.name] = {
									name: name,
									DNSName: loadBalancer.DNSName,
									ports: options.params.ports
								};
								options.infra.deployments = deployment;
								return cb(null, true);
							});
						}
					});
				});
			}
			else {
				//do nothing
				return cb(null, true);
			}
		}
	},
	
	/**
	 * This method creates a load balancer
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"create": function (options, cb) {
		getElbMethod(options.params.elbType || 'classic', 'create', (elbResponse) => {
			const aws = options.infra.api;
			const elb = getConnector({
				api: elbResponse.api,
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			let params = {
				LoadBalancerName: options.params.name
			};
			params.Listeners = [];
			if (options.params.rules && options.params.rules.length > 0) {
				options.params.rules.forEach((port) => {
					let listener = {
						InstancePort: port.backendPort,
						InstanceProtocol: port.backendProtocol.toUpperCase(),
						LoadBalancerPort: port.frontendPort,
						Protocol: port.frontendProtocol.toUpperCase()
					};
					if (port.certificate) {
						listener.SSLCertificateId = port.certificate;
					}
					params.Listeners.push(listener);
				});
			}
			if (options.params.securityGroups) {
				params.SecurityGroups = options.params.securityGroups
			}
			if (options.params.subnets) {
				params.Subnets = options.params.subnets
			}
			if (options.params.zones) {
				params.AvailabilityZones = options.params.zones
			}
			if (options.params.type === 'internal') {
				params.Scheme = options.params.type
			}
			if (options.params.tags) {
				params.Tags = options.params.tags
			}
			if (params.Listeners.length === 0) {
				return cb(new Error("A load balancer must have at least one port open. "))
			}
			if (!params.AvailabilityZones && !params.Subnets) {
				return cb(new Error("Either Zones or Subnet must be specified."))
			}
			options.soajs.log.debug(params);
			elb[elbResponse.method](params, (err, lbResponse) => {
				if (err) {
					return cb(err);
				}
				else {
					if (options.params.healthProbe) {
						params = {
							HealthCheck: {},
							LoadBalancerName: options.params.name
						};
						params.HealthCheck.Target = "";
						if (options.params.healthProbe.healthProbeProtocol && options.params.healthProbe.healthProbePort) {
							params.HealthCheck.Target += options.params.healthProbe.healthProbeProtocol.toUpperCase();
							params.HealthCheck.Target += ":" + options.params.healthProbe.healthProbePort;
							if (options.params.healthProbe.healthProbeProtocol.toUpperCase() === "HTTP" || options.params.healthProbe.healthProbePort.toUpperCase() === "HTTPS") {
								if (options.params.healthProbe.healthProbePath) {
									params.HealthCheck.Target += options.params.healthProbe.healthProbePath;
								}
								else {
									return cb(new Error("A path must be specified for protocols HTTP/HTTPS, when creating a LoadBalancer Health Check."));
								}
							}
						}
						if (params.HealthCheck.Target === "") {
							return cb(new Error("A Health Check Path must be specified!"));
						}
						if (options.params.healthProbe.healthProbeInterval) {
							params.HealthCheck.Interval = options.params.healthProbe.healthProbeInterval;
						}
						if (options.params.healthProbe.healthProbeTimeout) {
							params.HealthCheck.Timeout = options.params.healthProbe.healthProbeTimeout;
						}
						if (options.params.healthProbe.maxFailureAttempts) {
							params.HealthCheck.UnhealthyThreshold = options.params.healthProbe.maxFailureAttempts;
						}
						if (options.params.healthProbe.maxSuccessAttempts) {
							params.HealthCheck.HealthyThreshold = options.params.healthProbe.maxSuccessAttempts;
						}
						options.soajs.log.debug(params);
						getElbMethod('classic', 'healthCheck', (elbResponse) => {
							elb[elbResponse.method](params, (err) => {
								return cb(err, lbResponse);
							});
						});
					}
					else {
						return cb(null, lbResponse);
					}
				}
			});
		});
	},
	
	/**
	 * This method updates a load balancer connected to a service
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"updateExternalLB": function (options, mCb) {
		options.params.info = options.infra.info;
		const envCode = options.params.envCode.toUpperCase();
		const opts = {
			name: options.params.name,
			ElbName: options.params.ElbName
		};
		const stack = options.infra.stack;
		const aws = options.infra.api;
		const ports = options.params.ports;
		let deleted = [];
		const elb = getConnector({
			api: 'elb',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			LoadBalancerNames: [opts.ElbName.name]
		};
		elb.describeLoadBalancers(params, function (err, loadBalancer) {
			if (err) {
				return mCb(err);
			}
			else {
				let listenerDescriptions;
				//get listeners
				if (loadBalancer.LoadBalancerDescriptions && loadBalancer.LoadBalancerDescriptions.length > 0
					&& loadBalancer.LoadBalancerDescriptions[0].ListenerDescriptions
					&& loadBalancer.LoadBalancerDescriptions[0].ListenerDescriptions.length > 0) {
					listenerDescriptions = loadBalancer.LoadBalancerDescriptions[0].ListenerDescriptions;
				}
				//check if listener is found
				if (listenerDescriptions) {
					for (let s = 0; s < ports.length; s++) {
						for (let y = listenerDescriptions.length - 1; y >= 0; y--) {
							if (listenerDescriptions[y] && listenerDescriptions[y].Listener && listenerDescriptions[y].Listener.LoadBalancerPort) {
								if (ports[s].target === listenerDescriptions[y].Listener.LoadBalancerPort &&
									ports[s].published === listenerDescriptions[y].Listener.InstancePort) {
									listenerDescriptions.splice(y, 1);
								}
							}
						}
					}
					//get list of listeners to be deleted
					if (listenerDescriptions.length > 0) {
						listenerDescriptions.forEach(function (oneListen) {
							deleted.push(oneListen.Listener.LoadBalancerPort)
						});
					}
				}
				if (deleted.length > 0) {
					let deletedParams = {
						LoadBalancerName: opts.ElbName.name,
						LoadBalancerPorts: deleted
					};
					options.soajs.log.debug(deletedParams);
					//delete unused listeners
					elb.deleteLoadBalancerListeners(deletedParams, function (err) {
						if (err) {
							return mCb(err);
						}
						else {
							updateListeners();
						}
					});
				}
				else {
					updateListeners();
				}
			}
			
			function updateListeners() {
				let listener = {};
				params = {
					Listeners: [],
					LoadBalancerName: opts.ElbName.name
				};
				let healthCheckPort;
				for (let i = 0; i < ports.length; i++) {
					listener = {
						InstancePort: ports[i].published,
						InstanceProtocol: "TCP",
						LoadBalancerPort: ports[i].target,
						Protocol: "TCP",
					};
					if (ports[i].target === 80) {
						listener.Protocol = 'HTTP';
						listener.InstanceProtocol = 'HTTP';
						healthCheckPort = listener.InstancePort;
					}
					params.Listeners.push(listener);
				}
				if (!healthCheckPort) {
					healthCheckPort = params.Listeners[0].InstancePort;
				}
				options.soajs.log.debug(params);
				elb.createLoadBalancerListeners(params, function (err) {
					if (err) {
						return mCb(err);
					}
					//check if health check port is deleted ==> if yes update the health check
					if (loadBalancer.LoadBalancerDescriptions[0].HealthCheck && loadBalancer.LoadBalancerDescriptions[0].HealthCheck.Target
						&& loadBalancer.LoadBalancerDescriptions[0].HealthCheck.Target.split(":")[1]
						&& deleted.indexOf(loadBalancer.LoadBalancerDescriptions[0].HealthCheck.Target.split(":")[1]) === -1) {
						updateHealthCheck(elb, healthCheckPort, function (err) {
							if (err) {
								return mCb(err);
							}
							//update the exposed ports of the service //check if db was tampered with
							if (options.infra.deployments && options.infra.deployments[options.params.info[2]]
								&& options.infra.deployments[options.params.info[2]].loadBalancers
								&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode]
								&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name]) {
								options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name].ports = ports;
							}
							return mCb(null, true);
						});
					}
					else {
						//update the exposed ports of the service //check if db was tampered with
						if (options.infra.deployments && options.infra.deployments[options.params.info[2]]
							&& options.infra.deployments[options.params.info[2]].loadBalancers
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode]
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name]) {
							options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name].ports = ports;
						}
						return mCb(null, true);
					}
				});
			}
			
			function updateHealthCheck(elb, healthCheckPort, cb) {
				let healthCheckParams = {
					HealthCheck: loadBalancer.LoadBalancerDescriptions[0].HealthCheck,
					LoadBalancerName: opts.ElbName.name
				};
				if (healthCheckPort === 80) {
					healthCheckParams.HealthCheck.Target = "HTTP:80/";
				}
				else {
					healthCheckParams.HealthCheck.Target = `TCP:${healthCheckPort}`;
				}
				options.soajs.log.debug(healthCheckParams);
				elb.configureHealthCheck(healthCheckParams, function (err) {
					return cb(err, true);
				});
			}
		});
	},
	
	/**
	 * This method updates a load balancer connected to a service
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"update": function (options, mCb) {
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#describeLoadBalancers-property
		
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#createLoadBalancerListeners-property
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#deleteLoadBalancerListeners-property
		
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#attachLoadBalancerToSubnets-property
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#detachLoadBalancerFromSubnets-property
		
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#applySecurityGroupsToLoadBalancer-property
		
		//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELB.html#configureHealthCheck-property
		const aws = options.infra.api;
		getElbMethod(options.params.elbType || 'classic', 'update', (elbResponse) => {
			const elb = getConnector({
				api: elbResponse.api,
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			elb[elbResponse.method]({LoadBalancerNames: [options.params.name]}, function (err, response) {
				if (err) {
					return mCb(err);
				}
				if (response && response.LoadBalancerDescriptions && response.LoadBalancerDescriptions.length > 0) {
					let lb = response.LoadBalancerDescriptions[0];
					
					async.parallel({
						listeners: (callback) => {
							let addListeners = {
								LoadBalancerName: lb.LoadBalancerName,
								Listeners: [],
							}, deleteListeners = {
								LoadBalancerName: lb.LoadBalancerName,
								LoadBalancerPorts: [],
							};
							let certificates = [];
							async.parallel({
								//get ports needed to be added
								add: (call) => {
									async.each(options.params.rules, (rule, ruleCB) => {
										let found = false;
										async.each(lb.ListenerDescriptions, (port, listenersCB) => {
											if (rule.frontendPort === port.Listener.LoadBalancerPort &&
												rule.backendPort === port.Listener.InstancePort
												&& rule.frontendProtocol.toUpperCase() === port.Listener.Protocol.toUpperCase()
												&& rule.backendProtocol.toUpperCase() === port.Listener.InstanceProtocol.toUpperCase()) {
												found = true;
												if (rule.certificate !== port.Listener.SSLCertificateId) {
													certificates.push({
														LoadBalancerName: options.params.name, /* required */
														LoadBalancerPort: port.Listener.LoadBalancerPort, /* required */
														SSLCertificateId: rule.certificate /* required */
													});
												}
											}
											listenersCB();
										}, () => {
											if (!found) {
												//add
												let listenerObj = {
													"Protocol": rule.frontendProtocol.toUpperCase(),
													"LoadBalancerPort": rule.frontendPort,
													"InstanceProtocol": rule.backendProtocol.toUpperCase(),
													"InstancePort": rule.backendPort
												};
												
												if (rule.certificate) {
													listenerObj.SSLCertificateId = rule.certificate;
												}
												addListeners.Listeners.push(listenerObj);
											}
											ruleCB();
										});
									}, call);
								},
								//get ports needed to be deleted
								delete: (call) => {
									async.each(lb.ListenerDescriptions, (port, listenersCB) => {
										let found = false;
										async.each(options.params.rules, (rule, ruleCB) => {
											if (rule.frontendPort === port.Listener.LoadBalancerPort &&
												rule.backendPort === port.Listener.InstancePort
												&& rule.frontendProtocol.toUpperCase() === port.Listener.Protocol.toUpperCase()
												&& rule.backendProtocol.toUpperCase() === port.Listener.InstanceProtocol.toUpperCase()) {
												found = true;
											}
											ruleCB();
										}, () => {
											if (!found) {
												//delete
												deleteListeners.LoadBalancerPorts.push(port.Listener.LoadBalancerPort);
											}
											listenersCB();
										});
									}, call);
								}
							}, () => {
								async.series({
									updateCertificate: (call) => {
										if (certificates.length > 0) {
											async.each(certificates, (certificate, miniCb) => {
												elb.setLoadBalancerListenerSSLCertificate(certificate, miniCb)
											}, call);
										}
										else {
											return call();
										}
									},
									delete: (call) => {
										if (deleteListeners.LoadBalancerPorts.length === 0) {
											return call();
										}
										elb.deleteLoadBalancerListeners(deleteListeners, call)
									},
									add: (call) => {
										if (addListeners.Listeners.length === 0) {
											return call();
										}
										elb.createLoadBalancerListeners(addListeners, call)
									}
								}, callback);
							});
						},
						subnets: (callback) => {
							let subnets = [];
							options.params.subnets.forEach((oneSubnet) => {
								subnets.push(oneSubnet);
							});
							let subnetsToDelete = _.differenceBy(lb.Subnets, subnets);
							let subnetsToAdd = _.differenceBy(subnets, lb.Subnets);
							async.series({
								delete: (call) => {
									if (subnetsToDelete.length === 0) {
										return call();
									}
									elb.detachLoadBalancerFromSubnets({
										LoadBalancerName: lb.LoadBalancerName,
										Subnets: subnetsToDelete
									}, call)
								},
								add: (call) => {
									if (subnetsToAdd.length === 0) {
										return call();
									}
									elb.attachLoadBalancerToSubnets({
										LoadBalancerName: lb.LoadBalancerName,
										Subnets: subnetsToAdd
									}, call)
								}
							}, callback);
						},
						securityGroups: (callback) => {
							if (_.differenceBy(lb.SecurityGroups, options.params.securityGroups).length > 0 || _.differenceBy(options.params.securityGroups, lb.SecurityGroups).length > 0) {
								elb.applySecurityGroupsToLoadBalancer(
									{
										LoadBalancerName: lb.LoadBalancerName,
										SecurityGroups: options.params.securityGroups
									}, callback);
							}
							else {
								return callback();
							}
						},
						healthCheck: (callback) => {
							if (options.params.healthProbe) {
								let healthProbePath = "";
								if (options.params.healthProbe.healthProbeProtocol && options.params.healthProbe.healthProbePort) {
									healthProbePath += options.params.healthProbe.healthProbeProtocol.toUpperCase();
									healthProbePath += ":" + options.params.healthProbe.healthProbePort;
									if (options.params.healthProbe.healthProbeProtocol.toUpperCase() === "HTTP" || options.params.healthProbe.healthProbeProtocol.toUpperCase() === "HTTPS") {
										if (options.params.healthProbe.healthProbePath) {
											healthProbePath += options.params.healthProbe.healthProbePath;
										}
										else {
											return callback(new Error("A path must be specified for protocols HTTP/HTTPS, when creating a LoadBalancer Health Check."));
										}
									}
								}
								if (healthProbePath === "") {
									return callback(new Error("A Health Check Path must be specified!"));
								}
								if (healthProbePath !== lb.HealthCheck.Target
									|| options.params.healthProbe.healthProbeInterval !== lb.HealthCheck.Interval
									|| options.params.healthProbe.healthProbeTimeout !== lb.HealthCheck.Timeout
									|| options.params.healthProbe.maxFailureAttempts !== lb.HealthCheck.UnhealthyThreshold
									|| options.params.healthProbe.maxSuccessAttempts !== lb.HealthCheck.HealthyThreshold) {
									elb.configureHealthCheck({
										LoadBalancerName: lb.LoadBalancerName,
										HealthCheck: {
											Target: healthProbePath,
											Interval: options.params.healthProbe.healthProbeInterval,
											Timeout: options.params.healthProbe.healthProbeTimeout,
											UnhealthyThreshold: options.params.healthProbe.maxFailureAttempts,
											HealthyThreshold: options.params.healthProbe.maxSuccessAttempts,
										}
									}, callback);
								}
								else {
									return callback();
								}
							}
							else {
								return callback();
							}
						}
					}, mCb);
				}
				else {
					return mCb(new Error("Load balancer not found!"));
				}
			});
		});
	},
	
	/**
	 * This method  deletes a load balancer
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"delete": function (options, mCb) {
		getElbMethod(options.params.elbType || 'classic', 'delete', (elbResponse) => {
			const aws = options.infra.api;
			const elb = getConnector({
				api: elbResponse.api,
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			let params = {
				LoadBalancerName: options.params.name
			};
			options.soajs.log.debug(params);
			elb[elbResponse.method](params, mCb);
		});
	},
};

module.exports = AWSLB;
