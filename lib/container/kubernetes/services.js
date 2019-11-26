/* jshint esversion: 6 */
'use strict';

const async = require('async');
const soajsCoreLibs = require("soajs.core.libs");

const volumeSchema = require("../../schemas/kubernetes/service.volume");
const errorFile = require('../../utils/errors.js');

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const autoscaler = require('./autoscale.js');
const template = require('./template');
const kubeSecrets = require('./secrets');

const wrapper = require('./wrapper.js');

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
				wrapper.node.get(deployer, {}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						//get deployments from all namespaces
						wrapper.deployment.get(deployer, {qs: filter}, (error, deploymentList) => {
							utils.checkError(error, 536, cb, () => {
								//get daemonset from all namespaces
								wrapper.daemonset.get(deployer, {qs: filter}, (error, daemonsetList) => {
									utils.checkError(error, 663, cb, () => {
										wrapper.cronjob.get(deployer, {qs: filter}, (error, cronList) => {
											utils.checkError(error, 663, cb, () => {
												let deployments = [];
												if (deploymentList && deploymentList.items) {
													deployments = deployments.concat(deploymentList.items);
												}
												if (daemonsetList && daemonsetList.items) {
													deployments = deployments.concat(daemonsetList.items);
												}
												if (cronList && cronList.items) {
													deployments = deployments.concat(cronList.items);
												}
												
												if (options.params && options.params.custom) {
													async.filter(deployments, (oneDeployment, callback) => {
														if (!oneDeployment.metadata || !oneDeployment.metadata.labels) {
															return callback(null, true);
														}
														if (!oneDeployment.metadata.labels['soajs.env.code']) {
															return callback(null, true);
														}
														return callback(null, false);
													}, (error, deployments) => {
														processDeploymentsData(deployer, deployments, nodeList, cb);
													});
												} else {
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
			});
		});
		
		function processDeploymentsData(deployer, deployments, nodeList, cb) {
			let filter = {};
			if (options.params.custom) {
				filter.labelSelector = "soajs.content!=true";
			} else if (options.params.env) {
				filter.labelSelector = "soajs.env.code=" + options.params.env;
			}
			//get services from all namespaces
			wrapper.service.get(deployer, {qs: filter}, (error, serviceList) => {
				utils.checkError(error, 661, cb, () => {
					async.map(deployments, (oneDeployment, callback) => {
						let filter = {};
						if (oneDeployment.metadata.labels && oneDeployment.metadata.labels['soajs.service.label']){
							filter.labelSelector = 'soajs.service.label= ' + oneDeployment.metadata.labels['soajs.service.label'];
						}
						if (options.params && options.params.env && !options.params.custom && oneDeployment.metadata.labels) {
							filter.labelSelector = 'soajs.env.code=' + oneDeployment.metadata.labels['soajs.env.code'] + ', soajs.service.label=' + oneDeployment.metadata.labels['soajs.service.label'];
						} else if (options.params && options.params.custom) {
							if (oneDeployment.spec && oneDeployment.spec.selector && oneDeployment.spec.selector.matchLabels) {
								filter.labelSelector = lib.buildLabelSelector(oneDeployment.spec.selector);
							}
						}
						
						let service = {};
						//map service to deployment
						if (serviceList && serviceList.items && Array.isArray(serviceList.items) && serviceList.items.length > 0) {
							for (let s = serviceList.items.length - 1; s >= 0; s--) {
								service = null;
								let oneService = serviceList.items[s];
								let labelSelector = [];
								//ge the labels keys needed to match the service with its deployment/daemonset
								if (oneService.spec && oneService.spec.selector) {
									labelSelector = Object.keys(oneService.spec.selector);
								}
								if (oneService.metadata.namespace === oneDeployment.metadata.namespace) {
									let connected = false;
									if (labelSelector.length > 0) {
										//loop over the label selectors to see to check if all labels match
										// if one of them don't match stop
										for (let x = 0; x < labelSelector.length; x++) {
											if (oneService.spec && oneService.spec.selector
												&& oneDeployment.spec && oneDeployment.spec.selector && oneDeployment.spec.selector.matchLabels){
												if (oneService.spec.selector[labelSelector[x]] === oneDeployment.spec.selector.matchLabels[labelSelector[x]]) {
													connected = true;
													break;
												} else {
													connected = false;
												}
											}
										}
									}
									if (connected) {
										service = oneService;
										serviceList.items.splice(s, 1);
										break;
									}
								}
							}
						}
						let record = lib.buildDeploymentRecord({deployment: oneDeployment, service, nodeList}, options);
						record.deployment = true;
						if (options.params && options.params.excludeTasks) {
							return callback(null, record);
						}
						
						//get pods from all namespaces
						wrapper.pod.get(deployer, {qs: filter}, (error, podsList) => {
							utils.checkError(error, 659, callback, () => {
								async.map(podsList.items, (onePod, callback) => {
									if (options.params && !options.params.custom) {
										return callback(null, lib.buildPodRecord({pod: onePod}));
									} else { //custom services do not include soajs labels that identify deployment name
										return callback(null, lib.buildPodRecord({
											pod: onePod,
											deployment: oneDeployment
										}));
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
					}, (error, mappedDeployments) => {
						utils.checkError(error, 661, cb, () => {
							async.each(serviceList.items, (oneOrphanService, sCb) => {
								let record = lib.buildDeploymentRecord({service: oneOrphanService, nodeList}, options);
								if (record) {
									record.deployment = false;
									mappedDeployments.push(record);
								}
								return sCb();
							}, () => {
								return cb(null, mappedDeployments);
							});
						});
					});
				});
			});
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
						
						createDeployment(deployer, namespace, payload, (error, deploymentResponse) => {
							utils.checkError(error, 525, cb, () => {
								if (service) {
									options.soajs.log.debug("Creating new Service:", JSON.stringify(service, null, 2));
									wrapper.service.post(deployer, {body: service, namespace: namespace}, (error) => {
										utils.checkError(error, 525, cb, () => {
											return cb(null, deploymentResponse);
										});
									});
								} else {
									return cb(null, deploymentResponse);
								}
							});
						});
					});
				});
			});
		});
		
		function createDeployment(deployer, namespace, payload, cb) {
			options.soajs.log.debug("Creating new Deployment:", JSON.stringify(payload, null, 2));
			wrapper[options.params.type.toLowerCase()].post(deployer, {
				body: payload,
				namespace: namespace
			}, (error, deployment) => {
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
			} else {
				return cb(null, true);
			}
		}
		
		function checkServiceAccount(deployer, namespace, cb) {
			if (options.params.serviceAccount && Object.keys(options.params.serviceAccount).length > 0) {
				return wrapper.serviceaccount.post(deployer, {body: options.params.serviceAccount}, cb);
			} else {
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
				wrapper.deployment.get(deployer, {
					name: options.params.id,
					namespace: namespace
				}, (error, deployment) => {
					utils.checkError(error, 536, cb, () => {
						deployment.spec.replicas = options.params.scale;
						//https://github.com/godaddy/kubernetes-client/blob/master/docs/1.13/Scale.md
						//wrapper.scale.put
						//test this
						wrapper.deployment.patch(deployer, {
							name: options.params.id,
							namespace: namespace,
							body: {
								spec: {
									replicas: options.params.scale
								}
							}
						}, (error) => {
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
		if (!options || !options.params || !options.params.action || ['redeploy', 'rebuild'].indexOf(options.params.action) === -1) {
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
								if (options.params.action === 'redeploy') {
									return mCb();
								}
								utils.checkPorts(options, mCb);
							},
							"checkVolumes": (mCb) => {
								if (options.params.action === 'redeploy') {
									return mCb();
								}
								utils.checkVolumes(options, 'kubernetes', volumeSchema, mCb);
							},
							"checkSecrets": (mCb) => {
								if (options.params.action === 'redeploy') {
									return mCb();
								}
								kubeSecrets.listSecrets(options, (error, secrets) => {
									utils.checkError(error, 569, mCb, () => {
										lib.checkSecrets(options, secrets, mCb);
									});
								});
							},
							"checkImage": (mCb) => {
								if (options.params.action === 'redeploy') {
									return mCb();
								}
								utils.getLatestSOAJSImageInfo(options, mCb);
							},
							"getControllers": (mCb) => {
								if (options.params.action === 'redeploy') {
									return mCb();
								}
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
									let check;
									if (payload.kind.toLowerCase() === "cronjob") {
										check = (payload.spec && payload.spec.jobTemplate && payload.spec.jobTemplate.spec &&
											payload.spec.jobTemplate.spec.template && payload.spec.jobTemplate.spec.template.spec &&
											payload.spec.jobTemplate.spec.template.spec.containers && payload.spec.jobTemplate.spec.template.spec.containers[0]);
									} else {
										check = (payload.spec && payload.spec.template && payload.spec.template.spec && payload.spec.template.spec.containers && payload.spec.template.spec.containers[0]);
									}
									utils.checkError(!check, 653, mCb, () => {
										if (payload.kind.toLowerCase() === "cronjob") {
											if (!payload.spec.jobTemplate.spec.template.spec.containers[0].env) {
												payload.spec.jobTemplate.spec.template.spec.containers[0].env = [];
											}
										} else {
											if (!payload.spec.template.spec.containers[0].env) {
												payload.spec.template.spec.containers[0].env = [];
											}
										}
										
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
			if (deployment.kind.toLowerCase() === "cronjob") {
				return mCb();
			}
			let filter = {labelSelector: 'soajs.service.label=' + options.params.newBuild.labels['soajs.service.label']};
			wrapper.service.get(deployer, {qs: filter}, (error, servicesList) => {
				utils.checkError(error, 533, cb, () => {
					//service already found, update it
					if (servicesList && servicesList.items && servicesList.items.length > 0) {
						let service = template.AddServicePorts(servicesList.items[0], options.params.newBuild.ports);
						
						if (service.spec.ports && service.spec.ports.length > 0) {
							options.soajs.log.debug("Updating Service:", JSON.stringify(service, null, 2));
							wrapper.service.put(deployer, {
								name: service.metadata.name,
								body: service,
								namespace: namespace
							}, (error) => {
								utils.checkError(error, 673, cb, mCb);
							});
						} else {
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
						if (service.spec.ports && service.spec.ports.length > 0) {
							options.soajs.log.debug("Creating new  Service:", JSON.stringify(service, null, 2));
							wrapper.service.post(deployer, {body: service, namespace: namespace}, (error) => {
								utils.checkError(error, 525, cb, mCb);
							});
						} else {
							return mCb();
						}
					}
				});
			});
		}
		
		function updateDeployment(deployer, namespace, contentType, deployment) {
			options.soajs.log.debug("Updating Deployment:", JSON.stringify(deployment, null, 2));
			wrapper[contentType].put(deployer, {
				name: options.params.id,
				body: deployment,
				namespace: namespace
			}, (error) => {
				utils.checkError(error, 653, cb, () => {
					return cb(null, {id: options.params.id});
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
				wrapper.node.get(deployer, {}, (error, nodeList) => {
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
										
										wrapper.pod.get(deployer, {
											qs: {labelSelector: 'soajs.service.label=' + options.params.id},
											namespace: namespace
										}, (error, podList) => {
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
				
				wrapper.node.get(deployer, {}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						wrapper.deployment.get(deployer, {
							qs: filter,
							namespace: namespace
						}, (error, deploymentList) => {
							utils.checkError(error, 549, cb, () => {
								wrapper.daemonset.get(deployer, {
									qs: filter,
									namespace: namespace
								}, (error, daemonsetList) => {
									utils.checkError(error, 663, cb, () => {
										wrapper.cronjob.get(deployer, {
											qs: filter,
											namespace: namespace
										}, (error, cronJobList) => {
											utils.checkError(error, 663, cb, () => {
												let deployments = [];
												if (deploymentList && deploymentList.items && deploymentList.items.length > 0) {
													deployments = deployments.concat(deploymentList.items);
												}
												if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) {
													deployments = deployments.concat(daemonsetList.items);
												}
												if (cronJobList && cronJobList.items && cronJobList.items.length > 0) {
													deployments = deployments.concat(cronJobList.items);
												}
												
												utils.checkError(deployments.length === 0, 657, cb, () => {
													wrapper.service.get(deployer, {
														qs: filter,
														namespace: namespace
													}, (error, serviceList) => {
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
					utils.checkError(error, 536, cb, () => {
						if (deployment && ['deployment', 'daemonset', 'cronjob'].indexOf(deployment.kind.toLowerCase()) !== -1) {
							
							let filter = {};
							if (deployment.spec && deployment.spec.selector && deployment.spec.selector.matchLabels) {
								filter.labelSelector = lib.buildLabelSelector(deployment.spec.selector);
							}
							
							if (deployment.kind.toLowerCase() === 'deployment') {
								options.params.scale = 0;
								engine.scaleService(options, (error) => {
									utils.checkError(error, 527, cb, () => {
										removeTheRest(deployer, deployment, filter);
									});
								});
							} else {
								removeTheRest(deployer, deployment, filter);
							}
						} else {
							//check and delete the service
							deleteService(deployer, (error) => {
								utils.checkError(error, 534, cb, cb);
							});
						}
					});
				});
			});
		});
		
		function removeTheRest(deployer, deployment, filter) {
			deleteDeployment(deployer, deployment, (error) => {
				utils.checkError(error, 536, cb, () => {
					//check and delete the service
					deleteService(deployer, (error) => {
						utils.checkError(error, 534, cb, () => {
							deleteAutoscaler((error) => {
								utils.checkError(error, 678, cb, () => {
									cleanup(deployer, filter);
								});
							});
						});
					});
				});
			});
		}
		
		function deleteService(deployer, cb) {
			async.parallel({
				"usingService": (mCb) => {
					wrapper.service.get(deployer, {
						name: soajsCoreLibs.version.sanitize(options.params.id + "-service"),
						namespace: namespace
					}, (error, service) => {
						if (error && error.code !== 404) {
							return mCb(error);
						} else if (error && error.code === 404) {
							return mCb();
						} else if (service.items && service.items.length > 0) {
							wrapper.service.delete(deployer, {
								service: service.items[0].metadata.name,
								namespace: namespace
							}, mCb);
						} else if (service.metadata) {
							wrapper.service.delete(deployer, {
								service: service.metadata.name,
								namespace: namespace
							}, mCb);
						} else {
							return mCb();
						}
					});
				},
				"usingName": (mCb) => {
					wrapper.service.get(deployer, {
						name: soajsCoreLibs.version.sanitize(options.params.id),
						namespace: namespace
					}, (error, service) => {
						if (error && error.code !== 404) {
							return mCb(error);
						} else if (error && error.code === 404) {
							return mCb();
						} else if (service.items && service.items.length > 0) {
							wrapper.service.delete(deployer, {
								service: service.items[0].metadata.name,
								namespace: namespace
							}, mCb);
						} else if (service.metadata) {
							wrapper.service.delete(deployer, {
								service: service.metadata.name,
								namespace: namespace
							}, mCb);
						} else {
							return mCb();
						}
					});
				}
			}, cb);
		}
		
		function deleteDeployment(deployer, deployment, cb) {
			let contentType = deployment.kind.toLowerCase();
			wrapper[contentType].delete(deployer, {
				name: options.params.id,
				qs: {gracePeriodSeconds: 0},
				namespace: namespace
			}, cb);
		}
		
		function deleteAutoscaler(cb) {
			let autoscalerOptions = Object.assign({}, options);
			autoscalerOptions.params = {id: options.params.id};
			autoscaler.getAutoscaler(autoscalerOptions, (error, hpa) => {
				if (error) {
					return cb(error);
				}
				
				if (!hpa || Object.keys(hpa).length === 0) {
					return cb();
				}
				
				autoscaler.deleteAutoscaler(autoscalerOptions, cb);
			});
		}
		
		function cleanup(deployer, filter) {
			let namespace = lib.buildNameSpace(options);
			wrapper.replicaset.delete(deployer, {qs: filter, namespace: namespace}, (error) => {
				utils.checkError(error, 532, cb, () => {
					wrapper.pod.delete(deployer, {qs: filter, namespace: namespace}, (error) => {
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
				wrapper.service.get(deployer, {}, (error, servicesList) => {
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
				} else {
					namespaceRegExp = new RegExp(options.deployerConfig.namespace.default, 'g');
				}
				
				wrapper.deployment.get(deployer, {qs: filter}, (error, deploymentList) => {
					utils.checkError(error, 536, cb, () => {
						wrapper.daemonset.get(deployer, {qs: filter}, (error, daemonsetList) => {
							utils.checkError(error, 663, cb, () => {
								wrapper.cronjob.get(deployer, {qs: filter}, (error, cronJobList) => {
									utils.checkError(error, 663, cb, () => {
										let deployments = [];
										if (deploymentList && deploymentList.items && deploymentList.items.length > 0) {
											deployments = deployments.concat(deploymentList.items);
										}
										if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) {
											deployments = deployments.concat(daemonsetList.items);
										}
										if (cronJobList && cronJobList.items && cronJobList.items.length > 0) {
											deployments = deployments.concat(cronJobList.items);
										}
										
										utils.checkError(deployments.length === 0, 657, cb, () => {
											async.filter(deployments, (oneDeployment, callback) => {
												return callback(null, (oneDeployment.metadata.namespace.match(namespaceRegExp)));
											}, function (error, namespaceDeployments) {
												namespaceDeployments.forEach((oneDeployment) => {
													if (oneDeployment.metadata && oneDeployment.metadata.labels && oneDeployment.metadata.labels['soajs.service.version']) {
														latestVersion = soajsCoreLibs.version.getLatest(soajsCoreLibs.version.unsanitize(oneDeployment.metadata.labels['soajs.service.version']), soajsCoreLibs.version.unsanitize(latestVersion));
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
				
				wrapper.service.get(deployer, {qs: filter, namespace: namespace}, (error, serviceList) => {
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
