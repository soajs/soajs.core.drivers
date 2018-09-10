"use strict";
const async = require('async');
const crypto = require('crypto');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const dockerUtils = require("../../../lib/container/docker/utils.js");
const dockerDriver = require("../../../lib/container/docker/index.js");

const ClusterDriver = require("../cluster/cluster.js");
const LBDriver = require("../cluster/lb.js");
const helper = require("./helper.js");

const infraUtils = require("../../utils");

let driver = {
	
	/**
	 * Execute Deploy Cluster Pre Operation
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployClusterPre": function (options, cb) {
		
		options.soajs.log.debug("Generating docker token");
		crypto.randomBytes(1024, function (err, buffer) {
			if (err) {
				return cb(err);
			}
			options.soajs.registry.deployer.container.docker.remote.apiProtocol = 'https';
			options.soajs.registry.deployer.container.docker.remote.apiPort = 32376;
			options.soajs.registry.deployer.container.docker.remote.auth = {
				token: buffer.toString('hex')
			};
			return cb(null, true);
		});
	},
	
	/**
	 * Execute Deploy Cluster Post
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployClusterPost": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatusPre": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * This method deploys the default soajsnet for docker
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatusPost": function (options, cb) {
		let outIP = options.out;
		let stack = options.infra.stack;
		
		if (outIP && stack.options.ElbName) {
			options.soajs.log.debug("Creating SOAJS network.");
			
			dockerUtils.getDeployer(options, (error, deployer) => {
				if(error){
					return cb(error);
				}
				
				deployer.listNetworks({}, (err, networks) => {
					if (err) {
						return cb(err);
					}
					
					let found = false;
					networks.forEach((oneNetwork) => {
						if (oneNetwork.Name === 'soajsnet') {
							found = true;
						}
					});
					
					if(found){
						return cb(null, true);
					}
					else{
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
							return cb(err, true);
						});
					}
				});
			});
		}
		else {
			return cb(null, false);
		}
	}
};

Object.assign(driver, dockerDriver);

/**
 * Override default dockerDriver.deleteService, add extra Logic to clean up load balancer if any
 * @param options
 * @param cb
 */
driver.deleteService = function (options, cb) {
	dockerDriver.inspectService(options, (error, deployedServiceDetails) => {
		if (error) {
			return cb(error);
		}
		
		if (!deployedServiceDetails) {
			return cb(null, true);
		}
		
		dockerDriver.deleteService(options, (error) => {
			if (error) {
				return cb(error);
			}
			
			let info = helper.getDeploymentFromInfra(options.infra, options.soajs.registry.code);
			if (!info) {
				return cb(null, true);
			}
			
			//if there is a load balancer for this service make a call to drivers to delete it
			let infraStack = info[0];
			if (infraStack.loadBalancers && infraStack.loadBalancers[options.soajs.registry.code.toUpperCase()]
				&& infraStack.loadBalancers[options.soajs.registry.code.toUpperCase()][deployedServiceDetails.service.labels['soajs.service.name']]
				&& infraStack.loadBalancers[options.soajs.registry.code.toUpperCase()][deployedServiceDetails.service.labels['soajs.service.name']].name) {
				options.params = {
					envCode: options.soajs.registry.code.toLowerCase(),
					info: info,
					name: deployedServiceDetails.service.labels['soajs.service.name'],
					ElbName: infraStack.loadBalancers[options.soajs.registry.code.toUpperCase()][deployedServiceDetails.service.labels['soajs.service.name']].name
				};
				options.infra.stack = infraStack;
				LBDriver.delete(options, function (err) {
					if (err) {
						return cb(err);
					}
					else {
						const envCode = options.params.envCode.toUpperCase();
						if (options.infra.deployments && options.infra.deployments[options.params.info[2]]
							&& options.infra.deployments[options.params.info[2]].loadBalancers
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode]
							&& options.infra.deployments[options.params.info[2]].loadBalancers[envCode][options.params.name]) {
							delete options.infra.deployments[options.params.info[2]].loadBalancers[envCode][options.params.name];
						}
						return cb(null, true);
					}
				});
			}
			else {
				return cb(null, true);
			}
		});
	});
};

driver.listNodes = function (options, cb) {
	async.auto({
		"getCluster": (mCb) => {
			if(!options.params){
				options.params = {};
			}
			options.params.env = options.soajs.registry.code;
			ClusterDriver.getCluster(options, mCb);
		},
		"listNodes": (mCb) => {
			dockerDriver.listNodes(options, mCb);
		},
	}, (error, results) => {
		if (error) {
			return cb(error);
		}
		
		results.getCluster.machines.forEach((oneMachine) => {
			results.listNodes.forEach((oneNode) => {
				if (oneMachine.name === oneNode.hostname) {
					oneNode.ip = oneMachine.ip;
				}
			});
		});
		return cb(null, results.listNodes);
	});
};

driver.listServices = function (options, cb) {
	dockerDriver.listServices(options, (error, services) => {
		if (error) {
			return cb(error);
		}
		
		let deployment = options.infra.stack;
		let env = options.soajs.registry.code.toUpperCase();
		
		services.forEach(function (oneService) {
			if (deployment && oneService.labels && oneService.labels['soajs.service.type'] === 'server' && oneService.labels['soajs.service.subtype'] === 'nginx') {
				if (deployment.loadBalancers && deployment.loadBalancers[env] && deployment.loadBalancers[env][oneService.labels['soajs.service.name']]) {
					oneService.ip = deployment.loadBalancers[env][oneService.labels['soajs.service.name']].DNSName;
					//fix the ports
					if (oneService.ports && oneService.servicePortType === 'loadBalancer') {
						oneService.ports.forEach((onePort) => {
							deployment.loadBalancers[env][oneService.labels['soajs.service.name']].ports.forEach((lbPorts) => {
								if (lbPorts.published === onePort.published) {
									onePort.published = lbPorts.target
								}
							});
						});
					}
				}
			}
		});
		
		return cb(null, services);
	});
};

driver.deployService = function (options, cb){
	dockerDriver.deployService(options, (error, response) => {
		if(error){ return cb(error); }
		
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			dockerDriver.inspectService(options, (error, deployedServiceDetails) => {
				if (error) {
					return cb(error);
				}
				infraUtils.updateEnvSettings(driver, LBDriver, options, deployedServiceDetails, (error) => {
					return cb(error, deployedServiceDetails);
				});
			});
		}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

driver.redeployService = function (options, cb){
	if (options.params.inputmaskData && options.params.inputmaskData.serviceId){
		options.params.id = options.params.inputmaskData.serviceId;
	}
	dockerDriver.inspectService(options, (error, inspectService) => {
		if (error) {
			return cb(error);
		}
		options.original = inspectService;
		dockerDriver.redeployService(options, (error, response) => {
			if (error) {
				return cb(error);
			}
			//update env settings
			//check exposed external ports
			setTimeout(() => {
				options.params.id = response.id;
				dockerDriver.inspectService(options, (error, deployedServiceDetails) => {
					if (error) {
						return cb(error);
					}
					
					if (options.params.action === 'redeploy') {
						return cb(null, deployedServiceDetails);
					}
					
					infraUtils.updateEnvSettings(driver, LBDriver, options, deployedServiceDetails, (error) => {
						return cb(error, deployedServiceDetails);
					});
				});
			}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
		});
	});
};

module.exports = driver;