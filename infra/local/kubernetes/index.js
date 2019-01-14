'use strict';
const async = require("async");
const randomString = require("randomstring");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const kubeDriver = require("../../../lib/container/kubernetes/index.js");
const kubeUtils = require("../../../lib/container/kubernetes/utils.js");

const infraUtils = require("../../utils");

let driver = {
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"authenticate": function(options, cb){
		options.kubeConfig = {
			url: `https://${options.infra.api.ipaddress}:${options.infra.api.port}`,
			auth: {
				bearer: options.infra.api.token
			},
			request: {strictSSL: false}
		};
		kubeUtils.getDeployer(options, (error, deployer) => {
			if (error) {
				return cb(error);
			}
			
			let env = options.env === 'dashboard' ? "soajs" : options.env;
			
			let namespaceName =  options.deployerConfig ? options.deployerConfig.namespace.default.toLowerCase(): env;
			let namespace = {
				kind: 'Namespace',
				apiVersion: 'v1',
				metadata: {
					name: namespaceName || "soajs",
					labels: {'soajs.content': 'true'}
				}
			};
			deployer.core.namespaces.get({}, function (error, namespacesList) {
				if (error) {
					return cb(error);
				}
				
				async.detect(namespacesList.items, function (oneNamespace, mCb) {
					return mCb(null, oneNamespace.metadata.name === namespace.metadata.name);
				}, function (error, foundNamespace) {
					if (foundNamespace) {
						options.infra.api.namespace = {
							'default': namespace.metadata.name,
							'perService': false
						};
						return cb(null, true);
					}
					
					deployer.core.namespaces.post({body: namespace}, (error, response) => {
						if (error) {
							return cb(error);
						}
						
						options.infra.api.namespace = {
							'default': namespace.metadata.name,
							'perService': false
						};
						return cb(null, true);
					});
				});
			});
		});
	},

	"getExtras": function(options, cb) {
		return cb(null, {technologies: ['kubernetes'], templates: null, drivers: ['Native']});
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
		driver.authenticate(options, (err)=>{
			if (err){
				return cb(err);
			}
			options.soajs.registry.deployer.container.kubernetes.remote.apiProtocol = options.infra.api.protocol;
			options.soajs.registry.deployer.container.kubernetes.remote.apiPort = options.infra.api.port;
			options.soajs.registry.deployer.container.kubernetes.remote.auth.token = options.infra.api.token;
			
			let oneDeployment = {
				technology: "kubernetes",
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
		});
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatus": function (options, cb) {
		options.soajs.registry.deployer.container.kubernetes.remote.nodes = options.infra.api.ipaddress;
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
			"name": 'kubemachine',
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

Object.assign(driver, kubeDriver);

driver.deployService = function (options, cb){
	kubeDriver.deployService(options, (error, response) => {
		if(error){ return cb(error); }
		
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			kubeDriver.inspectService(options, (error, deployedServiceDetails) => {
				if(error){ return cb(error); }
				infraUtils.updateEnvSettings(driver, driver, options, deployedServiceDetails, (error) => {
					return cb(error, deployedServiceDetails);
				});
			});
		}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

driver.redeployService = function (options, cb){
	kubeDriver.redeployService(options, (error, response) => {
		if(error){ return cb(error); }
		
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			kubeDriver.inspectService(options, (error, deployedServiceDetails) => {
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
		}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

module.exports = driver;
