/* jshint esversion: 6 */

'use strict';

const soajsCoreLibs = require("soajs.core.libs");
const utils = require('../../utils/utils.js');
const lib = require('./utils');
const template = require('./template');
const swarmSecrets = require('./secrets');
const volumeSchema = require("../../schemas/swarm/service.volume");

const errorFile = require('../../utils/errors.js');
const async = require('async');

let engine = {
	/**
	 * List services/deployments currently available
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listServices(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let params = {};
				if (options.params && options.params.env && !options.params.custom) {
					params.filters = {label: ['soajs.env.code=' + options.params.env]};
				}
				
				deployer.listServices(params, (error, services) => {
					utils.checkError(error, 549, cb, () => {
						/*
						 NOTE: swarm api does not support filtering based on the inequality of specific labels
						 for example: soajs.content != true can't be used to get all non-soajs services
						 filtering of custom services is done manually for now until support is added
						 */
						if (options.params && options.params.custom) {
							async.filter(services, (oneService, callback) => {
								if (!oneService.Spec || !oneService.Spec.Labels || !oneService.Spec.Labels['soajs.env.code']) return callback(null, true);
								return callback(null, false);
							}, (error, services) => {
								processServicesData(deployer, services, cb);
							});
						}
						else {
							processServicesData(deployer, services, cb);
						}
					});
				});
			});
		});
		
		function processServicesData(deployer, services, cb) {
			async.map(services, (oneService, callback) => {
				let record = lib.buildServiceRecord({service: oneService}, options);
				
				if (options.params && options.params.excludeTasks) {
					return callback(null, record);
				}
				
				let params = {
					filters: {service: [oneService.Spec.Name]}
				};
				deployer.listTasks(params, (error, serviceTasks) => {
					utils.checkError(error, 552, callback, () => {
						async.map(serviceTasks, (oneTask, callback) => {
							return callback(null, lib.buildTaskRecord({
								task: oneTask,
								serviceName: oneService.Spec.Name,
								service: record
							}));
						}, (error, tasks) => {
							record.deployment = true;
							record.tasks = tasks;
							return callback(null, record);
						});
					});
				});
			}, cb);
		}
	},
	
	/**
	 * Creates a new deployment for a SOAJS service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deployService: function (options, cb) {
		
		async.auto({
			"checkPorts": (mCb) => {
				utils.checkPorts(options, mCb);
			},
			"checkVolumes": (mCb) => {
				utils.checkVolumes(options, 'docker', volumeSchema, mCb);
			},
			"checkSecrets": (mCb) => {
				swarmSecrets.listSecrets(options, (error, secrets) => {
					utils.checkError(error, 569, mCb, () => {
						lib.checkSecrets(options, secrets, mCb);
					});
				});
			},
			"checkImage": (mCb) => {
				utils.getLatestSOAJSImageInfo(options, mCb);
			},
			"getControllers": (mCb) => {
				utils.checkControllers(options, engine.getServiceHost, mCb);
			},
			"generateTemplate": ['checkPorts', 'checkVolumes', 'checkSecrets', 'checkImage', 'getControllers', (info, mCb) => {
				let payload = template.deployService(options);
				utils.checkError(!payload, 400, cb, () => {
					return mCb(null, payload);
				});
			}]
		}, (error, result) => {
			utils.checkError(error, (error && error.code) ? error.code : 400, cb, () => {
				let payload = result.generateTemplate;
				options.soajs.log.debug("Deploying new Service:", JSON.stringify(payload, null, 2));
				lib.getDeployer(options, (error, deployer) => {
					utils.checkError(error, 540, cb, () => {
						deployer.createService(payload, (error, service) => {
							utils.checkError(error, 662, cb, () => {
								return cb(null, {id: service.id});
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Redeploy a service
	 * This update process is simulated by adding/replacing a dummy environment variables that automatically triggers a redeploy command for all service containers
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	redeployService(options, cb) {
		if(!options || !options.params || !options.params.action || ['redeploy', 'rebuild'].indexOf(options.params.action) === -1){
			return cb({
				source: 'driver',
				value: errorFile[501],
				code: 501,
				msg: errorFile[501]
			});
		}
		
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.inputmaskData.serviceId);
				async.auto({
					"checkPorts": (mCb) => {
						if(options.params.action === 'redeploy') return mCb();
						utils.checkPorts(options, mCb);
					},
					"checkVolumes": (mCb) => {
						if(options.params.action === 'redeploy') return mCb();
						utils.checkVolumes(options, 'docker', volumeSchema, mCb);
					},
					"checkSecrets": (mCb) => {
						if(options.params.action === 'redeploy') return mCb();
						swarmSecrets.listSecrets(options, (error, secrets) => {
							utils.checkError(error, 569, mCb, () => {
								lib.checkSecrets(options, secrets, mCb);
							});
						});
					},
					"checkImage": (mCb) => {
						if(options.params.action === 'redeploy') return mCb();
						utils.getLatestSOAJSImageInfo(options, mCb);
					},
					"getControllers": (mCb) => {
						if(options.params.action === 'redeploy') return mCb();
						utils.checkControllers(options, engine.getServiceHost, mCb);
					},
					"generateTemplate": ['checkPorts', 'checkVolumes', 'checkSecrets', 'checkImage', 'getControllers', (info, mCb) => {
						service.inspect((error, serviceInfo) => {
							utils.checkError(error, 550, mCb, () => {
								let payload;
								switch (options.params.action) {
									case 'redeploy':
										payload = template.redeployService(serviceInfo, options);
										break;
									case 'rebuild':
										payload = template.rebuildService(serviceInfo, options);
										break;
								}
								utils.checkError(!payload, 400, mCb, () => {
									return mCb(null, payload);
								});
							});
						});
					}]
				}, (error, result) => {
					utils.checkError(error, (error && error.code) ? error.code : 400, cb, () => {
						options.soajs.log.debug("Updating Service:", JSON.stringify(result.generateTemplate, null, 2));
						service.update(result.generateTemplate, (error) => {
							utils.checkError(error, 653, cb, () => {
								return cb(null, {id: service.id });
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Scales a deployed services up/down depending on current replica count and new one
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	scaleService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				//NOTE: not using engine.inspectService() since the required info are not included in its response
				let service = deployer.getService(options.params.id);
				service.inspect((error, serviceInfo) => {
					utils.checkError(error, 550, cb, () => {
						let update = serviceInfo.Spec;
						update.version = serviceInfo.Version.Index;
						update.Mode.Replicated.Replicas = options.params.scale;
						service.update(update, (error) => {
							utils.checkError(error, 551, cb, () => {
								return cb(null, true);
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Gathers and returns information about specified service and a list of its tasks
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectService(options, cb) { //TODO: test again
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id);
				service.inspect((error, serviceInfo) => {
					utils.checkError(error, 550, cb, () => {
						let service = lib.buildServiceRecord({service: serviceInfo}, options);
						
						if (options.params.excludeTasks) {
							return cb(null, {service});
						}
						
						let params = {
							filters: {service: [options.params.id]}
						};
						deployer.listTasks(params, (error, serviceTasks) => {
							utils.checkError(error, 552, cb, () => {
								
								async.map(serviceTasks, (oneTask, callback) => {
									return callback(null, lib.buildTaskRecord({
										task: oneTask,
										serviceName: options.params.id,
										service: service
									}));
								}, (error, tasks) => {
									return cb(null, {service, tasks});
								});
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Takes environment code and soajs service name and returns corresponding swarm service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	findService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let params = {
					filters: {label: ['soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName]}
				};
				
				if (options.params.version) {
					params.filters.label.push('soajs.service.version=' + options.params.version);
				}
				
				deployer.listServices(params, (error, services) => {
					utils.checkError(error, 549, cb, () => {
						utils.checkError(services.length === 0, 661, cb, () => {
							//NOTE: only one service with the same name and version can exist in a given environment
							return cb(null, lib.buildServiceRecord({service: services[0]}, options));
						});
					});
				});
			});
		});
	},
	
	/**
	 * Deletes a deployed service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let service = deployer.getService(options.params.id);
				service.remove((error) => {
					utils.checkError(error, 553, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},
	
	/**
	 * Get the latest version of a deployed service
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getLatestVersion(options, cb) {
		let latestVersion = 0, v;
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let params = {
					filters: {label: ['soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName]}
				};
				deployer.listServices(params, (error, services) => {
					utils.checkError(error, 549, cb, () => {
						utils.checkError(services.length == 0, 661, cb, () => {
							services.forEach((oneService) => {
								if (oneService.Spec && oneService.Spec.Labels && oneService.Spec.Labels['soajs.service.version']) {
									latestVersion = soajsCoreLibs.version.getLatest(soajsCoreLibs.version.unsanitize(oneService.Spec.Labels['soajs.service.version']), soajsCoreLibs.version.unsanitize(latestVersion));
								}
							});
							
							return cb(null, latestVersion);
						});
					});
				});
			});
		});
	},
	
	/**
	 * Get the domain/host name of a deployed service (per version)
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getServiceHost(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let params = {
					filters: {label: ['soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName]}
				};
				
				if (options.params.version) {
					params.filters.label.push('soajs.service.version=' + options.params.version);
				}
				
				deployer.listServices(params, (error, services) => {
					utils.checkError(error, 549, cb, () => {
						if (services.length === 0) {
							return cb({
								source: 'driver',
								value: "error",
								code: 661,
								msg: errorFile[661]
							});
						}
						
						//NOTE: only one service with the same name and version can exist in a given environment
						// return cb(null, services[0].Spec.Name);
						let vip = null;
						if (services[0].Endpoint && services[0].Endpoint.VirtualIPs && services[0].Endpoint.VirtualIPs[0]) {
							vip = services[0].Endpoint.VirtualIPs[0].Addr;
							if (vip && vip.indexOf('/') !== -1) {
								vip = services[0].Endpoint.VirtualIPs[0].Addr.split('/')[0];
							}
						}
						return cb(null, vip);
					});
				});
			});
		});
	}
};

module.exports = engine;
