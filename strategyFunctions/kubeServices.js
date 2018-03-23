/* jshint esversion: 6 */
'use strict';

const utils = require('../utils/utils.js');
const lib = require('../utils/kubernetes.js');
const autoscaler = require('./kubeAutoscale.js');

const errorFile = require('../utils/errors.js');

const WebSocket = require('ws');
const async = require('async');
const request = require('request');
const utilLog = require('util');
const path = require('path');

const gridfsColl = 'fs.files';

var engine = {
	
	/**
	 * Creates a new namespace
	 * @param options
	 * @param cb
	 */
	createNameSpace(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.namespaces.get({}, function (error, namespacesList) {
					utils.checkError(error, 670, cb, () => {
						let namespaceName = lib.buildNameSpace(options);
						async.detect(namespacesList.items, function (oneNamespace, callback) {
							return callback(null, oneNamespace.metadata.name === namespaceName);
						}, function (error, foundNamespace) {
							utils.checkError(foundNamespace, 672, cb, () => {
								utilLog.log('Creating a new namespace: ' + namespaceName + ' ...');
								let namespace = {
									kind: 'Namespace',
									apiVersion: 'v1',
									metadata: {
										name: namespaceName,
										labels: {
											'soajs.content': 'true',
											'name': namespaceName
										}
									}
								};
								deployer.core.namespace.post({body: namespace}, cb);
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Returns a list of namespaces in the kubernetes cluster
	 * @param options
	 * @param cb
	 */
	listNameSpaces(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.namespaces.get({}, function (error, namespacesList) {
					utils.checkError(error, 670, cb, () => {
						async.map(namespacesList.items, function (oneNamespace, callback) {
							return callback(null, lib.buildNameSpaceRecord(oneNamespace));
						}, function (error, namespaces) {
							return cb(null, namespaces);
						});
					});
				});
			});
		});
	},
	
	/**
	 * Deletes a namespace
	 * @param options
	 * @param cb
	 */
	deleteNameSpace(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespaceName = lib.buildNameSpace(options);
				
				deployer.core.namespaces.delete({name: namespaceName}, function (error, namespacesList) {
					utils.checkError(error, 671, cb, () => {
						return cb(null, namespacesList.items);
					});
				});
			});
		});
	},
	
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
				filter.labelSelector = 'soajs.service.label= ' + oneDeployment.metadata.name;
				if (options.params && options.params.env && !options.params.custom) {
					filter.labelSelector = 'soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.label= ' + oneDeployment.metadata.name;
				}
				else if (options.params && options.params.custom) {
					if (oneDeployment.spec && oneDeployment.spec.selector && oneDeployment.spec.selector.matchLabels) {
						filter.labelSelector = lib.buildLabelSelector(oneDeployment.spec.selector);
					}
				}
				//get services from all namespaces
				deployer.core.services.get({qs: filter}, (error, serviceList) => {
					if (error) {
						return callback(error);
					}
					
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
						if (error) {
							return callback(error);
						}
						
						async.map(podsList.items, (onePod, callback) => {
							if (options.params && !options.params.custom) {
								return callback(null, lib.buildPodRecord({pod: onePod}));
							}
							else { //custom services do not include soajs labels that identify deployment name
								return callback(null, lib.buildPodRecord({pod: onePod, deployment: oneDeployment}));
							}
						}, (error, pods) => {
							if (error) {
								return callback(error);
							}
							
							record.tasks = pods;
							
							options.params = {id: oneDeployment.metadata.name};
							autoscaler.getAutoscaler(options, (error, hpa) => {
								if (error) {
									return callback(error);
								}
								
								record.autoscaler = hpa;
								return callback(null, record);
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
		for (let i = 0; i < options.params.variables.length; i++) {
			if (options.params.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
				options.params.variables[i] = options.params.variables[i].replace("$SOAJS_DEPLOY_HA", "kubernetes");
				break;
			}
		}
		
		let ports = [], service = null;
		if (options.params.ports && options.params.ports.length > 0) {
			let serviceSchemaPath = path.join(__dirname, '../schemas/kubernetes/service.template.js');
			if (require.resolve(serviceSchemaPath)) {
				delete require.cache[require.resolve(serviceSchemaPath)];
			}
			service = utils.cloneObj(require(serviceSchemaPath));
			if (options.params.customName) {
				service.metadata.name = cleanLabel(options.params.name);
			}
			else {
				service.metadata.name = cleanLabel(options.params.name) + '-service';
			}
			
			service.metadata.labels = options.params.labels;
			service.spec.selector = {'soajs.service.label': options.params.labels['soajs.service.label']};
			
			options.params.ports.forEach((onePortEntry, portIndex) => {
				let portConfig = {
					protocol: ((onePortEntry.protocol) ? onePortEntry.protocol.toUpperCase() : 'TCP'),
					name: onePortEntry.name || 'port' + portIndex,
					port: onePortEntry.port || onePortEntry.target,
					targetPort: onePortEntry.target
				};
				
				if (onePortEntry.isPublished) {
					if (!onePortEntry.published) {
						service.spec.type = 'LoadBalancer';
						delete portConfig.nodePort;
					}
					else {
						if (!service.spec.type || service.spec.type !== 'NodePort') {
							service.spec.type = 'NodePort';
						}
						portConfig.nodePort = onePortEntry.published || portConfig.targetPort;
					}
					
					portConfig.name = onePortEntry.name || 'published' + portConfig.name;
					
					if (onePortEntry.preserveClientIP) {
						service.spec.externalTrafficPolicy = 'Local';
					}
				}
				
				ports.push(portConfig);
			});
			
			service.spec.ports = ports;
		}
		let payload = {};
		if (options.params.replication.mode === 'deployment') {
			let deploymentSchemaPath = path.join(__dirname, '../schemas/kubernetes/deployment.template.js');
			if (require.resolve(deploymentSchemaPath)) {
				delete require.cache[require.resolve(deploymentSchemaPath)];
			}
			payload = utils.cloneObj(require(deploymentSchemaPath));
			options.params.type = 'deployment';
		}
		else if (options.params.replication.mode === 'daemonset') {
			let daemonsetSchemaPath = path.join(__dirname, '../schemas/kubernetes/daemonset.template.js');
			if (require.resolve(daemonsetSchemaPath)) {
				delete require.cache[require.resolve(daemonsetSchemaPath)];
			}
			payload = utils.cloneObj(require(daemonsetSchemaPath));
			options.params.type = 'daemonset';
		}
		payload.metadata.name = cleanLabel(options.params.name);
		payload.metadata.labels = options.params.labels;
		payload.metadata.labels['soajs.service.label'] = cleanLabel(payload.metadata.labels['soajs.service.label']);
		
		if (options.params.type === 'deployment') {
			payload.spec.replicas = options.params.replication.replicas;
		}
		
		payload.spec.selector.matchLabels = {'soajs.service.label': cleanLabel(options.params.labels['soajs.service.label'])};
		payload.spec.template.metadata.name = cleanLabel(options.params.labels['soajs.service.name']);
		payload.spec.template.metadata.labels = options.params.labels;
		//NOTE: only one container is being set per pod
		payload.spec.template.spec.containers[0].name = cleanLabel(options.params.labels['soajs.service.name']);
		payload.spec.template.spec.containers[0].image = options.params.image;
		payload.spec.template.spec.containers[0].imagePullPolicy = options.params.imagePullPolicy || 'Always';
		payload.spec.template.spec.containers[0].env = lib.buildEnvList({envs: options.params.variables});
		
		if (options.params.containerDir) {
			payload.spec.template.spec.containers[0].workingDir = options.params.containerDir;
		}
		else {
			delete payload.spec.template.spec.containers[0].workingDir;
		}
		
		if (options.params.command && Array.isArray(options.params.command) && options.params.command.length > 0) {
			payload.spec.template.spec.containers[0].command = options.params.command;
		}
		else {
			delete payload.spec.template.spec.containers[0].command;
		}
		
		if (options.params.args && Array.isArray(options.params.args) && options.params.args.length > 0) {
			payload.spec.template.spec.containers[0].args = options.params.args;
		}
		else {
			delete payload.spec.template.spec.containers[0].args;
		}
		
		if (options.params.memoryLimit) {
			payload.spec.template.spec.containers[0].resources = {
				limits: {
					memory: options.params.memoryLimit
				}
			};
		}
		
		if (options.params.cpuLimit) {
			if (!payload.spec.template.spec.containers[0].resources) payload.spec.template.spec.containers[0].resources = {};
			if (!payload.spec.template.spec.containers[0].resources.limits) payload.spec.template.spec.containers[0].resources.limits = {};
			payload.spec.template.spec.containers[0].resources.limits.cpu = options.params.cpuLimit;
		}
		
		if (ports && ports.length > 0) {
			payload.spec.template.spec.containers[0].ports = [];
			ports.forEach((onePort) => {
				payload.spec.template.spec.containers[0].ports.push({
					name: onePort.name,
					containerPort: onePort.port
				});
			});
		}
		//[a-z0-9]([-a-z0-9]*[a-z0-9])?
		if (options.params.voluming && options.params.voluming.volumes && options.params.voluming.volumeMounts) {
			payload.spec.template.spec.volumes = payload.spec.template.spec.volumes.concat(options.params.voluming.volumes);
			payload.spec.template.spec.containers[0].volumeMounts = payload.spec.template.spec.containers[0].volumeMounts.concat(options.params.voluming.volumeMounts);
		}
		
		//added support for annotations
		if (options.params.annotations) {
			payload.spec.template.metadata.annotations = options.params.annotations;
		}
		
		if (options.params.readinessProbe) {
			payload.spec.template.spec.containers[0].readinessProbe = options.params.readinessProbe;
		}
		
		let namespace = null;
		
		if (options.params.namespace) {
			namespace = options.params.namespace;
		} else {
			options.params.serviceCreation = true;
			namespace = lib.buildNameSpace(options);
		}
		//namespace to be checked by initNamespace function
		options.checkNamespace = namespace;
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				initNamespace(deployer, options, function (error) {
					if (service) {
						deployer.core.namespaces(namespace).services.post({body: service}, (error) => {
							utils.checkError(error, 525, cb, () => {
								return createDeployment();
							});
						});
					}
					else {
						return createDeployment();
					}
				});
			});
			
			function createDeployment() {
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
		});
		
		function cleanLabel(label) {
			return label.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
		}
		
		function initNamespace(deployer, options, cb) {
			//options.namespace
			//1. check if namespace already exists. if it does, return true
			//2. if namespace does not exist create it and return true
			deployer.core.namespaces.get({}, function (error, namespacesList) {
				if (error) return cb(error);
				
				async.detect(namespacesList.items, function (oneNamespace, callback) {
					return callback(null, oneNamespace.metadata.name === options.checkNamespace);
				}, function (error, foundNamespace) {
					if (foundNamespace) {
						return cb(null, true);
					}
					
					let namespace = {
						kind: 'Namespace',
						apiVersion: 'v1',
						metadata: {
							name: options.checkNamespace,
							labels: {
								'soajs.content': 'true'
							}
						}
					};
					deployer.core.namespace.post({body: namespace}, cb);
				});
			});
		}
		
		function checkAutoscaler(options, cb) {
			if (options.params.autoScale && Object.keys(options.params.autoScale).length > 0) {
				let name = cleanLabel(options.params.name);
				let type = options.params.type;
				options.params = options.params.autoScale;
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
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.getDeployment(options, deployer, (error, deployment) => {
					utils.checkError(error || !deployment, 536, cb, () => {
						let namespace = lib.buildNameSpace(options);
						let contentType = deployment.kind.toLowerCase();
						let check = (deployment.spec && deployment.spec.template && deployment.spec.template.spec && deployment.spec.template.spec.containers && deployment.spec.template.spec.containers[0]);
						utils.checkError(!check, 653, cb, () => {
							if (!deployment.spec.template.spec.containers[0].env) deployment.spec.template.spec.containers[0].env = [];
							
							if (options.params.action === 'redeploy') {
								deployment.spec.template.spec.containers[0].env.push({
									name: 'SOAJS_REDEPLOY_TRIGGER',
									value: 'true'
								});
								deployer.extensions.namespaces(namespace)[contentType].put({
									name: options.params.id,
									body: deployment
								}, (error) => {
									utils.checkError(error, 653, cb, cb.bind(null, null, true));
								});
							}
							else if (options.params.action === 'rebuild') {
								if (options.params.newBuild.variables && Array.isArray(options.params.newBuild.variables)) {
									for (let i = 0; i < options.params.newBuild.variables.length; i++) {
										if (options.params.newBuild.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
											options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_DEPLOY_HA", "kubernetes");
											break;
										}
									}
								}
								deployment.metadata.labels = options.params.newBuild.labels;
								deployment.spec.template.metadata.labels = options.params.newBuild.labels;
								deployment.spec.template.spec.containers[0].env = lib.buildEnvList({envs: options.params.newBuild.variables});
								deployment.spec.template.spec.containers[0].image = options.params.newBuild.image;
								deployment.spec.template.spec.containers[0].imagePullPolicy = options.params.newBuild.imagePullPolicy;
								deployment.spec.template.spec.containers[0].command = options.params.newBuild.command;
								deployment.spec.template.spec.containers[0].args = options.params.newBuild.args;
								if (options.params.newBuild.voluming && Object.keys(options.params.newBuild.voluming).length > 0) {
									deployment.spec.template.spec.volumes = options.params.newBuild.voluming.volumes || [];
									deployment.spec.template.spec.containers[0].volumeMounts = options.params.newBuild.voluming.volumeMounts || [];
								}
								
								if (options.params.newBuild.memoryLimit) {
									if (!deployment.spec.template.spec.containers[0].resources) deployment.spec.template.spec.containers[0].resources = {};
									if (!deployment.spec.template.spec.containers[0].resources.limits) deployment.spec.template.spec.containers[0].resources.limits = {};
									deployment.spec.template.spec.containers[0].resources.limits.memory = options.params.newBuild.memoryLimit;
								}
								
								if (options.params.newBuild.cpuLimit) {
									if (!deployment.spec.template.spec.containers[0].resources) deployment.spec.template.spec.containers[0].resources = {};
									if (!deployment.spec.template.spec.containers[0].resources.limits) deployment.spec.template.spec.containers[0].resources.limits = {};
									deployment.spec.template.spec.containers[0].resources.limits.cpu = options.params.newBuild.cpuLimit;
								}
								
								if (options.params.newBuild.ports && options.params.newBuild.ports.length > 0) {
									let filter = {labelSelector: 'soajs.service.label=' + options.params.id};
									deployer.core.namespaces(namespace).services.get({qs: filter}, (error, servicesList) => {
										utils.checkError(error, 533, cb, () => {
											//service already found, update it
											if (servicesList && servicesList.items && servicesList.items.length > 0) {
												servicesList.items[0].spec.ports = options.params.newBuild.ports;
												let service = AddServicePorts(servicesList.items[0], options.params.newBuild.ports);
												deployer.core.namespaces(namespace).services.put({
													name: service.metadata.name,
													body: service
												}, (error) => {
													utils.checkError(error, 673, cb, () => {
														deployer.extensions.namespaces(namespace)[contentType].put({
															name: options.params.id,
															body: deployment
														}, (error) => {
															utils.checkError(error, 653, cb, cb.bind(null, null, true));
														});
													});
												});
											}
											//service not found, create it
											else {
												let service = utils.cloneObj(require(__dirname + '/../schemas/kubernetes/service.template.js'));
												service.metadata.name = cleanLabel(options.params.name) + '-service';
												
												service.metadata.labels = options.params.labels;
												service.spec.selector = {'soajs.service.label': options.params.labels['soajs.service.label']};
												service = AddServicePorts(service, options.params.newBuild.ports);
												deployer.core.namespaces(namespace).services.post({body: service}, (error) => {
													utils.checkError(error, 525, cb, () => {
														deployer.extensions.namespaces(namespace)[contentType].put({
															name: options.params.id,
															body: deployment
														}, (error) => {
															utils.checkError(error, 653, cb, cb.bind(null, null, true));
														});
													});
												});
											}
										});
									});
								}
								else {
									deployer.extensions.namespaces(namespace)[contentType].put({
										name: options.params.id,
										body: deployment
									}, (error) => {
										utils.checkError(error, 653, cb, cb.bind(null, null, true));
									});
								}
							}
						});
					});
				});
			});
		});
		
		function AddServicePorts(service, ports) {
			let portsOutput = [], preserveClientIP = false;
			if (ports && ports.length > 0) {
				ports.forEach((onePortEntry, portIndex) => {
					let portConfig = {
						protocol: ((onePortEntry.protocol) ? onePortEntry.protocol.toUpperCase() : 'TCP'),
						name: onePortEntry.name || 'port' + portIndex,
						port: onePortEntry.target,
						targetPort: onePortEntry.target
					};
					
					if (onePortEntry.isPublished) {
						if (!onePortEntry.published) {
							service.spec.type = 'LoadBalancer';
							delete portConfig.nodePort;
						}
						else {
							if (!service.spec.type || service.spec.type !== 'NodePort') {
								service.spec.type = 'NodePort';
							}
							portConfig.nodePort = onePortEntry.published || portConfig.targetPort;
						}
						
						portConfig.name = onePortEntry.name || 'published' + portConfig.name;
						
						if (onePortEntry.preserveClientIP) {
							service.spec.externalTrafficPolicy = 'Local';
							preserveClientIP = true;
						}
					}
					
					portsOutput.push(portConfig);
				});
				
				if (!preserveClientIP && service && service.spec && service.spec.externalTrafficPolicy === 'Local') {
					delete service.spec.externalTrafficPolicy;
				}
				
				service.spec.ports = portsOutput;
				return service;
			}
		}
		
		function cleanLabel(label) {
			return label.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
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
			let namespace = lib.buildNameSpace(autoscalerOptions);
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
	 * Gathers and returns information about a specified pod in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	inspectTask(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({name: options.params.taskId}, (error, pod) => {
					utils.checkError(error, 656, cb, () => {
						return cb(null, lib.buildPodRecord({pod}));
					});
				});
			});
		});
	},
	
	/**
	 * Collects and returns a container logs based on a pre-defined 'tail' value
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	getContainerLogs(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let params = {
					qs: {
						tailLines: options.params.tail || 400,
						follow: options.params.follow || false
					}
				};
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({name: options.params.taskId}, (error, pod) => {
					utils.checkError(error, 656, cb, () => {
						if (options.params.follow) {
							let stream = deployer.core.namespaces(namespace).pods(options.params.taskId).log.getStream(params);
							return cb(null, stream);
						}
						else {
							deployer.core.namespaces(namespace).pods(options.params.taskId).log.get(params, (error, logs) => {
								utils.checkError(error, 537, cb, () => {
									return cb(null, logs);
								});
							});
						}
					});
				});
			});
		});
	},
	
	/**
	 * Perform a SOAJS maintenance operation on a given service in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	maintenance(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let filter = {
					labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
				};
				
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({qs: filter}, (error, podList) => {
					utils.checkError(error, 659, cb, () => {
						utils.checkError(!podList || !podList.items || podList.items.length === 0, 657, cb, () => {
							async.map(podList.items, (onePod, callback) => {
								process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
								
								function exec(pod, cmd, callback) {
									let response = '', wsError = {}, uri = '';
									
									if (deployer.config && deployer.config.url) {
										uri = `wss://${deployer.config.url.split('//')[1]}`; //remove the https protocol
									}
									
									uri += `/api/v1/namespaces/${namespace}/pods/${onePod.metadata.name}/exec?`;
									uri += 'stdout=1&stdin=1&stderr=1';
									cmd.forEach(subCmd => uri += `&command=${encodeURIComponent(subCmd)}`);
									
									let wsOptions = {};
									if (deployer.config && deployer.config.auth && deployer.config.auth.bearer) {
										wsOptions.headers = {
											'Authorization': `Bearer ${deployer.config.auth.bearer}`
										}
									}
									
									let ws = new WebSocket(uri, "base64.channel.k8s.io", wsOptions);
									ws.on('message', (data) => {
										if (data[0].match(/^[0-3]$/)) {
											response += Buffer.from(data.slice(1), 'base64').toString("ascii");
										}
									});
									
									ws.on('error', (error) => {
										console.log(error);
										wsError = error;
									});
									
									ws.on('close', () => {
										if (wsError && Object.keys(wsError).length > 0) {
											return callback({
												result: false,
												ts: new Date().getTime(),
												error: {
													msg: 'An error occured when trying to reach the target container'
												}
											});
										}
										
										response = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
										
										let operationResponse = {
											id: onePod.metadata.name,
											response: {}
										};
										
										try {
											response = JSON.parse(response);
											operationResponse.response = response;
											return callback(operationResponse);
										}
										catch (e) {
											console.log("Unable to parse maintenance operation output");
											operationResponse.response = true;
											return callback(operationResponse);
										}
									});
								}
								
								exec(onePod.metadata.name, ['/bin/bash', '-c', `curl -s -X GET http://localhost:${options.params.maintenancePort}/${options.params.operation}`], (response) => {
										return callback(null, response);
									}
								)
							}, cb);
						});
					});
				});
			});
		});
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
						
						let namespaceName = (serviceList.items[0].metadata.namespace) ? serviceList.items[0].metadata.namespace : 'default';
						
						//only one service must match the filter, therefore serviceList will contain only one item
						// return cb(null, serviceList.items[0].metadata.name + '.' + namespaceName);
						return cb(null, serviceList.items[0].spec.clusterIP);
					});
				});
			});
		});
	},
	
	/**
	 * Create a secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	createSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				let secret = {
					kind: 'Secret',
					apiVersion: 'v1',
					type: options.params.type || 'Opaque',
					metadata: {
						name: options.params.name,
						labels: {
							'soajs.secret.name': options.params.name,
							'soajs.secret.type': options.params.type || 'Opaque'
						}
					},
					stringData: options.params.data
				};
				deployer.core.namespaces(namespace).secrets.post({body: secret}, function (error, secret) {
					utils.checkError(error, 564, cb, () => {
						return cb(null, {
							name: secret.metadata.name,
							namespace: secret.metadata.namespace,
							uid: secret.metadata.uid,
							data: secret.data,
							type: secret.type
						});
					});
				});
			});
		});
	},
	
	/**
	 * delete a secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	deleteSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).secrets.delete({
					name: options.params.name,
					qs: {gracePeriodSeconds: 0}
				}, function (error, response) {
					utils.checkError(error, 563, cb, () => {
						utils.checkError(response.status !== "Success", 566, cb, () => {
							return cb(null, true);
						});
					});
				});
			});
		});
	},
	
	/**
	 * list secrets
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	listSecrets(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).secrets.get(function (error, secrets) {
					utils.checkError(error, 562, cb, () => {
						return cb(null, lib.buildSecretRecord(secrets));
					});
				});
			});
		});
	},
	
	/**
	 * list secrets
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	getSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).secrets.get({name: options.params.name}, function (error, secret) {
					utils.checkError(error, 565, cb, () => {
						return cb(null, {
							name: secret.metadata.name,
							namespace: secret.metadata.namespace,
							uid: secret.metadata.uid,
							data: secret.data,
							type: secret.type
						});
					});
				});
			});
		});
	},
};

module.exports = engine;
