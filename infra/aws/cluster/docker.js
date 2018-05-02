"use strict";
const AWS = require('aws-sdk');
const async = require("async");

const config = require("./config");
const randomString = require("randomstring");

const Docker = require('dockerode');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function getConnector(opts) {
	AWS.config.update({
		credentials: {
			accessKeyId: opts.keyId,
			secretAccessKey: opts.secretAccessKey
		},
		region: opts.region || config.api.region
	});
	
	switch (opts.api) {
		case 'ec2':
			return new AWS.EC2({apiVersion: '2016-11-15'});
		case 'cloudFormation':
			return new AWS.CloudFormation({apiVersion: '2010-05-15'});
		case 'acm':
			return new AWS.ACM({apiVersion: "2016-11-15"});
		case 'elb':
			return new AWS.ELB({apiVersion: '2015-12-01'});
		default:
			return new AWS.EC2({apiVersion: '2016-11-15'});
	}
}

const driver = {
	
	/**
	 * method used to invoke aws api and deploy instances, security groups, configure load balancer & ip addresses
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
		
		let oneDeployment = {
			technology: "docker",
			options: {},
			environments:[],
			loadBalancers: {}
		};
		
		function generateToken(mCb) {
			options.soajs.log.debug("Generating docker token");
			require('crypto').randomBytes(1024, function (err, buffer) {
				if (err) {
					return mCb(err);
				}
				options.soajs.registry.deployer.container.docker.remote.apiProtocol = 'https';
				options.soajs.registry.deployer.container.docker.remote.apiPort = 32376;
				options.soajs.registry.deployer.container.docker.remote.auth = {
					token: buffer.toString('hex')
				};
				return mCb(null, true);
			});
		}
		
		function callAPI(mCb) {
			options.soajs.log.debug("Creating AWS Stack");
			//undefined://api./bridge
			let domain = options.params.protocol + "://" + options.params.apiPrefix + "." + options.params.domain + "/bridge";
			
			let aws = options.infra.api;
			let cloudFormation = getConnector({
				api: 'cloudFormation',
				region: options.params.region,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			oneDeployment.name = `ht${options.params.soajs_project}${randomString.generate({
				length: 13,
				charset: 'alphanumeric',
				capitalization: 'lowercase'
			})}`;
			
			if(!options.params.infraCodeTemplate){
				return mCb(new Error("Invalid or Cluster Template detected to create the cluster from!"));
			}
			
			const params = {
				StackName: oneDeployment.name,
				Capabilities: [
					'CAPABILITY_IAM'
				],
				OnFailure: 'DELETE',
				Parameters: [
					{
						ParameterKey: 'ProjectKey',
						ParameterValue: options.params.headers.key
					},
					{
						ParameterKey: 'ProjectName',
						ParameterValue: options.params.soajs_project
					},
					{
						ParameterKey: 'DriverName',
						ParameterValue: options.params.resource.driver
					},
					{
						ParameterKey: 'ApiDomain',
						ParameterValue: domain
					},
					{
						ParameterKey: 'ClusterSize',
						ParameterValue: options.params.workernumber.toString()
					},
					{
						ParameterKey: 'EnableCloudStorEfs',
						ParameterValue: (options.params.EnableCloudStorEfs) ? ' yes' : 'no'
					},
					{
						ParameterKey: 'EnableCloudWatchDetailedMonitoring',
						ParameterValue: (options.params.cloudwatchContainerMonitoring) ? ' yes' : 'no'
					},
					{
						ParameterKey: 'EnableCloudWatchLogs',
						ParameterValue: (options.params.cloudwatchContainerLogging) ? ' yes' : 'no'
					},
					{
						ParameterKey: 'EnableEbsOptimized',
						ParameterValue: (options.params.ebsIO) ? ' yes' : 'no'
					},
					{
						ParameterKey: 'EnableSystemPrune',
						ParameterValue: (options.params.enableDailyResourceCleanup) ? ' yes' : 'no'
					},
					{
						ParameterKey: 'InstanceType',
						ParameterValue: options.params.workerflavor
					},
					{
						ParameterKey: 'KeyName',
						ParameterValue: options.params.keyPair
					},
					{
						ParameterKey: 'ManagerDiskSize',
						ParameterValue: options.params.masterstorage.toString()
					},
					{
						ParameterKey: 'ManagerDiskType',
						ParameterValue: options.params.masterstoragetype
					},
					{
						ParameterKey: 'ManagerInstanceType',
						ParameterValue: options.params.masterflavor
					},
					{
						ParameterKey: 'ManagerSize',
						ParameterValue: options.params.masternumber.toString()
					},
					{
						ParameterKey: 'SwarmApiToken',
						ParameterValue: options.soajs.registry.deployer.container.docker.remote.auth.token,
					},
					{
						ParameterKey: 'WorkerDiskSize',
						ParameterValue: options.params.workerstorage.toString()
					},
					{
						ParameterKey: 'WorkerDiskType',
						ParameterValue: options.params.workerstoragetype
					}
				],
				TemplateURL: config.templateUrl + options.params.infraCodeTemplate
			};
			
			cloudFormation.createStack(params, function (err, response) {
				if (err) {
					return mCb(err);
				}
				else {
					oneDeployment.id = response.StackId;
					oneDeployment.environments = [options.env.toUpperCase()];
					oneDeployment.options.zone = options.params.region;
					oneDeployment.options.template = options.params.infraCodeTemplate;
					return mCb(null, true);
				}
			});
		}
		
		let stages = [generateToken, callAPI];
		async.series(stages, (error) => {
			if (error) {
				return cb(error);
			}
			return cb(null, oneDeployment);
		});
	},
	
	/**
	 * This method takes the id of the stack as an input and check if the stack has been deployed
	 * it returns the ip that can be used to access the machine
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatus": function (options, cb) {
		options.soajs.log.debug("Checking if Cluster is healthy ...");
		const aws = options.infra.api;
		let stack = options.infra.stack;
		
		let cloudFormation = getConnector({
			api: 'cloudFormation',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const param = {
			StackName: stack.name
		};
		
		//get the environment record
		if (options.soajs.registry.deployer.container.docker.remote.nodes && options.soajs.registry.deployer.container.docker.remote.nodes !== '') {
			let machineIp = options.soajs.registry.deployer.container.docker.remote.nodes;
			return cb(null, machineIp);
		}
		else{
			cloudFormation.describeStacks(param, function (err, response) {
				if (err) {
					return cb(err);
				}
				else {
					if (response && response.Stacks && response.Stacks.length > 0 && response.Stacks[0] && response.Stacks[0].StackStatus) {
						if ((response.Stacks[0].StackStatus === 'CREATE_COMPLETE' || response.Stacks[0].StackStatus === 'UPDATE_COMPLETE') && response.Stacks[0].Outputs && response.Stacks[0].Outputs.length > 0) {
							let out = {};
							for (let i = 0; i < response.Stacks[0].Outputs.length; i++) {
								if (response.Stacks[0].Outputs[i] && response.Stacks[0].Outputs[i].OutputKey === 'DefaultDNSTarget') {
									out.ip = response.Stacks[0].Outputs[i].OutputValue;
								}
								if (response.Stacks[0].Outputs[i] && response.Stacks[0].Outputs[i].OutputKey === 'ElbName') {
									stack.options.ElbName = response.Stacks[0].Outputs[i].OutputValue;
								}
								
								if (response.Stacks[0].Outputs[i] && response.Stacks[0].Outputs[i].OutputKey === 'ExternalLBSecurityGroupID') {
									stack.options.ExternalLBSecurityGroupID = response.Stacks[0].Outputs[i].OutputValue;
								}
								if (response.Stacks[0].Outputs[i] && response.Stacks[0].Outputs[i].OutputKey === 'ZonesAvailable') {
									stack.options.ZonesAvailable = response.Stacks[0].Outputs[i].OutputValue.split("|");
								}
							}
							
							if (out.ip && stack.options.ElbName) {
								options.soajs.registry.deployer.container.docker.remote.nodes = out.ip;
								
								
								options.soajs.log.debug("Creating SOAJS network.");
								const deployer = new Docker({
									protocol: options.soajs.registry.deployer.container.docker.remote.apiProtocol,
									port: options.soajs.registry.deployer.container.docker.remote.apiPort,
									host: out.ip,
									headers: {
										'token': options.soajs.registry.deployer.container.docker.remote.auth.token
									}
								});
								let networkParams = {
									Name: 'soajsnet',
									Driver: 'overlay',
									Internal: false,
									Attachable: true,
									CheckDuplicate: true,
									EnableIPv6: false,
									IPAM: {
										Driver: 'default'
									}
								};
								
								deployer.createNetwork(networkParams, (err) => {
									if (err && err.statusCode === 403) {
										return cb(null, out.ip);
									}
									return cb(err, out.ip);
								});
							}
							else {
								return cb(null, false);
							}
						}
						else if (response.Stacks[0].StackStatus === 'DELETE_IN_PROGRESS') {
							return cb(new Error('Error Creating Stack'));
						}
						else {
							return cb(null, false);
						}
					}
					else {
						return cb(null, false);
					}
				}
			});
		}
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
		if (!stack) {
			return mCb(null, {"id": stack.id});
		}
		
		if (stack.loadBalancers && stack.loadBalancers[options.soajs.registry.code.toUpperCase()] && stack.loadBalancers[options.soajs.registry.code.toUpperCase()]["nginx"]) {
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
	 * This method scales the deployment for the given cluster
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"scaleCluster": function (options, cb) {
		const stack = options.infra.stack;
		
		const aws = options.infra.api;
		const cloudFormation = getConnector({
			api: 'cloudFormation',
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
		const elb = getConnector({
			api: 'elb',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const params = {
			StackName: stack.name,
			Capabilities: [
				'CAPABILITY_IAM'
			],
			Parameters: [
				{
					ParameterKey: 'ProjectKey',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ProjectName',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'DriverName',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ApiDomain',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ClusterSize',
					ParameterValue: options.params.number.toString()
				},
				{
					ParameterKey: 'EnableCloudStorEfs',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'EnableCloudWatchDetailedMonitoring',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'EnableCloudWatchLogs',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'EnableEbsOptimized',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'EnableSystemPrune',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'InstanceType',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'KeyName',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ManagerDiskSize',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ManagerDiskType',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ManagerInstanceType',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'ManagerSize',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'SwarmApiToken',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'WorkerDiskSize',
					UsePreviousValue: true
				},
				{
					ParameterKey: 'WorkerDiskType',
					UsePreviousValue: true
				}
			],
			TemplateURL: config.templateUrl + stack.options.template
		};
		// get instance before update
		getInstances(function (err, instanceBefore) {
			if (err) {
				return cb(err);
			}
			options.soajs.log.debug(instanceBefore);
			cloudFormation.updateStack(params, function (err) {
				if (err) {
					return cb(err);
				}
				else {
					updateELB(instanceBefore);
					options.soajs.log.debug("Updating load balancers");
					return cb(null, true);
				}
			});
		});
		
		function updateELB(instanceBefore) {
			/**
			 * get external load balancers
			 * check if stack if ready
			 * once ready async parallal to all elb and update instances
			 *
			 */
				//get external load balancers
			let elbs = [];
			if (stack.loadBalancers && Object.keys(stack.loadBalancers).length > 0) {
				for (let oneEnv in stack.loadBalancers) {
					if (stack.loadBalancers[oneEnv] && Object.keys(stack.loadBalancers[oneEnv]).length > 0) {
						for (let oneService in stack.loadBalancers[oneEnv]) {
							if (stack.loadBalancers[oneEnv][oneService] && Object.keys(stack.loadBalancers[oneEnv][oneService]).length > 0) {
								elbs.push(stack.loadBalancers[oneEnv][oneService].name);
							}
						}
					}
				}
			}
			options.soajs.log.debug(elbs);
			if (elbs.length > 0) {
				let stackParams = {
					StackName: stack.name
				};
				checkStackStatus(stackParams, elbs, instanceBefore);
			}
		}
		
		function checkStackStatus(stackParams, elbs, instanceBefore) {
			cloudFormation.describeStacks(stackParams, function (err, res) {
				if (err) {
					//only log the error
					options.soajs.log.error(err);
				}
				else {
					//update done
					if (res.Stacks[0].StackStatus.indexOf("UPDATE_COMPLETE") !== -1) {
						addInstances(elbs, instanceBefore);
					}
					//update is in progress wait 10 seconds and then check
					else if (res.Stacks[0].StackStatus === "UPDATE_IN_PROGRESS") {
						options.soajs.log.debug("UPDATE_IN_PROGRESS");
						setTimeout(function () {
							checkStackStatus(stackParams, elbs, instanceBefore);
						}, 20000);
					}
					else {
						//log the status and stop
						options.soajs.log.error(new Error(`Stack status is ${res.Stacks[0].StackStatus}`));
					}
				}
			});
		}
		
		function getInstances(cb) {
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
			ec2.describeInstances(instanceParams, function (err, instances) {
				if (err) {
					return cb(err)
				}
				else {
					let instanceIds = [];
					for (let i = 0; i < instances.Reservations.length; i++) {
						for (let y = 0; y < instances.Reservations[i].Instances.length; y++) {
							instanceIds.push(instances.Reservations[i].Instances[y].InstanceId);
						}
					}
					return cb(null, instanceIds);
				}
			});
		}
		
		function addInstances(elbs, instanceBefore) {
			getInstances(function (err, instanceAfter) {
				if (err) {
					options.soajs.log.error(err);
				}
				const opts = compare(instanceBefore, instanceAfter);
				options.soajs.log.debug(opts);
				async.series([
					function (call) {
						//register instances
						if (opts.newInstances.length > 0) {
							async.each(elbs, function (oneElb, callback) {
								const registerParams = {
									Instances: opts.newInstances,
									LoadBalancerName: oneElb
								};
								elb.registerInstancesWithLoadBalancer(registerParams, callback);
								
							}, call);
						}
						else {
							return call(null, true);
						}
					},
					function (call) {
						//deregister instances
						if (opts.deleteInstances.length > 0) {
							async.each(elbs, function (oneElb, callback) {
								const registerParams = {
									Instances: opts.deleteInstances,
									LoadBalancerName: oneElb
								};
								elb.deregisterInstancesFromLoadBalancer(registerParams, callback);
							}, call);
						}
						else {
							return call(null, true);
						}
					}
				], function (err) {
					if (err) {
						options.soajs.log.error(err);
					}
					else {
						options.soajs.log.debug("External Load Balancers updated");
					}
				});
				
			});
		}
		
		function compare(instanceBefore, instanceAfter) {
			let newInstances = [], deleteInstances = [];
			for (let i = 0; i < instanceBefore.length; i++) {
				if (instanceAfter.indexOf(instanceBefore[i]) === -1) {
					deleteInstances.push(instanceBefore[i]);
				}
			}
			for (let j = 0; j < instanceAfter.length; j++) {
				if (instanceBefore.indexOf(instanceAfter[j]) === -1) {
					newInstances.push(instanceAfter[j]);
				}
			}
			return ({
				newInstances: makeObject(newInstances),
				deleteInstances: makeObject(deleteInstances)
			})
		}
		
		function makeObject(instance) {
			let res = [];
			if (instance.length > 0) {
				instance.forEach(function (oneInstance) {
					res.push({InstanceId: oneInstance});
				});
			}
			return res;
		}
	},
	
	/**
	 * This method returns the stack Id that was used to create a deployment at the aws.
	 * In addition it returns the list of machines associated with this stack and the client environments that use this stack
	 * @param options
	 * @param cb
	 */
	"getCluster": function (options, cb) {
		let stack = options.infra.stack;
		let mockedResponse = {
			"env": options.params.env,
			"stackId": stack.id,
			"stackName": stack.name,
			"templateProperties": {
				"region": stack.options.zone,
				"keyPair": "keyPair" //todo what is this for ????
			},// mock
			"machines": []
		};
		//call aws api and get the machines
		getMachinesFromStack((error, machinesList) => {
			if (error) {
				return cb(error);
			}
			mockedResponse.machines = machinesList;
			return cb(null, mockedResponse);
		});
		
		function getMachinesFromStack(cb) {
			
			let aws = options.infra.api;
			let ec2 = getConnector({
				api: 'ec2',
				region: stack.options.zone,
				keyId: aws.keyId,
				secretAccessKey: aws.secretAccessKey
			});
			
			let machinesList = [];
			
			const params = {
				Filters: [
					{
						Name: 'tag:aws:cloudformation:stack-name',
						Values: [
							stack.name
						]
					}
				]
			};
			
			ec2.describeInstances(params, function (err, data) {
				if (err) {
					return cb(err);
				}
				else {
					for (let i = 0; i < data.Reservations.length; i++) {
						for (let y = 0; y < data.Reservations[i].Instances.length; y++) {
							machinesList.push({
								"name": data.Reservations[i].Instances[y].PrivateDnsName,
								"ip": data.Reservations[i].Instances[y].PublicIpAddress
							});
						}
					}
					return cb(null, machinesList);
				}
			});
		}
	},
	
	/**
	 * This method Updates the deployment at aws
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateCluster": function (options, cb) {
		return cb(null, true);
		
		// const aws = data.options.projectRecord.infra.aws.api;
		// let cloudFormation = getConnector({
		// 	api: 'cloudFormation',
		// 	region: stack.region,
		// 	keyId: aws.keyId,
		// 	secretAccessKey: aws.secretAccessKey
		// });
		// const params = {
		// 	StackName: stack.name,
		// 	Capabilities: [
		// 		'CAPABILITY_IAM'
		// 	],
		// 	OnFailure: 'DELETE',
		// 	Parameters: [
		// 		{
		// 			ParameterKey: 'ClusterSize',
		// 			ParameterValue: data.options.workernumber.toString()
		// 		},
		// 		{
		// 			ParameterKey: 'EnableCloudStorEfs',
		// 			ParameterValue: (data.options.EnableCloudStorEfs) ? ' yes' : 'no'
		// 		},
		// 		{
		// 			ParameterKey: 'EnableCloudWatchDetailedMonitoring',
		// 			ParameterValue: (data.options.cloudwatchContainerMonitoring) ? ' yes' : 'no'
		// 		},
		// 		{
		// 			ParameterKey: 'EnableCloudWatchLogs',
		// 			ParameterValue: (data.options.cloudwatchContainerLogging) ? ' yes' : 'no'
		// 		},
		// 		{
		// 			ParameterKey: 'EnableEbsOptimized',
		// 			ParameterValue: (data.options.ebsIO) ? ' yes' : 'no'
		// 		},
		// 		{
		// 			ParameterKey: 'EnableSystemPrune',
		// 			ParameterValue: (data.options.enableDailyResourceCleanup) ? ' yes' : 'no'
		// 		},
		// 		{
		// 			ParameterKey: 'InstanceType',
		// 			ParameterValue: data.options.workerflavor
		// 		},
		// 		{
		// 			ParameterKey: 'KeyName',
		// 			ParameterValue: data.options.keyPair
		// 		},
		// 		{
		// 			ParameterKey: 'ManagerDiskSize',
		// 			UsePreviousValue: true
		// 		},
		// 		{
		// 			ParameterKey: 'ManagerDiskType',
		// 			UsePreviousValue: true
		// 		},
		// 		{
		// 			ParameterKey: 'ManagerInstanceType',
		// 			UsePreviousValue: true
		// 		},
		// 		{
		// 			ParameterKey: 'ManagerSize',
		// 			UsePreviousValue: true
		// 		},
		// 		{
		// 			ParameterKey: 'SwarmApiToken',
		// 			UsePreviousValue: true
		// 		},
		// 		{
		// 			ParameterKey: 'WorkerDiskSize',
		// 			ParameterValue: data.options.workerstorage.toString()
		// 		},
		// 		{
		// 			ParameterKey: 'WorkerDiskType',
		// 			ParameterValue: data.options.workerstoragetype
		// 		}
		// 	],
		// 	TemplateURL: config.templateUrl
		// };
		// cloudFormation.updateStack(params, function (err, response) {
		// 	if (err) {
		// 		return cb(err);
		// 	}
		// 	else {
		// 		return cb(null, true);
		// 	}
		// });
	},
	
	/**
	 * This method removes the deployment at aws and updates the project record infra.aws.deployment array
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteCluster": function (options, cb) {
		const stack = options.infra.stack;
		const aws = options.infra.api;
		const cloudFormation = getConnector({
			api: 'cloudFormation',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const acm = getConnector({
			api: 'acm',
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
		const param = {
			StackName: stack.name
		};
		let elasticLoadBalancers = [stack.options.ElbName];
		for (let env in stack.loadBalancers) {
			for (let service in stack.loadBalancers[env]) {
				elasticLoadBalancers.push(stack.loadBalancers[env][service].name);
			}
		}
		if (elasticLoadBalancers.length > 0) {
			async.each(elasticLoadBalancers, function (oneElb, callback) {
				elb.deleteLoadBalancer({LoadBalancerName: oneElb}, callback);
			}, function (err) {
				if (err) {
					return cb(err);
				}
				else {
					deleteStack();
				}
			});
		} else {
			deleteStack();
		}
		
		function deleteStack() {
			cloudFormation.deleteStack(param, cb);
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
				
				driver.updateExternalLB(options, function (err) {
					return cb(err, true);
				});
			}
			//service have no ports to be exposed
			//delete load balancer
			else {
				options.params.name = service;
				options.params.ElbName = stack.loadBalancers[options.params.envCode.toUpperCase()][service].name;
				driver.deleteExternalLB(options, function (err) {
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
				driver.deployExternalLb(options, function (err) {
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
		const opts = {
			listener : options.params.listener,
			name : options.params.name
		};
		const stack = options.infra.stack;
		const envCode = options.params.envCode.toUpperCase();
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
	}
};

module.exports = driver;