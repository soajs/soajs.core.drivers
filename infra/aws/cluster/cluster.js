'use strict';
const async = require('async');
const randomString = require("randomstring");
const config = require("../config");
const utils = require("../utils/utils");
const S3Driver = require("./s3.js");
const networkDriver = require("./networks.js");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const AWSCluster = {
	
	/**
	 * method used to invoke aws api and deploy instances, security groups, configure load balancer & ip addresses
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
		let oneDeployment = {
			technology: options.params.technology,
			options: {},
			environments: [],
			loadBalancers: {}
		};
		
		options.soajs.log.debug("Creating AWS Stack");
		//domain contains a value that should be used to whitelist the machine ips in the stack
		let domain = "";
		if (process.env.SOAJS_SAAS) {
			domain = options.params.protocol + "://" + options.params.apiPrefix + "." + options.params.domain + "/bridge";
		}
		
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
		
		if (!options.params.infraCodeTemplate) {
			return cb(new Error("Invalid or Cluster Template detected to create the cluster from!"));
		}
		
		options.templateName = options.params.infraCodeTemplate;
		getNetworkInputs(options, (error, network) => {
			if(error){
				return cb(error);
			}
			S3Driver.getTemplateInputs(options, (error, templateInputsToUse) => {
				if(error){
					return cb(error);
				}
				
				if(typeof(templateInputsToUse) !== 'object'){
					try{
						templateInputsToUse = JSON.parse(templateInputsToUse);
					}
					catch(e){
						options.soajs.log.error(e);
					}
				}
				let inputs = templateInputsToUse.inputs;
				if(typeof inputs === 'string'){
					try{
						inputs = JSON.parse(inputs);
					}
					catch(e){
						return cb(new Error("Detected invalid template inputs schema !!!"));
					}
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
							ParameterKey: 'SoajsEnvCode',
							ParameterValue: options.soajs.registry.code.toUpperCase()
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
							ParameterKey: 'SwarmApiToken',
							ParameterValue: options.soajs.registry.deployer.container[options.params.technology].remote.auth.token,
						}
					],
					TemplateURL: config.templateUrl + encodeURIComponent(options.params.infraCodeTemplate)
				};
				if (network){
					params.Parameters.push({
						ParameterKey: 'Vpc',
						ParameterValue: network.id,
					});
					params.Parameters.push({
						ParameterKey: 'VpcCidr',
						ParameterValue: network.primaryAddress,
					});
					params.Parameters.push({
						ParameterKey: 'PubSubnetAz1',
						ParameterValue: network.subnets[0].id,
					});
					params.Parameters.push({
						ParameterKey: 'PubSubnetAz2',
						ParameterValue: network.subnets[1].id,
					});
					params.Parameters.push({
						ParameterKey: 'PubSubnetAz3',
						ParameterValue: network.subnets[2].id,
					});
				}
				options.soajs.log.debug("Deploying Cluster on Cloud Formation with the following inputs:", params);
				mapTemplateInputsWithValues(inputs, options.params, params, () => {
					cloudFormation.createStack(params, function (err, response) {
						if (err) {
							return cb(err);
						}
						
						oneDeployment.id = response.StackId;
						oneDeployment.environments = [options.soajs.registry.code.toUpperCase()];
						oneDeployment.options.zone = options.params.region;
						oneDeployment.options.template = options.params.infraCodeTemplate;
						return cb(null, oneDeployment);
					});
				});
			});
		});
		
		
		function mapTemplateInputsWithValues(inputs, params, template, mapCb){
			async.each(inputs, (oneInput, iCb) => {
				if(!oneInput || typeof oneInput !== 'object'){
					return iCb(new Error("Detected invalid template inputs schema !!!"));
				}
				
				if(oneInput.entries){
					mapTemplateInputsWithValues(oneInput.entries, params, template, iCb);
				}
				else{
					let paramValue = params[oneInput.name];
					if(!paramValue){
						paramValue = oneInput.value.toString();
					}
					
					if(!paramValue) {
						return iCb();
					}
					
					template.Parameters.push({
						ParameterKey: oneInput.name,
						ParameterValue: paramValue.toString()
					});
					
					return iCb();
				}
			}, mapCb);
		}
		
		function getNetworkInputs (options, netCb) {
			if (options.params.network){
				return netCb(null, null);
			}
			networkDriver.get(options, (err, network)=>{
				if (err) {
					return netCb(err);
				}
				if (!network.attachInternetGateway || !network.subnets || (network.subnets.length < 3)){
					return netCb(new Error("Invalid network configuration provided!"));
				}
				return netCb(null, network);
			});
		}
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
							options.soajs.registry.deployer.container[stack.technology].remote.nodes = out.ip;
							options.out = out;
							
							return cb(err, out.ip);
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
						}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 20 * 1000);
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
		//todo: need to fill the BL of this  method
		return cb(null, true);
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
		const elb = getConnector({
			api: 'elb',
			region: stack.options.zone,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const param = {
			StackName: stack.name
		};
		let elasticLoadBalancers = [];
		if (stack.options.ElbName){
			elasticLoadBalancers.push(stack.options.ElbName)
		}
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
};

module.exports = AWSCluster;