'use strict';
const async = require('async');
const AWS = require('aws-sdk');
const config = require("./config");
const defaultDriver = 'docker';

const ClusterDriver = require("./cluster/cluster.js");
const utilGlobal = require("../../lib/utils/utils");
const S3Driver = require("./cluster/s3.js");
const LBDriver = require("./cluster/lb.js");

const utils = require("./utils/utils");
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
	// 	case 'cloudFormation':
	// 		return new AWS.CloudFormation({apiVersion: '2010-05-15'});
	// 	case 'acm':
	// 		return new AWS.ACM({apiVersion: "2016-11-15"});
	// 	case 'elb':
	// 		return new AWS.ELB({apiVersion: '2015-12-01'});
	// 	default:
	// 		return new AWS.EC2({apiVersion: '2016-11-15'});
	// }
}

function runCorrespondingDriver(method, options, cb) {
	utilGlobal.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {
	/**
	 * this method authenticates the credentials provided by invoking the aws api
	 * Note: data.options provided to this method is different from other methods as this method is invoked via 3rd parties systems ( projects )
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"authenticate": function (options, cb) {
		let aws = options.infra.api;
		let ec2 = getConnector({api: 'ec2', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		let params = {};
		
		// Retrieves all regions/endpoints that work with EC2
		ec2.describeRegions(params, function (error, data) {
			if (error) {
				return cb(error);
			}
			if (!data) {
				return cb(new Error("Unable to reach AWS API!"));
			}
			return cb(null, true);
		});
	},

	"getExtras": function (options, cb) {
		return cb(null, {technologies: ['docker'], templates: ['external'], drivers: ['Cloud Formation'] });
	},

	/**
	 * method used to invoke aws api and deploy instances, security groups, configure load balancer & ip addresses
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
		let myDeployment;
		function callAPI(mCb) {
			ClusterDriver.deployCluster(options, (error, oneDeployment) => {
				if(oneDeployment){
					myDeployment = oneDeployment;
				}
				return mCb(error, oneDeployment);
			});
		}
		
		function preAPICall(mCb) {
			runCorrespondingDriver('deployClusterPre', options, mCb);
		}
		
		function postAPICall(mCb) {
			if(myDeployment){
				runCorrespondingDriver('deployClusterPost', options, mCb);
			}
			else{
				return mCb();
			}
		}
		
		let stages = [preAPICall, callAPI, postAPICall];
		async.series(stages, (error) => {
			if (error) {
				return cb(error);
			}
			return cb(null, myDeployment);
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
		let stack = options.infra.stack;
		
		//get the environment record
		if (options.soajs.registry.deployer.container[stack.technology].remote.nodes && options.soajs.registry.deployer.container[stack.technology].remote.nodes !== '') {
			let machineIp = options.soajs.registry.deployer.container[stack.technology].remote.nodes;
			return cb(null, machineIp);
		}
		else {
			let out = false;
			async.series({
				"pre": (mCb) => {
					runCorrespondingDriver('getDeployClusterStatusPre', options, mCb);
				},
				"exec": (mCb) => {
					ClusterDriver.getDeployClusterStatus(options, (error, response) => {
						if (response) {
							out = response;
						}
						return mCb(error, response);
					});
				},
				"post": (mCb) => {
					if (out) {
						runCorrespondingDriver('getDeployClusterStatusPost', options, mCb);
					}
					else {
						return mCb();
					}
				}
			}, (error) => {
				return cb(error, out);
			});
		}
	},
	
	"getDNSInfo": function (options, cb) {
		LBDriver.getDNSInfo(options, cb);
	},
	
	/**
	 * This method returns the available deployment regions at aws
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function (options, cb) {
		let response = {
			"regions": []
		};
		response.regions = [
			{v: 'us-east-1', 'l': 'US East (N. Virginia)'},
			{v: 'us-east-2', 'l': 'US East (Ohio)'},
			{v: 'us-west-1', 'l': 'US West (N. California)'},
			{v: 'us-west-2', 'l': 'US West (Oregon)'},
			{v: 'ca-central-1', 'l': 'Canada (Central)'},
			{v: 'eu-west-1', 'l': 'EU (Ireland)'},
			{v: 'eu-west-2', 'l': 'EU (London)'},
			{v: 'eu-central-1', 'l': 'EU (Frankfurt)'},
			{v: 'ap-northeast-1', 'l': 'Asia Pacific (Tokyo)'},
			{v: 'ap-northeast-2', 'l': 'Asia Pacific (Seoul)'},
			{v: 'ap-south-1', 'l': 'Asia Pacific (Mumbai)'},
			{v: 'ap-southeast-1', 'l': 'Asia Pacific (Singapore)'},
			{v: 'ap-southeast-2', 'l': 'Asia Pacific (Sydney)'},
			{v: 'sa-east-1', 'l': 'South America (São Paulo)'}
		];
		
		return cb(null, response);
	},
	
	"scaleCluster": function (options, cb) {
		ClusterDriver.scaleCluster(options, cb);
	},
	
	"getCluster": function (options, cb) {
		ClusterDriver.getCluster(options, cb);
	},
	
	"updateCluster": function (options, cb) {
		ClusterDriver.updateCluster(options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		ClusterDriver.deleteCluster(options, cb);
	},
	
	"publishPorts": function (options, cb) {
		LBDriver.publishPorts(options, cb);
	},
	
	"deployExternalLb": function (options, cb) {
		LBDriver.deployExternalLb(options, cb);
	},
	
	"updateExternalLB": function (options, cb) {
		LBDriver.updateExternalLB(options, cb);
	},
	
	"deleteExternalLB": function (options, cb) {
		LBDriver.deleteExternalLB(options, cb);
	},
	
	"getFiles": function (options, cb) {
		S3Driver.getFiles(options, cb);
	},
	
	'downloadFile': function (options, cb) {
		S3Driver.downloadFile(options, cb);
	},
	
	'deleteFile': function (options, cb) {
		S3Driver.deleteFile(options, cb);
	},
	
	"uploadFile": function (options, cb) {
		S3Driver.uploadFile(options, cb);
	},
	
	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
