const async = require('async');
const fs = require('fs');
const AWS = require('aws-sdk');
const randomString = require("randomstring");
const config = require("../config");
const utils = require("../utils/utils");

function getConnector(opts) {
	return utils.getConnector(opts, config);
	// AWS.config.update({
	// 	credentials: {
	// 		accessKeyId: opts.keyId,
	// 		secretAccessKey: opts.secretAccessKey
	// 	},
	// 	region: opts.region || config.api.region
	// });
	//
	// switch (opts.api) {
	// 	case 'ec2':
	// 		return new AWS.EC2({apiVersion: '2016-11-15'});
	// 	case 'elb':
	// 		return new AWS.ELB({apiVersion: '2015-12-01'});
	// 	default:
	// 		return new AWS.EC2({apiVersion: '2016-11-15'});
	// }
}


const AWSLB = {
	
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
		else{
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
		options.params.info = options.infra.info;
		if (ports.length === 0) {
			return cb(null, true);
		}
		
		let stack = options.infra.stack;
		//service is found in project record
		if (stack.loadBalancers && stack.loadBalancers[options.params.envCode.toUpperCase()] && stack.loadBalancers[options.params.envCode.toUpperCase()][service]) {
			//service have ports to be exposed
			//update listeners
			if (ports[0].published) {
				let listener = {};
				let listeners = [];
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
					}
					listeners.push(listener);
				}
				options.params.name = service;
				options.params.listener = listeners;
				options.params.ElbName = stack.loadBalancers[options.params.envCode.toUpperCase()][service].name;
				
				AWSLB.updateExternalLB(options, function (err) {
					return cb(err, true);
				});
			}
			//service have no ports to be exposed
			//delete load balancer
			else {
				options.params.name = service;
				options.params.ElbName = stack.loadBalancers[options.params.envCode.toUpperCase()][service].name;
				AWSLB.deleteExternalLB(options, function (err) {
					return cb(err, true);
				});
			}
		}
		//service is not found in project record
		else {
			//service have ports to be exposed
			let listener = {};
			if (ports[0].published) {
				let listeners = [];
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
					}
					listeners.push(listener);
				}
				if (listeners.length === 0) {
					return cb(null, true);
				}
				
				options.params.name = service;
				options.params.listener = listeners;
				AWSLB.deployExternalLb(options, function (err) {
					return cb(err, true);
				});
			}
			else {
				//do nothing
				return cb(null, true);
			}
		}
	},
	
	/**
	 * This method creates an external a load balancer
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"deployExternalLb": function (options, mCb) {
		options.params.info = options.infra.info;
		const opts = {
			listener : options.params.listener,
			name : options.params.name
		};
		const stack = options.infra.stack;
		const envCode = options.params.envCode.toUpperCase();
		
		if(!options.params.info || options.params.info.length === 0){
			return mCb(new Error("Did not find any deployment information in infra details provided!"));
		}
		
		const aws = options.infra.api;
		const elb = getConnector({
			api: 'elb',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const ec2 = getConnector({
			api: 'ec2',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let name = `ht${options.params.soajs_project}-External-`; //ht + projectname + service name
		
		let random = randomString.generate({
			length: 31 - name.length,
			charset: 'alphanumeric',
			capitalization: 'uppercase'
		});
		name += random;
		let lbParams = {
			Listeners: opts.listener,
			LoadBalancerName: name,
			SecurityGroups: [
				stack.options.ExternalLBSecurityGroupID
			],
			Subnets: stack.options.ZonesAvailable,
			Tags: [
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
		options.soajs.log.debug(lbParams);
		elb.createLoadBalancer(lbParams, function (err, loadBalancer) {
			if (err) {
				return mCb(err);
			}
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
					return mCb(err);
				}
				else {
					for (let i = 0; i < instances.Reservations.length; i++) {
						for (let y = 0; y < instances.Reservations[i].Instances.length; y++) {
							instanceIds.push({InstanceId: instances.Reservations[i].Instances[y].InstanceId});
						}
					}
					if (instanceIds.length === 0) {
						return mCb(new Error("No instances found in stack"));
					}
					const registerParams = {
						Instances: instanceIds,
						LoadBalancerName: name
					};
					elb.registerInstancesWithLoadBalancer(registerParams, function (err) {
						if (err) {
							return mCb(err);
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
						deployment[options.params.info[2]].loadBalancers[envCode][opts.name] = {
							name: name,
							DNSName: loadBalancer.DNSName,
							ports: options.params.ports
						};
						options.infra.deployments = deployment;
						return mCb(null, true);
					});
				}
			});
		});
	},
	
	/**
	 * This method updates a load balancer
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"updateExternalLB": function (options, mCb) {
		options.params.info = options.infra.info;
		const envCode = options.params.envCode.toUpperCase();
		const opts = {
			listener : options.params.listener,
			name : options.params.name,
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
			LoadBalancerNames: [opts.ElbName]
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
						LoadBalancerName: opts.ElbName,
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
					LoadBalancerName: opts.ElbName
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
					LoadBalancerName: opts.ElbName
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
	 * This method  deletes a load balancer
	 * @param options
	 * @param mCb
	 * @returns {*}
	 */
	"deleteExternalLB": function (options, mCb) {
		options.params.info = options.infra.info;
		const opts = {
			name : options.params.name,
			ElbName: options.params.ElbName
		};
		const stack = options.infra.stack;
		const aws = options.infra.api;
		const elb = getConnector({
			api: 'elb',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			LoadBalancerName: opts.ElbName
		};
		options.soajs.log.debug(params);
		elb.deleteLoadBalancer(params, function (err) {
			if (err) {
				return mCb(err);
			}
			else {
				const envCode = options.params.envCode.toUpperCase();
				if (options.infra.deployments && options.infra.deployments[options.params.info[2]]
					&& options.infra.deployments[options.params.info[2]].loadBalancers
					&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode]
					&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name]) {
					delete options.infra.deployments[options.params.info[2]].loadBalancers[envCode][opts.name];
				}
				return mCb(null, true);
			}
		});
	},
};

module.exports = AWSLB;