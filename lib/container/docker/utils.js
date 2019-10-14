/* jshint esversion: 6 */

'use strict';

const errors = require('../../utils/errors');

const Docker = require('dockerode');

const lib = {
	getDeployer(options, cb) {
		let deployer = {};
		
		if (!options.env) {
			if (options.params && options.params.env) {
				options.env = options.params.env;
			}
			else if (options.soajs && options.soajs.registry && options.soajs.registry.code) {
				options.env = options.soajs.registry.code.toLowerCase();
			}
			else {
				return cb({
					source: 'driver',
					value: 'No environment code passed to driver',
					code: 686,
					msg: errors[686]
				});
			}
		}
		
		if (!options.soajs || !options.soajs.registry) {
			return cb({
				source: 'driver',
				value: 'No environment registry passed to driver',
				code: 687,
				msg: errors[687]
			});
		}
		
		if (options && options.driver && options.driver.split('.')[1] === 'local') {
			return redirectToProxy();
		}
		
		let protocol = (options.deployerConfig && options.deployerConfig.apiProtocol) ? options.deployerConfig.apiProtocol + '://' : 'https://',
			domain = `${options.soajs.registry.apiPrefix}.${options.soajs.registry.domain}`,
			port = (options.deployerConfig && options.deployerConfig.apiPort) ? options.deployerConfig.apiPort : '2376';
		
		//if manager node ip is set in deployer config, use it instead of environment domain
		if (options.deployerConfig && options.deployerConfig.nodes) {
			domain = options.deployerConfig.nodes;
		}
		
		if (options && options.params && options.params.targetHost) {
			domain = options.params.targetHost;
			if (options.params.targetPort) {
				port = options.params.targetPort;
			}
		}
		let host = `${protocol}${domain}:${port}`;
		
		if (options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
			return useApiWithToken();
		}
		else {
			return cb({source: 'driver', value: 'Invalid docker configuration detected', code: 687, msg: errors[687]});
		}
		
		function redirectToProxy() {
			let ports = null;
			if (options.soajs.registry){
				if (options.soajs.registry.services && options.soajs.registry.services.config && options.soajs.registry.services.config.ports){
					ports = options.soajs.registry.services.config.ports;
				}
				else if (options.soajs.registry.serviceConfig && options.soajs.registry.serviceConfig.ports) {
					ports = options.soajs.registry.serviceConfig.ports;
				}
			}
			if (ports) {
				deployer = new Docker({
					host: ((process.env.SOAJS_ENV) ? process.env.SOAJS_ENV.toLowerCase() : 'dev') + '-controller',
					port: ports.controller + ports.maintenanceInc,
					version: 'proxySocket'
				});
				return cb(null, deployer);
			}
			else {
				return cb({source: 'driver', value: 'Invalid docker configuration detected', code: 687, msg: errors[687]});
			}
		}
		
		function useApiWithToken() {
			if (options.returnApiInfo) {
				return cb(null, {host, token: options.deployerConfig.auth.token});
			}
			
			deployer = new Docker({
				protocol: (options.deployerConfig && options.deployerConfig.apiProtocol) ? options.deployerConfig.apiProtocol : 'https',
				host: `${domain}`,
				port: `${port}`,
				headers: {
					'token': options.deployerConfig.auth.token
				}
			});
			
			return cb(null, deployer);
		}
	},
	
	ping(options, cb) {
		options.deployer.ping(cb);
	},
	
	buildNodeRecord(options) {
		let record = {
			id: '',
			hostname: '',
			ip: '',
			version: '',
			state: '',
			spec: {
				role: '',
				availability: ''
			},
			resources: {
				cpus: '',
				memory: ''
			}
		};
		
		if (options && options.node) {
			if (options.node.ID) {
				record.id = options.node.ID;
			}
			
			if (options.node.Description) {
				if (options.node.Description.Hostname) {
					record.hostname = options.node.Description.Hostname;
				}
				if (options.node.Description.Resources) {
					if (options.node.Description.Resources && options.node.Description.Resources.NanoCPUs) {
						record.resources.cpus = options.node.Description.Resources.NanoCPUs / 1000000000;
					}
					if (options.node.Description.Resources.MemoryBytes) {
						record.resources.memory = options.node.Description.Resources.MemoryBytes;
					}
				}
			}
			
			if (options.node.Status) {
				if (options.node.Status.Addr) {
					record.ip = options.node.Status.Addr;
				}
				if (options.node.Status.State) {
					record.state = options.node.Status.State;
				}
			}
			
			if (options.node.Version && options.node.Version.Index) {
				record.version = options.node.Version.Index;
			}
			
			if (options.node.Spec) {
				if (options.node.Spec.Role) {
					record.spec.role = options.node.Spec.Role;
				}
				if (options.node.Spec.Availability) {
					record.spec.availability = options.node.Spec.Availability;
				}
			}
			
			if (record.spec.role === 'manager') {
				record.managerStatus = {
					leader: '',
					reachability: '',
					address: ''
				};
				
				if (options.node.ManagerStatus) {
					if (options.node.ManagerStatus.Leader) {
						record.managerStatus.leader = options.node.ManagerStatus.Leader;
					}
					if (options.node.ManagerStatus.Reachability) {
						record.managerStatus.reachability = options.node.ManagerStatus.Reachability;
					}
					if (options.node.ManagerStatus.Addr) {
						record.managerStatus.address = options.node.ManagerStatus.Addr;
					}
				}
			}
		}
		
		
		return record;
	},
	
	buildServiceRecord(options, deployerObject) {
		let record = {
			id: '',
			version: '',
			name: '',
			labels: {},
			env: [],
			ports: [],
			tasks: [],
			voluming: getVolumes(options.service)
		};
		if (options && options.service) {
			if (options.service.ID) {
				record.id = options.service.ID;
			}
			if (options.service.Version && options.service.Version.Index) {
				record.version = options.service.Version.Index;
			}
			
			if (options.service.Spec) {
				if (options.service.Spec.Name) {
					record.name = options.service.Spec.Name;
				}
				if (options.service.Spec.Labels) {
					record.labels = options.service.Spec.Labels;
				}
				if (options.service.Spec.TaskTemplate && options.service.Spec.TaskTemplate.ContainerSpec && options.service.Spec.TaskTemplate.ContainerSpec.Env) {
					record.env = options.service.Spec.TaskTemplate.ContainerSpec.Env;
				}
				
				if (options.service.Spec.TaskTemplate && options.service.Spec.TaskTemplate.ContainerSpec && options.service.Spec.TaskTemplate.ContainerSpec.Secrets) {
					record.secrets = options.service.Spec.TaskTemplate.ContainerSpec.Secrets;
				}
			}
			
			if (options.service.Endpoint && options.service.Endpoint.Ports && options.service.Endpoint.Ports.length > 0) {
				options.service.Endpoint.Ports.forEach((onePortConfig) => {
					let port = {
						protocol: onePortConfig.Protocol,
						target: onePortConfig.TargetPort
					};
					if (onePortConfig.PublishedPort){
						port.published = onePortConfig.PublishedPort
					}
					if (onePortConfig.PublishMode && onePortConfig.PublishMode === 'host') {
						port.preserveClientIP = true;
					}
					
					record.ports.push(port);
				});
			}
			
			if (options.service.Endpoint && options.service.Endpoint.Spec && options.service.Endpoint.Spec.Ports && options.service.Endpoint.Spec.Ports.length > 0) {
				options.service.Endpoint.Spec.Ports.forEach((onePortConfig) => {
					if (onePortConfig.PublishedPort) {
						record.servicePortType = "nodePort";
					}
				});
				if (!record.servicePortType) {
					
					record.servicePortType = "loadBalancer"
				}
			}
			if (record.ports && record.ports.length > 0) {
				if (deployerObject.driver === "docker.local") {
					record.ip = "127.0.0.1";
				}
				else {
					record.ip = deployerObject.deployerConfig.nodes;
				}
			}
		}
		
		return record;
		
		function getVolumes(service) {
			let voluming = {};
			if (service && service.Spec && service.Spec.TaskTemplate && service.Spec.TaskTemplate.ContainerSpec && service.Spec.TaskTemplate.ContainerSpec.Mounts && Array.isArray(service.Spec.TaskTemplate.ContainerSpec.Mounts)) {
				voluming.volumes = service.Spec.TaskTemplate.ContainerSpec.Mounts;
			}
			
			return voluming;
		}
	},
	
	buildTaskRecord(options) {
		let record = {
			id: '',
			version: '',
			name: '',
			ref: {
				slot: '',
				service: {
					name: '',
					id: ''
				},
				node: {
					id: ''
				},
				container: {
					id: ''
				}
			},
			status: {
				ts: '',
				state: '',
				desiredState: '',
				message: ''
			}
		};
		
		if (options) {
			if (options.serviceName) {
				record.ref.service.name = options.serviceName;
			}
			if (options.task) {
				if (options.task.ID) {
					record.id = options.task.ID;
				}
				if (options.task.Version && options.task.Version.Index) {
					record.version = options.task.Version.Index;
				}
				
				if (options.serviceName) {
					record.name = options.serviceName + ((options.task.Slot) ? '.' + options.task.Slot : ''); //might add extra value later
				}
				if (options.task.Slot) {
					record.ref.slot = options.task.Slot;
				}
				if (options.task.ServiceID) {
					record.ref.service.id = options.task.ServiceID;
				}
				if (options.task.NodeID) {
					record.ref.node.id = options.task.NodeID;
				}
				
				if (options.task.Status) {
					if (options.task.Status.ContainerStatus && options.task.Status.ContainerStatus.ContainerID) {
						record.ref.container.id = options.task.Status.ContainerStatus.ContainerID;
					}
					
					if (options.task.Status.Timestamp) {
						record.status.ts = options.task.Status.Timestamp; //timestamp of the last status update
					}
					if (options.task.Status.State) {
						record.status.state = options.task.Status.State; //current state of the task, example: running
					}
					if (options.task.Status.Message) {
						record.status.message = options.task.Status.Message; //current message of the task, example: started or error,
					}
					
					if (options.task.Status.PortStatus && options.task.Status.PortStatus.Ports && Array.isArray(options.task.Status.PortStatus.Ports) && options.task.Status.PortStatus.Ports.length > 0) {
						if (options.service && options.service.ports && Array.isArray(options.service.ports) && options.service.ports.length > 0) {
							options.service.ports.forEach((oneServicePort) => {
								if (!oneServicePort.published) {
									options.task.Status.PortStatus.Ports.forEach((oneTaskPort) => {
										if (oneTaskPort.TargetPort === oneServicePort.target) {
											oneServicePort.published = oneTaskPort.PublishedPort;
										}
									});
								}
							});
						}
					}
				}
				
				if (options.task.DesiredState) {
					record.status.desiredState = options.task.DesiredState; //desired state of the task, example: running
				}
			}
		}
		
		return record;
	},
	
	buildSecretRecord(options) {
		let response = [];
		if (options && options.length > 0) {
			options.forEach((oneSecret) => {
				response.push({
					name: oneSecret.Spec.Name,
					uid: oneSecret.ID
				});
			});
		}
		return response;
	},
	
	checkSecrets(options, secrets, cb) {
		if (options.params.inputmaskData && options.params.inputmaskData.custom && options.params.inputmaskData.custom.secrets && Array.isArray(options.params.inputmaskData.custom.secrets) && options.params.inputmaskData.custom.secrets.length > 0) {
			if (secrets && secrets.length > 0) {
				let dockerServiceSecrets = [];
				let certificateSecret;
				options.params.inputmaskData.custom.secrets.forEach((oneInputSecret) => {
					let found = false;
					secrets.forEach((oneSecret) => {
						if (oneSecret.name === oneInputSecret.name) {
							found = true;
							let mySecret = {
								id: oneSecret.uid,
								name: oneSecret.name,
								target: oneInputSecret.mountPath,
								UID: "0",
								GID: "0",
								Mode: 644
							};
							dockerServiceSecrets.push(mySecret);
							
							if (options.params.catalog.recipe.certificates !== 'none' && oneInputSecret.type === 'certificate') {
								certificateSecret = oneInputSecret;
							}
						}
					});
					
					if (!found) {
						return cb({code: 726, message: errors[726].replace("%secret_name%", oneInputSecret.name) });
					}
				});
				
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
					//do not override
					if (!options.params.catalog.recipe.buildOptions.env[oneEnv]){
						options.params.catalog.recipe.buildOptions.env[oneEnv] = {
							"type": "static",
							"value": "true"
						};
					}
				});
				
				options.params.data.secrets = dockerServiceSecrets;
				return cb(null);
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

module.exports = lib;
