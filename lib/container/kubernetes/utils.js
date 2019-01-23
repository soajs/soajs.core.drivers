/* jshint esversion: 6 */
'use strict';

const K8Api = require('kubernetes-client');
const config = require('../../../config.js');
const errors = require('../../utils/errors.js');
const utils = require('../../utils/utils.js');
const async = require('async');

const kubeLib = {
	buildNameSpace(options) {
		//if a namespace is already passed, override registry config and use it
		if (options.namespace) {
			return options.namespace;
		}
		let namespace;
		if (options.deployerConfig && options.deployerConfig.namespace){
			namespace = options.deployerConfig.namespace.default;
			
			if (options.deployerConfig.namespace.perService) {
				//In case of service creation, the service name already contains the env code embedded to it
				if (options.params.id)
					namespace += "-" + options.params.id;
				
				else if (options.params.serviceName)
					namespace += "-" + options.params.env + "-" + options.params.serviceName;
			}
		}
		
		return namespace;
	},
	
	getDeployment(options, deployer, cb) {
		let type = options.params.mode || 'deployment';
		let namespace = kubeLib.buildNameSpace(options);
		deployer.extensions.namespaces(namespace)[type].get({name: options.params.id}, (error, deployment) => {
			if (error && error.code !== 404) return cb(error);
			
			if (deployment && deployment.metadata && deployment.metadata.name) return cb(null, deployment);
			
			//remaining option is error 404, check daemonsets
			//if (error && error.code === 404) console.log(error);
			
			type = 'daemonset';
			deployer.extensions.namespaces(namespace)[type].get({name: options.params.id}, (error, daemonset) => {
				if (error && error.code !== 404) return cb(error);
				if (daemonset && daemonset.metadata && daemonset.metadata.name) return cb(null, daemonset);
				
				return cb();
			});
		});
	},
	
	getService(options, deployer, deployment, cb) {
		let namespace = kubeLib.buildNameSpace(options);
		let filter = {};
		filter.labelSelector = 'soajs.service.label= ' + deployment.metadata.name;
		if (options.params && options.params.env && !options.params.custom) {
			filter.labelSelector = 'soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.label= ' + deployment.metadata.name;
		}
		else if (options.params && options.params.custom) {
			if (deployment.spec && deployment.spec.selector && deployment.spec.selector.matchLabels) {
				filter.labelSelector = kubeLib.buildLabelSelector(deployment.spec.selector);
			}
		}
		deployer.core.namespaces(namespace).services.get({qs: filter}, (error, serviceList) => {
			if (error) {
				return cb(error);
			}
			
			let service = {};
			if (serviceList && serviceList.items && Array.isArray(serviceList.items) && serviceList.items.length > 0) {
				service = serviceList.items[0];
			}
			
			if (!service || !service.metadata || !service.metadata.name) {
				return cb(null, null);
			}
			else {
				return cb(null, service);
			}
		});
	},
	
	getDeployer(options, cb) {
		if (!options.soajs || !options.soajs.registry) {
			return cb({
				source: 'driver',
				value: 'No environment registry passed to driver',
				code: 687,
				msg: errors[687]
			});
		}
		
		let kubeURL = '', kubeConfig;
		if (options.kubeConfig){
			kubeConfig = options.kubeConfig
		}
		else {
			if (options && options.driver && options.driver.split('.')[1] === 'local') {
				kubeURL = config.kubernetes.apiHost;
			}
			else {
				let protocol = 'https://',
					domain = `${options.soajs.registry.apiPrefix}.${options.soajs.registry.domain}`,
					port = (options.deployerConfig && options.deployerConfig.apiPort) ? options.deployerConfig.apiPort : '6443'
				
				//if master node ip is set in deployer config, use it instead of environment domain
				if (options.deployerConfig && options.deployerConfig.nodes) {
					domain = options.deployerConfig.nodes;
				}
				
				kubeURL = `${protocol}${domain}:${port}`;
			}
			
			
			kubeConfig = {
				url: kubeURL,
				auth: {
					bearer: ''
				},
				request: {
					strictSSL: false
				}
			};
			
			if (options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
				kubeConfig.auth.bearer = options.deployerConfig.auth.token;
			}
			
			if (process.env.SOAJS_TEST_KUBE_PORT) {
				//NOTE: unit testing on travis requires a different setup
				kubeConfig.url = 'http://localhost:' + process.env.SOAJS_TEST_KUBE_PORT;
				delete kubeConfig.auth;
			}
		}
		let kubernetes = {};
		kubeConfig.version = 'v1';
		kubernetes.core = new K8Api.Core(kubeConfig);
		
		kubeConfig.version = 'v1beta1';
		kubernetes.extensions = new K8Api.Extensions(kubeConfig);
		
		kubeConfig.version = 'v1';
		kubernetes.autoscaling = new K8Api.Autoscaling(kubeConfig);
		
		kubeConfig.version = "v1alpha1";
		kubeConfig.path = "apis/metrics";
		kubernetes.metrics = new K8Api.Metrics(kubeConfig);
		
		kubeConfig.version = "v1beta1";
		kubeConfig.path = "apis/metrics.k8s.io";
		kubernetes.metricsV2 = new K8Api.Metrics(kubeConfig);
		
		delete kubeConfig.version;
		kubernetes.api = new K8Api.Api(kubeConfig);
		
		//add the configuration used to connect to the api
		kubernetes.config = kubeConfig;
		
		return cb(null, kubernetes);
	},
	
	buildNameSpaceRecord(options) {
		let record = {
			"id": options.metadata.name,
			"name": options.metadata.name,
			"version": options.metadata.resourceVersion,
			"status": options.status,
			"labels": options.metadata.labels
		};
		if (options.metadata.labels){
			record.labels = options.metadata.label;
		}
		
		return record;
	},
	
	buildNodeRecord(options) {
		let record = {
			id: options.node.metadata.name, //setting id = name | kuberenetes api depends on name unlike swarm
			hostname: options.node.metadata.name,
			ip: getIP(options.node.status.addresses),
			version: options.node.metadata.resourceVersion,
			state: getStatus(options.node.status.conditions),
			spec: {
				role: 'manager', //NOTE: set to manager by default for now
				availability: getStatus(options.node.status.conditions)
			},
			resources: {
				cpus: options.node.status.capacity.cpu,
				memory: calcMemory(options.node.status.capacity.memory)
			}
		};
		
		return record;
		
		function calcMemory(memory) {
			let value = memory.substring(0, options.node.status.capacity.memory.length - 2);
			let unit = memory.substring(memory.length - 2);
			
			if (unit === 'Ki') value += '000';
			else if (unit === 'Mi') value += '000000';
			
			return parseInt(value);
		}
		
		function getIP(addresses) {
			let ip = '';
			for (let i = 0; i < addresses.length; i++) {
				if (addresses[i].type === 'LegacyHostIP' || addresses[i].type === 'ExternalIP') {
					ip = addresses[i].address;
					break;
				}
			}
			
			return ip;
		}
		
		function getStatus(statuses) {
			let status = 'unreachable'; //TODO: verify value
			for (let i = 0; i < statuses.length; i++) {
				if (statuses[i].type === 'Ready') {
					status = ((statuses[i].status) ? 'ready' : 'unreachable');
					break;
				}
			}
			
			return status;
		}
	},
	
	buildDeploymentRecord(options, deployerObject) {
		let record = {};
		if (options.deployment) {
			record.id = options.deployment.metadata.name; //setting id = name
			record.version = options.deployment.metadata.resourceVersion;
			record.name = options.deployment.metadata.name;
			record.namespace = options.deployment.metadata.namespace;
			record.labels = utils.normalizeLabels(options.deployment.metadata.labels, /__slash__/g, '\/');
			record.env = getEnvVariables(options.deployment.spec.template.spec);
			record.resources = getResources(options.deployment.spec.template.spec);
			record.tasks = [];
			record.voluming = getVolumes(options.deployment);
		}
		else if(options.service && options.service.metadata && options.service.metadata.labels){
			record.namespace = options.service.metadata.namespace;
			record.labels = utils.normalizeLabels(options.service.metadata.labels, /__slash__/g, '\/');
			record.env = [];
			record.resources = {limits: {}};
			record.tasks = [];
			record.voluming = {};

			if(options.service.metadata.labels['soajs.content']){
				record.id = options.service.metadata.labels['soajs.service.label']; //setting id = name
				record.version = options.service.metadata.labels['soajs.service.version'];
				record.name = options.service.metadata.labels['soajs.service.name'];
			}
			else {
				record.id = options.service.metadata.name; //setting id = name
				record.version = options.service.metadata.resourceVersion;
				record.name = options.service.metadata.name;
			}
		}
		else return null;
		
		let publishedService = false;
		let loadBalancer = false;
		if (options.service) {
			let ip = getLoadBalancerIp(options.service);
			if (ip) {
				record.ip = ip
			}
		}
		
		//has to run after checking loadBalancer
		record.ports = getPorts(options.service);
		if (!loadBalancer) {
			//check external ip
			if(options.nodeList.items && Array.isArray(options.nodeList.items) && options.nodeList.items[0].status && options.nodeList.items[0].status.addresses){
				options.nodeList.items[0].status.addresses.forEach((oneAddress) => {
					if(oneAddress.type === 'ExternalIP'){
						record.ip = oneAddress.address;
					}
				});
			}
			
			if (!record.ip && options.nodeList && options.nodeList.items && Array.isArray(options.nodeList.items) && options.nodeList.items.length === 1) {
				record.ip = deployerObject.deployerConfig.nodes;
			}
			
			if (publishedService) {
				record.servicePortType = 'nodePort';
			}
		}
		else {
			record.servicePortType = 'LoadBalancer';
		}
		
		if (!publishedService) {
			delete record.ip;
		}
		
		return record;
		
		function getEnvVariables(podSpec) {
			//current deployments include only one container per pod, variables from the first container are enough
			let envs = [];
			
			if (podSpec && podSpec.containers && podSpec.containers.length > 0 && podSpec.containers[0].env) {
				podSpec.containers[0].env.forEach((oneEnv) => {
					if (oneEnv.value) {
						envs.push(oneEnv.name + '=' + oneEnv.value);
					}
					else {
						//automatically generated values are delected here, actual values are not included
						if (oneEnv.valueFrom && oneEnv.valueFrom.fieldRef && oneEnv.valueFrom.fieldRef.fieldPath) {
							envs.push(oneEnv.name + '=' + oneEnv.valueFrom.fieldRef.fieldPath);
						}
						else {
							envs.push(oneEnv.name + '=' + JSON.stringify(oneEnv.valueFrom, null, 0));
						}
					}
				});
			}
			
			return envs;
		}
		
		function getPorts(service) {
			if (!service || !service.hasOwnProperty('spec') || !service.spec.hasOwnProperty('ports')) return [];
			
			let deploymentPorts = [];
			service.spec.ports.forEach((onePortConfig) => {
				let port = {
					protocol: onePortConfig.protocol,
					target: onePortConfig.targetPort || onePortConfig.port,
					published: onePortConfig.nodePort || null
				};
				
				if (loadBalancer) {
					port.published = port.target;
				}
				
				if (port.published) {
					publishedService = true;
				}
				
				if (service.spec && service.spec.externalTrafficPolicy === 'Local') {
					port.preserveClientIP = true;
				}
				
				deploymentPorts.push(port);
			});
			
			return deploymentPorts;
		}
		
		function getResources(podSpec) {
			//current deployments include one container per pod, resources from the first container are enough
			let resources = {limits: {}};
			
			if (podSpec && podSpec.containers && podSpec.containers.length > 0 && podSpec.containers[0].resources) {
				if (podSpec.containers[0].resources.limits) {
					if (podSpec.containers[0].resources.limits.memory) resources.limits.memory = podSpec.containers[0].resources.limits.memory;
					if (podSpec.containers[0].resources.limits.cpu) resources.limits.cpu = podSpec.containers[0].resources.limits.cpu;
				}
			}
			
			return resources;
		}
		
		function getLoadBalancerIp(service) {
			if (service && service.status && service.status.loadBalancer && service.status.loadBalancer.ingress
				&& service.status.loadBalancer.ingress[0] && service.status.loadBalancer.ingress[0].ip) {
				loadBalancer = true;
				return service.status.loadBalancer.ingress[0].ip; //NOTE: not sure about this, need access to a gke deployment to verify it
			}
			else {
				return null;
			}
		}
		
		function getVolumes(deployment) {
			let voluming = {};
			if (deployment && deployment.spec && deployment.spec.template && deployment.spec.template.spec) {
				if (deployment.spec.template.spec.volumes && Array.isArray(deployment.spec.template.spec.volumes)) {
					voluming.volumes = deployment.spec.template.spec.volumes;
				}
				if (deployment.spec.template.spec.containers && Array.isArray(deployment.spec.template.spec.containers) && deployment.spec.template.spec.containers[0]) {
					if (deployment.spec.template.spec.containers[0].volumeMounts && Array.isArray(deployment.spec.template.spec.containers[0].volumeMounts)) {
						voluming.volumeMounts = deployment.spec.template.spec.containers[0].volumeMounts;
					}
				}
			}
			
			return voluming;
		}
	},
	
	buildPodRecord(options) {
		let serviceName = '';
		if (!options.pod || !options.pod.metadata || !options.pod.metadata.labels || !options.pod.metadata.labels['soajs.service.label']) {
			if (options.deployment && options.deployment.metadata && options.deployment.metadata.name) {
				serviceName = options.deployment.metadata.name;
			}
		}
		else {
			serviceName = options.pod.metadata.labels['soajs.service.label'];
		}
		
		let record = {
			id: options.pod.metadata.name,
			version: options.pod.metadata.resourceVersion,
			name: options.pod.metadata.name,
			ref: {
				service: {
					name: serviceName,
					id: serviceName
				},
				node: {
					id: options.pod.spec.nodeName
				},
				container: { //only one container runs per pod in the current setup
					id: ((options.pod.status &&
						options.pod.status.containerStatuses &&
						options.pod.status.containerStatuses[0] &&
						options.pod.status.containerStatuses[0].containerID) ? options.pod.status.containerStatuses[0].containerID.split('//')[1] : null)
				}
			},
			status: {
				ts: options.pod.metadata.creationTimestamp,
				message: options.pod.status.message
			}
		};
		if (options.pod.status && options.pod.status.phase){
			record.status.state =  options.pod.status.phase.charAt(0).toLowerCase() + options.pod.status.phase.slice(1)
		}
		return record;
	},
	
	buildAutoscalerRecord(options) {
		let record = {replicas: {}, metrics: {}};
		
		if (options.hpa) {
			if (options.hpa.spec) {
				if (options.hpa.spec.minReplicas) record.replicas.min = options.hpa.spec.minReplicas;
				if (options.hpa.spec.maxReplicas) record.replicas.max = options.hpa.spec.maxReplicas;
				
				if (options.hpa.apiVersion === 'autoscaling/v2alpha1') {
					if (options.hpa.spec.metrics) {
						options.hpa.spec.metrics.forEach((oneMetric) => {
							//NOTE: only supported metric for now is CPU
							if (oneMetric.resource && oneMetric.resource.name === 'cpu') {
								record.metrics[oneMetric.resource.name] = {percent: oneMetric.resource.targetAverageUtilization};
							}
						});
					}
				}
				else if (options.hpa.apiVersion === 'autoscaling/v1') {
					//NOTE: only supported metric for now is CPU
					if (options.hpa.spec.targetCPUUtilizationPercentage) {
						record.metrics['cpu'] = {percent: options.hpa.spec.targetCPUUtilizationPercentage};
					}
				}
			}
		}
		
		return record;
	},
	
	buildEnvList(options) {
		let envs = [];
		options.envs.forEach((oneVar) => {
			if (typeof oneVar === 'object'){
				envs.push(oneVar)
			}
			else {
				let envVariable = oneVar.split('=');
				
				if (envVariable[1] === '$SOAJS_HA_NAME') {
					envs.push({
						name: envVariable[0],
						valueFrom: {
							fieldRef: {
								fieldPath: 'metadata.name'
							}
						}
					});
				}
				else {
					envs.push({name: envVariable[0], value: envVariable[1]});
				}
			}
		});
		
		return envs;
	},
	
	buildLabelSelector(options) {
		let labelSelector = '';
		
		if (!options || !options.matchLabels || Object.keys(options.matchLabels).length === 0) return labelSelector;
		
		let labels = Object.keys(options.matchLabels);
		
		for (let i = 0; i < labels.length; i++) {
			if (labelSelector.length > 0) labelSelector += ', ';
			labelSelector += labels[i] + '=' + options.matchLabels[labels[i]];
		}
		
		return labelSelector;
	},
	
	buildSecretRecord(options) {
		let response = [];
		if (options.items && options.items.length > 0) {
			options.items.forEach(function (oneSecret) {
				response.push({
					name: oneSecret.metadata.name,
					namespace: oneSecret.metadata.namespace,
					uid: oneSecret.metadata.uid,
					data: oneSecret.data,
					type: oneSecret.type
				})
			});
		}
		return response;
	},
	
	checkNameSpace(deployer, options, mainCb, call) {
		deployer.core.namespaces.get({}, function (error, namespacesList) {
			utils.checkError(error, 520, mainCb, () => {
				let namespace =  (options.params && options.params.namespace) ? options.params.namespace : kubeLib.buildNameSpace(options);
				async.detect(namespacesList.items, function (oneNamespace, callback) {
					return callback(null, oneNamespace.metadata.name === namespace);
				}, function (error, namespace) {
					utils.checkError(!namespace, 571, mainCb, () => {
						return call(null, namespace.metadata.name);
					});
				});
			});
		});
	},
	
	checkSecrets(options, secrets, cb) {
		if (options.params.inputmaskData && options.params.inputmaskData.custom.secrets && Array.isArray(options.params.inputmaskData.custom.secrets) && options.params.inputmaskData.custom.secrets.length > 0) {
			if (secrets && secrets.length > 0) {
				let dockerServiceSecrets = [];
				let certificateSecret;
				async.eachSeries(options.params.inputmaskData.custom.secrets, function(oneInputSecret, callback) {
					let found = false;
					secrets.forEach((oneSecret) => {
						if (oneSecret.name === oneInputSecret.name) {
							found = true;
							let volumeName = oneSecret.name.replace(/\s/g, '-').toLowerCase();
							
							//volumes already reverted to use old schema
							let volumeFound = false;
							options.params.catalog.recipe.deployOptions.voluming.volumes.forEach((oneVolume)=>{
								if (oneVolume.name === volumeName){
									volumeFound = true;
								}
							});
							if (!volumeFound){
								options.params.catalog.recipe.deployOptions.voluming.volumes.push({
									"name": volumeName,
									"secret": {
										"secretName": oneSecret.name
									}
								});
							}
							let volumeFoundMount = false;
							options.params.catalog.recipe.deployOptions.voluming.volumeMounts.forEach((oneVolumeMount)=>{
								if (oneVolumeMount.name === volumeName){
									volumeFoundMount = true;
									oneVolumeMount.mountPath = oneInputSecret.mountPath;
									oneVolumeMount.readOnly = true;
								}
							});
							if (!volumeFoundMount){
								options.params.catalog.recipe.deployOptions.voluming.volumeMounts.push({
									"mountPath": oneInputSecret.mountPath, // "/etc/soajs/ssl/",
									"name": volumeName,
									"readOnly": true
								});
							}
							
							if (options.params.catalog.recipe.certificates !== 'none' && oneInputSecret.type === 'certificate') {
								certificateSecret = oneInputSecret;
							}
						}
					});
					if (!found) {
						return callback({code: 726, message: errors[726].replace("%secret_name%", oneInputSecret.name) });
					}
					else {
						return callback(null, true);
					}
					
				}, (err)=>{
					if (err){
						return cb(err);
					}
					//one of the secrets contains custom certificates, add path as env and instruct deployer to use it
					if(certificateSecret){
						options.params.catalog.recipe.buildOptions.env['SOAJS_NX_SSL_CERTS_LOCATION'] = {
							"type": "static",
							"value": certificateSecret.mountPath || "/etc/soajs/ssl"
						};
						//do not override
						if (!options.params.catalog.recipe.buildOptions.env['SOAJS_NX_CUSTOM_SSL']){
							options.params.catalog.recipe.buildOptions.env['SOAJS_NX_CUSTOM_SSL'] = {
								"type": "static",
								"value": "true"
							};
						}
					}
					
					//works with custom or self signed certificates
					let https = ["SOAJS_NX_API_HTTPS", "SOAJS_NX_API_HTTP_REDIRECT", "SOAJS_NX_SITE_HTTPS", "SOAJS_NX_SITE_HTTP_REDIRECT"];
					https.forEach((oneEnv) => {
						if (!options.params.catalog.recipe.buildOptions.env[oneEnv]){
							options.params.catalog.recipe.buildOptions.env[oneEnv] = {
								"type": "static",
								"value": "true"
							};
						}
					});
					
					options.params.data.secrets = dockerServiceSecrets;
					return cb(null);
				});
			}
			else {
				return cb({code: 725, "message": errors[725]});
			}
		}
		else {
			return cb(null);
		}
	}
};

module.exports = kubeLib;
