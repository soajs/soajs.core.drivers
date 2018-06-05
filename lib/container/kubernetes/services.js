/* jshint esversion: 6 */
'use strict';

const async = require('async');

const volumeSchema = require("../../schemas/kubernetes/service.volume");
const errorFile = require('../../utils/errors.js');

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const autoscaler = require('./autoscale.js');
const template = require('./template');
const kubeSecrets = require('./secrets');

const engine = {
	
	/**
	 * List services of all namespaces
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	listServices(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let filter = {};
				
				if (options.params && options.params.env && !options.params.custom) {
					filter = {
						labelSelector: 'soajs.env.code=' + options.params.env.toLowerCase()
					};
				}
				deployer.core.nodes.get({}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						//get deployments from all namespaces
						deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
							utils.checkError(error, 536, cb, () => {
								//get daemonset from all namespaces
								deployer.extensions.daemonsets.get({qs: filter}, (error, daemonsetList) => {
									utils.checkError(error, 663, cb, () => {
										let deployments = [];
										if (deploymentList && deploymentList.items) deployments = deployments.concat(deploymentList.items);
										if (daemonsetList && daemonsetList.items) deployments = deployments.concat(daemonsetList.items);
										
										if (options.params && options.params.custom) {
											async.filter(deployments, (oneDeployment, callback) => {
												if (!oneDeployment.metadata || !oneDeployment.metadata.labels) return callback(null, true);
												if (!oneDeployment.metadata.labels['soajs.env.code']) return callback(null, true);
												return callback(null, false);
											}, (error, deployments) => {
												processDeploymentsData(deployer, deployments, nodeList, cb);
											});
										}
										else {
											processDeploymentsData(deployer, deployments, nodeList, cb);
										}
									});
								});
							});
						});
					});
				});
			});
		});
		
		function processDeploymentsData(deployer, deployments, nodeList, cb) {
			async.map(deployments, (oneDeployment, callback) => {
				let filter = {};
				filter.labelSelector = 'soajs.service.label= ' + oneDeployment.metadata.labels['soajs.service.label'];
				if (options.params && options.params.env && !options.params.custom) {
					filter.labelSelector = 'soajs.env.code=' + oneDeployment.metadata.labels['soajs.env.code'] + ', soajs.service.label=' + oneDeployment.metadata.labels['soajs.service.label'];
				}
				else if (options.params && options.params.custom) {
					if (oneDeployment.spec && oneDeployment.spec.selector && oneDeployment.spec.selector.matchLabels) {
						filter.labelSelector = lib.buildLabelSelector(oneDeployment.spec.selector);
					}
				}
				//get services from all namespaces
				deployer.core.services.get({qs: filter}, (error, serviceList) => {
					utils.checkError(error, 661, callback, () => {
						let service = {};
						if (serviceList && serviceList.items && Array.isArray(serviceList.items) && serviceList.items.length > 0) {
							service = serviceList.items[0];
						}
						
						let record = lib.buildDeploymentRecord({deployment: oneDeployment, service, nodeList}, options);
						
						if (options.params && options.params.excludeTasks) {
							return callback(null, record);
						}
						
						//get pods from all namespaces
						deployer.core.pods.get({qs: filter}, (error, podsList) => {
							utils.checkError(error, 659, callback, () => {
								async.map(podsList.items, (onePod, callback) => {
									if (options.params && !options.params.custom) {
										return callback(null, lib.buildPodRecord({pod: onePod}));
									}
									else { //custom services do not include soajs labels that identify deployment name
										return callback(null, lib.buildPodRecord({pod: onePod, deployment: oneDeployment}));
									}
								}, (error, pods) => {
									record.tasks = pods;
									options.params = {id: oneDeployment.metadata.name};
									autoscaler.getAutoscaler(options, (error, hpa) => {
										utils.checkError(error, 675, callback, () => {
											record.autoscaler = hpa;
											return callback(null, record);
										});
									});
								});
							});
						});
					});
				});
			}, cb);
		}
	},
	
	/**
	 * Creates a new deployment for a SOAJS service inside a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	deployService(options, cb) {
		async.auto({
			"checkPorts": (mCb) => {
				utils.checkPorts(options, mCb);
			},
			"checkVolumes": (mCb) => {
				utils.checkVolumes(options, 'kubernetes', volumeSchema, mCb);
			},
			"checkSecrets": (mCb) => {
				kubeSecrets.listSecrets(options, (error, secrets) => {
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
				template.deployService(options, mCb);
			}]
		}, (error, result) => {
			utils.checkError(error, (error && error.code) ? error.code : 400, cb, () => {
				lib.getDeployer(options, (error, deployer) => {
					utils.checkError(error, 540, cb, () => {
						
						let namespace = result.generateTemplate.namespace;
						let service = result.generateTemplate.service;
						let payload = result.generateTemplate.payload;
						if (service) {
							options.soajs.log.debug("Creating new Service:", service);
							deployer.core.namespaces(namespace).services.post({body: service}, (error) => {
								utils.checkError(error, 525, cb, () => {
									return createDeployment(deployer, namespace, payload);
								});
							});
						}
						else {
							return createDeployment(deployer, namespace, payload);
						}
					});
				});
			});
		});
		
		function createDeployment(deployer, namespace, payload) {
			options.soajs.log.debug("Creating new Deployment:", payload);
			deployer.extensions.namespaces(namespace)[options.params.type].post({body: payload}, (error, deployment) => {
				utils.checkError(error || !deployment || !deployment.metadata, 526, cb, () => {
					checkServiceAccount(deployer, namespace, (error) => {
						utils.checkError(error, 682, cb, () => {
							checkAutoscaler(options, (error) => {
								utils.checkError(error, (error && error.code) || 676, cb, () => {
									return cb(null, {id: deployment.metadata.name});
								});
							});
						});
					});
				});
			});
		}
		
		function checkAutoscaler(options, cb) {
			if (options.params.inputmaskData && options.params.inputmaskData.autoScale && Object.keys(options.params.inputmaskData.autoScale).length > 0) {
				let name = template.cleanLabel(options.params.data.name);
				let type = options.params.type;
				let inputmaskData = JSON.parse(JSON.stringify(options.params.inputmaskData));
				options.params = inputmaskData.autoScale.replicas;
				options.params.metrics = inputmaskData.autoScale.metrics;
				options.params.id = name;
				options.params.type = type;
				return autoscaler.createAutoscaler(options, cb);
			}
			else {
				return cb(null, true);
			}
		}
		
		function checkServiceAccount(deployer, namespace, cb) {
			if (options.params.serviceAccount && Object.keys(options.params.serviceAccount).length > 0) {
				return deployer.core.namespaces(namespace).serviceaccounts.post({body: options.params.serviceAccount}, cb);
			}
			else {
				return cb(null, true);
			}
		}
	},
	
	/**
	 * Scales a deployed service in a specific namespace up/down depending on current replica count and new one
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	scaleService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.extensions.namespaces(namespace).deployments.get({name: options.params.id}, (error, deployment) => {
					utils.checkError(error, 536, cb, () => {
						deployment.spec.replicas = options.params.scale;
						deployer.extensions.namespaces(namespace).deployments.put({
							name: options.params.id,
							body: deployment
						}, (error, result) => {
							utils.checkError(error, 527, cb, cb.bind(null, null, true));
						});
					});
				});
			});
		});
	},
	
	/**
	 * Redeploy a service in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	redeployService(options, cb) {
		if (!options || !options.params || !options.params.action ||['redeploy', 'rebuild'].indexOf(options.params.action) === -1) {
			return cb({
				source: 'driver',
				value: errorFile[501],
				code: 501,
				msg: errorFile[501]
			});
		}
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				options.params.id = options.params.inputmaskData.serviceId;
				lib.getDeployment(options, deployer, (error, deployment) => {
					utils.checkError(error || !deployment, 536, cb, () => {
						
						async.auto({
							"checkPorts": (mCb) => {
								if(options.params.action === 'redeploy') return mCb();
								utils.checkPorts(options, mCb);
							},
							"checkVolumes": (mCb) => {
								if(options.params.action === 'redeploy') return mCb();
								utils.checkVolumes(options, 'kubernetes', volumeSchema, mCb);
							},
							"checkSecrets": (mCb) => {
								if(options.params.action === 'redeploy') return mCb();
								kubeSecrets.listSecrets(options, (error, secrets) => {
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
								let payload;
								switch (options.params.action) {
									case 'redeploy':
										payload = template.redeployService(deployment, options);
										break;
									case 'rebuild':
										payload = template.rebuildService(deployment, options);
										break;
								}
								utils.checkError(!payload, 400, mCb, () => {
									let check = (payload.spec && payload.spec.template && payload.spec.template.spec && payload.spec.template.spec.containers && payload.spec.template.spec.containers[0]);
									utils.checkError(!check, 653, mCb, () => {
										if (!payload.spec.template.spec.containers[0].env) payload.spec.template.spec.containers[0].env = [];
										return mCb(null, payload);
									});
								});
							}]
						}, (error, result) => {
							utils.checkError(error, (error && error.code) ? error.code : 400, cb, () => {
								let deployment = result.generateTemplate;
								let namespace = lib.buildNameSpace(options);
								let contentType = deployment.kind.toLowerCase();
								
								options.params.id = options.params.inputmaskData.serviceId;
								switch (options.params.action) {
									case 'redeploy':
										updateDeployment(deployer, namespace, contentType, deployment);
										break;
									case 'rebuild':
										checkForExistingService(deployer, namespace, deployment, () => {
											updateDeployment(deployer, namespace, contentType, deployment);
										});
										break;
								}
							});
						});
					});
				});
			});
		});
		
		function checkForExistingService(deployer, namespace, deployment, mCb) {
			let filter = {labelSelector: 'soajs.service.label=' + options.params.newBuild.labels['soajs.service.label']};
			deployer.core.namespaces(namespace).services.get({qs: filter}, (error, servicesList) => {
				utils.checkError(error, 533, cb, () => {
					//service already found, update it
					if (servicesList && servicesList.items && servicesList.items.length > 0) {
						let service = template.AddServicePorts(servicesList.items[0], options.params.newBuild.ports);
						
						if(service.spec.ports && service.spec.ports.length > 0){
							options.soajs.log.debug("Updating Service:", service);
							deployer.core.namespaces(namespace).services.put({
								name: service.metadata.name,
								body: service
							}, (error) => {
								utils.checkError(error, 673, cb, mCb);
							});
						}
						else{
							return mCb();
						}
					}
					//service not found, create it
					else {
						let service = utils.cloneObj(require(__dirname + '/../../schemas/kubernetes/service.template.js'));
						service.metadata.name = template.cleanLabel(options.params.newBuild.name) + '-service';
						service.metadata.labels = options.params.newBuild.labels;
						service.spec.selector = {'soajs.service.label': options.params.newBuild.labels['soajs.service.label']};
						service = template.AddServicePorts(service, options.params.newBuild.ports);
						options.soajs.log.debug("Creating new Service:", service);
						deployer.core.namespaces(namespace).services.post({body: service}, (error) => {
							utils.checkError(error, 525, cb, mCb);
						});
					}
				});
			});
		}
		
		function updateDeployment(deployer, namespace, contentType, deployment) {
			options.soajs.log.debug("Updating Deployment:", deployment);
			deployer.extensions.namespaces(namespace)[contentType].put({
				name: options.params.id,
				body: deployment
			}, (error) => {
				utils.checkError(error, 653, cb, () => {
					return cb(null, {id: options.params.id });
				});
			});
		}
	},
	
	/**
	 * Gathers and returns information about specified service in a namespace and a list of its tasks/pods
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	inspectService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.nodes.get({}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						lib.getDeployment(options, deployer, function (error, deployment) {
							utils.checkError(error || !deployment, 536, cb, () => {
								lib.getService(options, deployer, deployment, function (error, service) {
									utils.checkError(error, 536, cb, () => {
										let namespace = lib.buildNameSpace(options);
										let deploymentRecord = lib.buildDeploymentRecord({
											deployment,
											service,
											nodeList
										}, options);
										if (options.params.excludeTasks) {
											return cb(null, {service: deploymentRecord});
										}
										
										deployer.core.namespaces(namespace).pods.get({qs: {labelSelector: 'soajs.service.label=' + options.params.id}}, (error, podList) => {
											utils.checkError(error, 529, cb, () => {
												async.map(podList.items, (onePod, callback) => {
													return callback(null, lib.buildPodRecord({pod: onePod}));
												}, (error, pods) => {
													return cb(null, {service: deploymentRecord, tasks: pods});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Takes environment code and soajs service name and returns corresponding swarm service in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	findService(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				
				let filter = {
					labelSelector: 'soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
				};
				
				if (options.params.version) {
					filter.labelSelector += ', soajs.service.version=' + options.params.version;
					if (options.deployerConfig.namespace.perService) {
						namespace += '-v' + options.params.version;
					}
				}
				
				deployer.core.nodes.get({}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						deployer.extensions.namespaces(namespace).deployments.get({qs: filter}, (error, deploymentList) => {
							utils.checkError(error, 549, cb, () => {
								deployer.extensions.namespaces(namespace).daemonsets.get({qs: filter}, (error, daemonsetList) => {
									utils.checkError(error, 663, cb, () => {
										let deployments = [];
										if (deploymentList && deploymentList.items && deploymentList.items.length > 0) deployments = deployments.concat(deploymentList.items);
										if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) deployments = deployments.concat(daemonsetList.items);
										
										utils.checkError(deployments.length === 0, 657, cb, () => {
											deployer.core.namespaces(namespace).services.get({qs: filter}, (error, serviceList) => {
												utils.checkError(error, 533, cb, () => {
													return cb(null, lib.buildDeploymentRecord({
														deployment: deployments[0],
														service: serviceList.items[0],
														nodeList
													}, options));
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Deletes a deployed service, kubernetes deployment, or daemonset in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	deleteService(options, cb) {
		let namespace = lib.buildNameSpace(options);
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.getDeployment(options, deployer, (error, deployment) => {
					utils.checkError(error || !deployment || !deployment.kind, 536, cb, () => {
						if (deployment.kind.toLowerCase() === 'deployment') {
							options.params.scale = 0;
							engine.scaleService(options, (error) => {
								utils.checkError(error, 527, cb, () => {
									deleteContent(deployer, deployment);
								});
							});
						}
						else {
							deleteContent(deployer, deployment);
						}
					});
				});
			});
		});
		
		function deleteContent(deployer, deployment) {
			let contentType = deployment.kind.toLowerCase();
			deployer.extensions.namespaces(namespace)[contentType].delete({
				name: options.params.id,
				qs: {gracePeriodSeconds: 0}
			}, (error) => {
				utils.checkError(error, 534, cb, () => {
					let filter = {};
					if (deployment.spec && deployment.spec.selector && deployment.spec.selector.matchLabels) {
						filter.labelSelector = lib.buildLabelSelector(deployment.spec.selector);
					}
					
					deployer.core.namespaces(namespace).services.get({qs: filter}, (error, servicesList) => { //only one service for a given service can exist
						utils.checkError(error, 533, cb, () => {
							if (servicesList && servicesList.items && servicesList.items.length > 0) {
								async.each(servicesList.items, (oneService, callback) => {
									deployer.core.namespaces(namespace).services.delete({name: oneService.metadata.name}, callback);
								}, (error) => {
									utils.checkError(error, 534, cb, () => {
										deleteAutoscaler((error) => {
											utils.checkError(error, 678, cb, () => {
												cleanup(deployer, filter);
											});
										});
									});
								});
							}
							else {
								deleteAutoscaler((error) => {
									utils.checkError(error, 678, cb, () => {
										cleanup(deployer, filter);
									});
								});
							}
						});
					});
				});
			});
		}
		
		function deleteAutoscaler(cb) {
			let autoscalerOptions = Object.assign({}, options);
			autoscalerOptions.params = {id: options.params.id};
			autoscaler.getAutoscaler(autoscalerOptions, (error, hpa) => {
				if (error) return cb(error);
				
				if (!hpa || Object.keys(hpa).length === 0) return cb();
				
				return autoscaler.deleteAutoscaler(autoscalerOptions, cb);
			});
		}
		
		function cleanup(deployer, filter) {
			let namespace = lib.buildNameSpace(options);
			deployer.extensions.namespaces(namespace).replicasets.delete({qs: filter}, (error) => {
				utils.checkError(error, 532, cb, () => {
					deployer.core.namespaces(namespace).pods.delete({qs: filter}, (error) => {
						utils.checkError(error, 660, cb, cb.bind(null, null, true));
					});
				});
			});
		}
	},
	
	/**
	 * List kubernetes services in all namespaces, return raw data
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	listKubeServices(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.services.get({}, (error, servicesList) => {
					utils.checkError(error, 533, cb, () => {
						return cb(null, (servicesList && servicesList.items) ? servicesList.items : []);
					});
				});
			});
		});
	},
	
	/**
	 * Get the latest version of a deployed service
	 * Returns integer: service version
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	getLatestVersion(options, cb) {
		let latestVersion = 0;
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let filter = {
					labelSelector: 'soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
				};
				
				//NOTE: this function cannot include a namespace while accessing the kubernetes api
				//NOTE: namespace contains version but since this function's role is to get the version, adding the version to the namespace is impossible
				let namespaceRegExp;
				if (options.deployerConfig.namespace.perService) {
					namespaceRegExp = new RegExp(options.deployerConfig.namespace.default + '-.*', 'g');
				}
				else {
					namespaceRegExp = new RegExp(options.deployerConfig.namespace.default, 'g');
				}
				
				deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
					utils.checkError(error, 536, cb, () => {
						deployer.extensions.daemonsets.get({qs: filter}, (error, daemonsetList) => {
							utils.checkError(error, 663, cb, () => {
								let deployments = [];
								if (deploymentList && deploymentList.items && deploymentList.items.length > 0) deployments = deployments.concat(deploymentList.items);
								if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) deployments = deployments.concat(daemonsetList.items);
								
								utils.checkError(deployments.length === 0, 657, cb, () => {
									async.filter(deployments, (oneDeployment, callback) => {
										return callback(null, (oneDeployment.metadata.namespace.match(namespaceRegExp)));
									}, function (error, namespaceDeployments) {
										namespaceDeployments.forEach((oneDeployment) => {
											if (oneDeployment.metadata && oneDeployment.metadata.labels && oneDeployment.metadata.labels['soajs.service.version']) {
												let v = oneDeployment.metadata.labels['soajs.service.version'];
												
												if (v > latestVersion) {
													latestVersion = v;
												}
											}
										});
										
										return cb(null, latestVersion);
									});
								});
							});
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
	 *
	 */
	getServiceHost(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				
				let filter = {
					labelSelector: 'soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
				};
				
				if (options.params.version) {
					filter.labelSelector += ', soajs.service.version=' + options.params.version;
					if (options.deployerConfig.namespace.perService) {
						namespace += '-v' + options.params.version;
					}
				}
				
				deployer.core.namespaces(namespace).services.get({qs: filter}, (error, serviceList) => {
					utils.checkError(error, 549, cb, () => {
						if (!serviceList || !serviceList.items || serviceList.items.length === 0) {
							return cb({message: 'Service not found'});
						}
						
						if (!serviceList.items[0].metadata || !serviceList.items[0].metadata.name) {
							return cb({message: 'Unable to get service host'});
						}
						
						//only one service must match the filter, therefore serviceList will contain only one item
						// return cb(null, serviceList.items[0].metadata.name + '.' + namespaceName);
						return cb(null, serviceList.items[0].spec.clusterIP);
					});
				});
			});
		});
	}
};

module.exports = engine;