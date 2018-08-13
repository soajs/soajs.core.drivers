'use strict';
const async = require('async');
const AWS = require('aws-sdk');
const config = require("./config");
const defaultDriver = 'docker';

const ClusterDriver = require("./cluster/cluster.js");
const utilGlobal = require("../../lib/utils/utils");
const S3Driver = require("./cluster/s3.js");
const LBDriver = require("./cluster/lb.js");
const ips = require('./cluster/ips.js');
const networks = require('./cluster/networks.js');
const securityGroups = require('./cluster/securityGroups.js');
const subnets = require('./cluster/subnets.js');
const utils = require("./utils/utils");
function getConnector(opts) {
	return utils.getConnector(opts, config);
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
	
	/**
	 * List available Networks
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	listNetworks: function (options, cb) {
		return networks.list(options, cb);
	},
	
	/**
	 * Create network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createNetwork: function (options, cb) {
		return networks.create(options, cb);
	},
	
	/**
	 * Update network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// updateNetwork: function (options, cb) {
	// 	return networks.update(options, cb);
	// },
	
	/**
	 * Delete network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteNetwork: function (options, cb) {
		return networks.delete(options, cb);
	},
	
	/**
	 * List available loadbalancers
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// listLoadBalancers: function (options, cb) {
	// 	return loadBalancers.list(options, cb);
	// },
	
	/**
	 * Create loadbalancer
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// createLoadBalancer: function (options, cb) {
	// 	return loadBalancers.create(options, cb);
	// },
	
	/**
	 * Update loadbalancer
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// updateLoadBalancer: function (options, cb) {
	// 	return loadBalancers.update(options, cb);
	// },
	
	/**
	 * Delete loadbalancer
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// deleteLoadBalancer: function (options, cb) {
	// 	return loadBalancers.delete(options, cb);
	// },
	
	/**
	 * List available subnets
	 
	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	listSubnets: function (options, cb) {
		return subnets.list(options, cb);
	},
	
	/**
	 * Create subnet
	 
	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	// createSubnet: function (options, cb) {
	// 	return subnets.create(options, cb);
	// },
	
	/**
	 * Update subnet
	 
	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	// updateSubnet: function (options, cb) {
	// 	return subnets.update(options, cb);
	// },
	
	/**
	 * Delete subnet
	 
	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	// deleteSubnet: function (options, cb) {
	// 	return subnets.delete(options, cb);
	// },
	
	/**
	 * List available securitygroups
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// listSecurityGroups: function (options, cb) {
	// 	return securityGroups.list(options, cb);
	// },
	
	/**
	 * Get existing security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// getSecurityGroup: function (options, cb) {
	// 	return securityGroups.get(options, cb);
	// },
	
	/**
	 * Create security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// createSecurityGroup: function (options, cb) {
	// 	return securityGroups.create(options, cb);
	// },
	
	/**
	 * Update security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// updateSecurityGroup: function (options, cb) {
	// 	return securityGroups.update(options, cb);
	// },
	
	/**
	 * Delete security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	// deleteSecurityGroup: function (options, cb) {
	// 	return securityGroups.delete(options, cb);
	// },

	/**
	 * List available public ips

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	listPublicIps: function (options, cb) {
		return ips.list(options, cb);
	},

	/**
	 * Create public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	createPublicIp: function (options, cb) {
		return ips.create(options, cb);
	},

	/**
	 * Update public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	updatePublicIp: function (options, cb) {
		return ips.update(options, cb);
	},

	/**
	 * Delete public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	deletePublicIp: function (options, cb) {
		return ips.delete(options, cb);
	},

	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
