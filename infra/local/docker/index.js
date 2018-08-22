'use strict';

const randomString = require("randomstring");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const dockerDriver = require("../../../lib/container/docker/index.js");
const dockerUtils = require("../../../lib/container/docker/utils.js");
const infraUtils = require("../../utils");

let driver = {
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"authenticate": function(options, cb){
		//todo try adding a new infra docker
		// if this failed then the deployer should be supplied data from data
		//check kubernetes authenticate for reference
		try{
			options.deployerConfig = {
				apiProtocol: 'https',
				apiPort: 443,
				auth: {
					token: options.infra.api.token
				},
				nodes: options.infra.api.ipaddress
			};
		}
		catch(e){
			options.soajs.log.error(e);
			return cb({source: 'driver', value: 'Invalid docker configuration detected', code: 687, msg: errors[687]});
		}
		
		dockerUtils.getDeployer(options, (error, deployer) => {
			if (error) {
				return cb(error);
			}
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
			deployer.listNetworks({}, (err, networks) => {
				if(err){
					return cb(err);
				}
				
				let found = false;
				networks.forEach((oneNetwork) => {
					if(oneNetwork.Name === 'soajsnet'){
						found = true;
					}
				});
				
				if(found){
					options.infra.api.network = 'soajsnet';
					options.infra.api.port = 443;
					options.infra.api.protocol = 'https';
					return cb(null, true);
				}
				else{
					deployer.createNetwork(networkParams, (err) => {
						if (err) {
							return cb(err);
						}
						
						options.infra.api.network = 'soajsnet';
						options.infra.api.port = 443;
						options.infra.api.protocol = 'https';
						return cb(null, true);
					});
				}
			});
		});
		
	},

	"getExtras": function(options, cb) {
		return cb(null, {technologies: ['docker'], templates: null, drivers: ['Native'] });
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function(options, cb){
		return cb(null, {"regions": [] })
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
		
		options.soajs.registry.deployer.container.docker.remote.apiProtocol = options.infra.api.protocol;
		options.soajs.registry.deployer.container.docker.remote.apiPort = options.infra.api.port;
		options.soajs.registry.deployer.container.docker.remote.auth.token = options.infra.api.token;
		
		let oneDeployment = {
			technology: "docker",
			options: {},
			environments:[],
			loadBalancers: {}
		};
		
		oneDeployment.name = `ht${options.params.soajs_project}${randomString.generate({
			length: 13,
			charset: 'alphanumeric',
			capitalization: 'lowercase'
		})}`;
		
		oneDeployment.id = oneDeployment.name;
		oneDeployment.environments = [options.env.toUpperCase()];
		oneDeployment.options.zone = 'local';
		
		return cb(null, oneDeployment);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatus": function (options, cb) {
		options.soajs.registry.deployer.container.docker.remote.nodes = options.infra.api.ipaddress;
		return cb(null, options.infra.api.ipaddress);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDNSInfo": function (options, cb) {
		let response = {
			"id": options.infra.id,
			"dns": {
				"msg": "<table>" +
				"<thead>" +
				"<tr><th>Field Type</th><th>Field Value</th></tr>" +
				"</thead>" +
				"<tbody>" +
				"<tr><td>DNS Type</td><td>CNAME</td></tr>" +
				"<tr class='even'><td>Domain Value</td><td>%domain%</td></tr>" +
				"<tr><td>IP Address</td><td>" + options.infra.api.ipaddress + "</td></tr>" +
				"<tr class='even'><td>TTL</td><td>5 minutes</td></tr>" +
				"</tbody>" +
				"</table>"
			}
		};
		return cb(null, response);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"scaleCluster": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 */
	"getCluster": function (options, cb) {
		/*
			const deployer = new dockerode({
				protocol: "https",
				port: 443,
				host: options.infra.api.ipaddress,
				headers: {
					'token': options.infra.api.token
				}
			});
			run inspect command and see what you can get details from it
		 */
		let machinesList = [];
		machinesList.push({
			"name": 'dockermachine',
			"ip": options.infra.api.ipaddress
		});
		
		return cb(null, machinesList);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateCluster": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteCluster": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"publishPorts": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	
	"createLoadBalancer": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateLoadBalancer": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteLoadBalancer": function (options, cb) {
		return cb(null, true);
	}
};

Object.assign(driver, dockerDriver);

driver.deployService = function (options, cb){
	dockerDriver.deployService(options, (error, response) => {
		if(error){ return cb(error); }
		
		//update env settings
		//check exposed external ports
		//need to wait 1500 ms before inspecting
		setTimeout(() => {
			options.params.id = response.id;
			dockerDriver.inspectService(options, (error, deployedServiceDetails) => {
				if (error) {
					return cb(error);
				}
				infraUtils.updateEnvSettings(driver, driver, options, deployedServiceDetails, (error) => {
					return cb(error, deployedServiceDetails);
				});
			});
		}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

driver.redeployService = function (options, cb){
	dockerDriver.redeployService(options, (error, response) => {
		if(error){ return cb(error); }
		
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			dockerDriver.inspectService(options, (error, deployedServiceDetails) => {
				if (error) {
					return cb(error);
				}
				
				if(options.params.action === 'redeploy'){
					return cb(null, deployedServiceDetails);
				}
				
				infraUtils.updateEnvSettings(driver, driver, options, deployedServiceDetails, (error) => {
					return cb(error, deployedServiceDetails);
				});
			});
		},(process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

module.exports = driver;
