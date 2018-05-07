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
			//domain contains a value that should be used to whitelist the machine ips in the stack
			let domain = "";
			if(process.env.SOAJS_SAAS){
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
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"executeDriverOperationsAfterStatusPre": function(options, cb){
		return cb(null, true);
	},
	
	/**
	 * This method deploys the default soajsnet for docker
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"executeDriverOperationsAfterStatusPost": function (options, cb) {
		let out = options.out;
		let stack = options.infra.stack;
		
		if (out.ip && stack.options.ElbName) {
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
					return cb(null, true);
				}
				return cb(err, true);
			});
		}
		else {
			return cb(null, false);
		}
	}
};

module.exports = driver;