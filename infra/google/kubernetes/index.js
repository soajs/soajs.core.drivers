'use strict';
const config = require('../config');
const _ = require('lodash');
const async = require("async");
const K8Api = require('kubernetes-client');
const randomstring = require("randomstring");
const traverse = require("traverse");

const networks = require("../cluster/networks.js");

/**
 * appended code for testing
 */
const googleApi = require('../utils/utils.js');
const v1Compute = function () {
	return googleApi.compute();
};
const v1Container = function () {
	return googleApi.container();
};
const v1beta1container = function () {
	return googleApi.v1beta1container();
};

function getConnector(opts) {
	return require('../utils/utils.js').connector(opts);
}

const kubeDriver = require("../../../lib/container/kubernetes/index.js");
const LBDriver = require("../cluster/lb.js");
const infraExtras = require("../cluster/extras.js");

const infraUtils = require("../../utils");

let driver = {
	/**
	 * method used to invoke google api and deploy instances
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
		options.soajs.log.debug("Deploying new Cluster");
		
		let uniqueName = `ht${options.params.soajs_project.toLowerCase()}${randomstring.generate({
			length: 13,
			charset: 'alphanumeric',
			capitalization: 'lowercase'
		})}`;
		
		let request = getConnector(options.infra.api);
		
		let name = '', createNewNetwork = false;
		if (options.infra && options.infra._id && options.soajs && options.soajs.registry && options.soajs.registry.restriction && options.soajs.registry.restriction[options.infra._id]) {
			if (Object.keys(options.soajs.registry.restriction[options.infra._id]).length > 0) {
				options.params.region = Object.keys(options.soajs.registry.restriction[options.infra._id])[0];
				if(options.soajs.registry.restriction[options.infra._id][options.params.region] && options.soajs.registry.restriction[options.infra._id][options.params.region].network) {
					options.soajs.log.debug("Cluster network provided as input, using it to deploy ...");
					name = options.soajs.registry.restriction[options.infra._id][options.params.region].network;
				}
			}
		}
		
		if (!name) {
			options.soajs.log.debug("No cluster network provided, creating a new network for the cluster ...");
			//no create a name made from ht + deployment type + random string
			name = uniqueName;
			createNewNetwork = true;
		}
		
		let oneDeployment = {};
		
		function prepareDeploymentConfiguration(mCb) {
			options.soajs.log.debug("Preparing Deployment Entry in Project");
			
			if (!options.infra.deployments) {
				options.infra.deployments = [];
			}
			
			oneDeployment = {
				id: uniqueName,
				name: uniqueName,
				technology: "kubernetes",
				environments: [options.soajs.registry.code.toUpperCase()],
				options: {}
			};
			
			return mCb(null, true);
		}
		
		/**
		 * method used to create a google vpc network
		 * @returns {*}
		 */
		function createVpcNetwork(mCb) {
			let networksOptions = Object.assign({}, options);
			networksOptions.params = {
				name,
				returnGlobalOperation: true
			};
			networks.add(networksOptions, (error, globalOperationResponse) => {
				if (error) return cb(error);
				
				//assign network name to deployment entry
				oneDeployment.options.network = name;
				
				//check if network is ready then update firewall rules
				checkVpcNetwork(globalOperationResponse, mCb);
			});
			
			function checkVpcNetwork(globalOperationResponse, mCb) {
				
				function globalOperations(miniCB) {
					options.soajs.log.debug("Checking network Create Status");
					//Ref https://cloud.google.com/compute/docs/reference/latest/globalOperations/get
					let request = getConnector(options.infra.api);
					delete request.projectId;
					request.operation = globalOperationResponse.name;
					v1Compute().globalOperations.get(request, (error, response) => {
						if (error) {
							return miniCB(error);
						}
						if (!response || response.status !== "DONE") {
							setTimeout(function () {
								globalOperations(miniCB);
							}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 5000);
						} else {
							return miniCB(null, response);
						}
					});
				}
				
				globalOperations(function (err) {
					if (err) {
						return mCb(err);
					} else {
						//Ref: https://cloud.google.com/compute/docs/reference/latest/firewalls/insert
						let firewallRules = getFirewallRules(oneDeployment.options.network);
						
						let request = getConnector(options.infra.api);
						async.eachSeries(firewallRules, (oneRule, vCb) => {
							options.soajs.log.debug("Registering new firewall rule:", oneRule.name);
							request.resource = oneRule;
							v1Compute().firewalls.insert(request, vCb);
						}, mCb);
					}
				});
				
			}
		}
		
		/**
		 * method used to use an existing google vpc network
		 * @returns {*}
		 */
		function useVpcNetwork(mCb) {
			//assign network name to deployment entry
			oneDeployment.options.network = name;
			
			function patchFirewall() {
				let firewallRules = getFirewallRules(oneDeployment.options.network);
				
				let request = getConnector(options.infra.api);
				request.filter = `network eq .*${oneDeployment.options.network}`;
				request.project = options.infra.api.project;
				
				//list firewalls
				//Ref: https://cloud.google.com/compute/docs/reference/rest/v1/firewalls/list
				v1Compute().firewalls.list(request, function (error, firewalls) {
					if (error) return mCb(error);
					
					if (!firewalls.items) firewalls.items = [];
					
					async.eachSeries(firewallRules, (oneRule, vCb) => {
						let foundFirewall = firewalls.items.find((oneEntry) => {
							return oneEntry.name === oneRule.name
						});
						
						if (foundFirewall) {
							options.soajs.log.debug("Firewall rule:", oneRule.name, "already exists, skipping");
							return vCb();
						} else {
							options.soajs.log.debug("Creating firewall rule:", oneRule.name);
							request.resource = oneRule;
							return v1Compute().firewalls.insert(request, vCb);
						}
					}, mCb);
				});
			}
			
			patchFirewall();
		}
		
		function getFirewallRules(network) {
			let firewallRules = [
				{
					//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-icmp --description=Allows\ ICMP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=icmp --source-ranges=0.0.0.0/0
					"kind": "compute#firewall",
					"name": network + "-allow-icmp",
					"description": "Allow ICMP Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "0.0.0.0/0",
					"allowed": [
						{
							"IPProtocol": "icmp"
						}
					]
				},
				{
					//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-ssh --description=Allows\ TCP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network\ using\ port\ 22. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=tcp:22 --source-ranges=0.0.0.0/0
					"kind": "compute#firewall",
					"name": network + "-allow-ssh",
					"description": "Allow SSH Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "0.0.0.0/0",
					"allowed": [
						{
							"IPProtocol": "tcp",
							"ports": ["22"]
						}
					]
				},
				{
					//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-rdp --description=Allows\ RDP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network\ using\ port\ 3389. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=tcp:3389 --source-ranges=0.0.0.0/0
					"kind": "compute#firewall",
					"name": network + "-allow-rdp",
					"description": "Allow RDP Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "0.0.0.0/0",
					"allowed": [
						{
							"IPProtocol": "tcp",
							"ports": ["3389"]
						}
					]
				},
				{
					"kind": "compute#firewall",
					"name": network + "-allow-http",
					"description": "Allow HTTP Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "0.0.0.0/0",
					"allowed": [
						{
							"IPProtocol": "tcp",
							"ports": ["80"]
						}
					]
				},
				{
					"kind": "compute#firewall",
					"name": network + "-allow-https",
					"description": "Allow HTTPS Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "0.0.0.0/0",
					"allowed": [
						{
							"IPProtocol": "tcp",
							"ports": ["443"]
						}
					]
				},
				{
					//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-internal --description=Allows\ connections\ from\ any\ source\ in\ the\ network\ IP\ range\ to\ any\ instance\ on\ the\ network\ using\ all\ protocols. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=all --source-ranges=10.128.0.0/9
					"kind": "compute#firewall",
					"name": network + "-allow-internal",
					"description": "Allow All Internal Connections",
					"network": "projects/" + options.infra.api.project + "/global/networks/" + network,
					"priority": 65534,
					"sourceRanges": "10.128.0.0/9",
					"allowed": [
						{
							"IPProtocol": "tcp",
							"ports": ["0-65535"]
						}
					]
				}
			];
			
			return firewallRules;
		}
		
		/**
		 * method used to get cluster version
		 * @returns {*}
		 */
		function getClusterVersion(request, mCb) {
			delete request.project;
			v1Container().projects.zones.getServerconfig(request, function (err, response) {
				if (err) {
					return mCb(err);
				}
				let version;
				if (response && response.validMasterVersions && Array.isArray(response.validMasterVersions)
					&& response.validMasterVersions.length > 0) {
					response.validMasterVersions.forEach(function (oneVersion) {
						if (oneVersion.substring(0, 3) === "1.7") {
							version = oneVersion;
							options.soajs.log.debug("Initial Cluster version set to :", version);
						}
					});
					
				} else if (response && response.defaultClusterVersion && !version) {
					version = response.defaultClusterVersion;
					options.soajs.log.debug("Initial Cluster version set to default version :", version);
				} else {
					return mCb({"code": 410, "msg": "Invalid or no kubernetes cluster version found!"})
				}
				return mCb(null, version);
			});
		}
		
		/**
		 * delete vpc Network after a certain timeout
		 * @returns {*}
		 */
		function deleteNetwork() {
			setTimeout(function () {
				//cluster failed, delete network if it was not provided by the user
				let networksOptions = Object.assign({}, options);
				networksOptions.params = {name: oneDeployment.options.network};
				networks.delete(networksOptions, (error) => {
					if (error) {
						options.soajs.log.error(error);
					} else {
						options.soajs.log.debug("VPC Network Deleted Successfully.");
					}
				});
			}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 5 * 60 * 1000);
		}
		
		function createTemplate(mCb) {
			if (!options.params.template || !options.params.template.content) {
				return mCb(new Error('Invalid GKE template provided'));
			}
			//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters#Cluster
			if (options.params.template && typeof (options.params.template.content) === 'string') {
				options.params.template.content = JSON.parse(options.params.template.content);
			}
			let template = JSON.parse(JSON.stringify(options.params.template.content));
			if (!template) {
				return mCb(new Error("Invalid or Cluster Template detected to create the cluster from!"));
			}
			
			template.cluster.name = uniqueName; //same name as network
			template.cluster.zone = options.params.region;
			// template.cluster.zoneLocation = data.options.region;
			template.cluster.network = oneDeployment.options.network;
			template.cluster.subnetwork = oneDeployment.options.network;
			
			if (typeof options.params.template.inputs === 'string') {
				try {
					options.params.template.inputs = JSON.parse(options.params.template.inputs);
				} catch (e) {
					return cb(new Error("Detected invalid template inputs schema !!!"));
				}
			}
			mapTemplateInputsWithValues(options.params.template.inputs, options.params, template.cluster, () => {
				
				let request = getConnector(options.infra.api);
				request.zone = options.params.region;
				
				options.soajs.log.debug("Retrieving cluster version to use from google");
				getClusterVersion(request, function (err, version) {
					if (err) {
						if (createNewNetwork) {
							options.soajs.log.debug("Deleting VPC network...");
							deleteNetwork();
						}
						return mCb(err);
					}
					
					template.cluster.initialClusterVersion = version;
					delete request.project;
					request.resource = template;
					request.zone = [];
					//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters/create
					options.soajs.log.debug("Deploying new Cluster from Template:", oneDeployment.options.network);
					driver.checkZoneRegion(options, options.params.region, false, (err, type) => {
						if (err) {
							return cb(err)
						}
						request.parent = `projects/${options.infra.api.project}/locations/${options.params.region}`
						v1beta1container().projects[type].clusters.create(request, function (err, operation) {
							if (err) {
								if (createNewNetwork) {
									options.soajs.log.debug("Deleting VPC network...");
									deleteNetwork();
								}
								return mCb(err);
							} else {
								oneDeployment.options.nodePoolId = template.cluster.nodePools[0].name;
								oneDeployment.options.zone = options.params.region;
								oneDeployment.options.operationId = operation.name;
								return mCb(null, true);
							}
						});
					})
				});
			});
		}
		
		let stages = [prepareDeploymentConfiguration];
		
		if (options.soajs.registry.pending && options.params.resume) {
			options.soajs.log.warn(`Detected new call to deploy infra for the same environment ${options.soajs.registry.code}, skipping call...`);
		} else {
			if (createNewNetwork) {
				stages.push(createVpcNetwork);
			} else {
				stages.push(useVpcNetwork);
			}
			
			stages.push(createTemplate);
		}
		
		async.series(stages, (error) => {
			if (error) {
				return cb(error);
			}
			return cb(null, oneDeployment);
		});
		
		function mapTemplateInputsWithValues(inputs, params, template, mapCb) {
			let templateInputs = {};
			async.each(inputs, (oneInput, iCb) => {
				if (oneInput.entries) {
					mapTemplateInputsWithValues(oneInput.entries, params, template, iCb);
				} else {
					let paramValue;
					if (params[oneInput.name]){
						paramValue = params[oneInput.name].toString();
					}
					if (!paramValue) {
						paramValue = oneInput.value.toString();
					}
					templateInputs[oneInput.name] = paramValue;
					return iCb();
				}
			}, () => {
				//loop in template recursively till you find a match, replace value of found matches
				for (let property in templateInputs) {
					traverse(template).forEach(function (x) {
						if (this.key === property) {
							this.update(templateInputs[property]);
						}
					});
				}
				return mapCb();
			});
		}
	},
	/**
	 * This method checks tif the cluster is zonal or regional
	 * @param options
	 * @param region
	 * @param verbose
	 * @param mCb
	 * @returns {*}
	 */
	"checkZoneRegion": function (options, region, verbose, mCb) {
		infraExtras.getRegion(options, region, verbose, (err, resR) => {
			if (err) {
				infraExtras.getZone(options, region, verbose, (err, resZ) => {
					if (err) {
						return mCb(err);
					} else {
						return mCb(null, resZ);
					}
				});
			} else {
				return mCb(null, resR);
			}
		});
	},
	/**
	 * This method takes the cluster operation saved check whether the status is done
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatus": function (options, cb) {
		let cluster = options.infra.stack;
		let request = getConnector(options.infra.api);
		let project = request.project;
		delete request.project;
		request.zone = [];
		
		function checkIfClusterisReady(type, miniCB) {
			setTimeout(function () {
				options.soajs.log.debug("Checking if Cluster is Ready.");
				//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.operations/get
				request.operationId = cluster.options.operationId;
				request.name = `projects/${options.infra.api.project}/locations/${cluster.options.zone}/operations/${cluster.options.operationId}`;
				v1beta1container().projects[type].operations.get(request, function (err, response) {
					if (err) {
						return miniCB(err);
					} else {
						return miniCB(null, (response && response.operationType === "CREATE_CLUSTER" && response.status === "DONE"));
					}
				});
			}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 5 * 1000);
		}
		
		options.soajs.log.debug("Getting Environment Record:", options.soajs.registry.code.toUpperCase());
		
		//get the environment record
		if (options.soajs.registry.deployer.container.kubernetes.remote.nodes && options.soajs.registry.deployer.container.kubernetes.remote.nodes !== '') {
			let machineIp = options.soajs.registry.deployer.container.kubernetes.remote.nodes;
			return cb(null, machineIp);
		} else {
			if (!cluster || !cluster.options || !cluster.options.zone) {
				return cb(null, false);
			}
			driver.checkZoneRegion(options, cluster.options.zone, false, (err, type) => {
				if (err) {
					return cb(err)
				}
				checkIfClusterisReady(type, function (err, response) {
					if (err) {
						return cb(err);
					} else {
						if (!response) {
							options.soajs.log.debug("Cluster Not Ready Yet.");
							return cb(null, false);
						} else {
							//trigger get cluster & store the end point ip in the environment nodes entry
							//Ref https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1beta1/projects.locations.clusters/get
							let request = getConnector(options.infra.api);
							delete request.project;
							request.zone = [];
							request.name = `projects/${options.infra.api.project}/locations/${cluster.options.zone}/clusters/${cluster.id}`;
							request.clusterId = cluster.id;
							options.soajs.log.debug("Getting Cluster Information.");
							v1beta1container().projects[type].clusters.get(request, function (err, clusterInformation) {
								if (err) {
									return cb(err);
								}
								
								if (!clusterInformation || clusterInformation === '' || typeof clusterInformation !== 'object' || Object.keys(clusterInformation).length === 0) {
									options.soajs.log.debug("Cluster Not Ready Yet.");
									return cb(null, false);
								}
								
								let machineIp = clusterInformation.endpoint;
								let machineAuth = clusterInformation.masterAuth;
								let deployer = {};
								let deployerConfig = {
									url: `https://${machineIp}`,
									auth: {
										user: machineAuth.username,
										pass: machineAuth.password
									},
									request: {strictSSL: false}
								};
								let machineIPs = [];
								async.auto({
									"getKubernetesToken": function (fCb) {
										options.soajs.log.debug("Creating Kubernetes Token.");
										deployerConfig.version = 'v1';
										
										deployer.core = new K8Api.Core(deployerConfig);
										deployer.core.namespaces.secrets.get({}, (error, secretsList) => {
											if (error) {
												return fCb(error);
											}
											
											async.detect(secretsList.items, (oneSecret, callback) => {
												return callback(null, (oneSecret && oneSecret.metadata && oneSecret.metadata.name && oneSecret.metadata.name.match(/default-token-.*/g) && oneSecret.type === 'kubernetes.io/service-account-token'));
											}, (error, tokenSecret) => {
												if (tokenSecret && tokenSecret.metadata && tokenSecret.metadata.name && tokenSecret.data && tokenSecret.data.token) {
													return fCb(null, new Buffer(tokenSecret.data.token, 'base64').toString());
												} else {
													return fCb('Kubernetes api token not found!');
												}
											});
										});
									},
									"createNameSpace": ['getKubernetesToken', function (info, fCb) {
										options.soajs.log.debug("Creating new namespace for SOAJS.");
										deployerConfig.version = 'v1';
										deployerConfig.auth = {bearer: info.getKubernetesToken};
										let namespace = {
											kind: 'Namespace',
											apiVersion: 'v1',
											metadata: {
												name: options.soajs.registry.deployer.container.kubernetes.remote.namespace.default,
												labels: {'soajs.content': 'true'}
											}
										};
										deployer.core = new K8Api.Core(deployerConfig);
										deployer.core.namespaces.get({}, function (error, namespacesList) {
											if (error) {
												return fCb(error);
											}
											async.detect(namespacesList.items, function (oneNamespace, callback) {
												return callback(null, oneNamespace.metadata.name === namespace.metadata.name);
											}, function (error, foundNamespace) {
												if (foundNamespace) {
													return fCb(null, true);
												}
												deployer.core.namespace.post({body: namespace}, (error, response) => {
													if (error) {
														return fCb(error);
													}
													
													return fCb(null, true);
												});
											});
										});
									}],
									"updateEnvironment": ['getKubernetesToken', function (info, fCb) {
										options.soajs.log.debug("Updating Environment Record with Kubernetes configuration:", options.soajs.registry.code.toUpperCase());
										options.soajs.registry.deployer.container.kubernetes.remote.nodes = machineIp;
										options.soajs.registry.deployer.container.kubernetes.remote.apiPort = 443;
										options.soajs.registry.deployer.container.kubernetes.remote.auth.token = info.getKubernetesToken;
										return fCb();
									}],
									"updateStaticIps": ['updateEnvironment', function (info, fCb) {
										options.soajs.log.debug("Updating Cluster IP Addresses");
										request.clusterId = cluster.id;
										request.filter = "name eq gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-.*";
										
										driver.checkZoneRegion(options, cluster.options.zone, true, (err, zones) => {
											if (err) {
												return cb(err);
											}
											//loop over all the zone ang get the ip of each location found in the zone
											//if zonal we only have to loop once
											async.each(zones, function (oneZone, callback) {
												request.zone = oneZone;
												delete request.name;
												request.project = project;
												v1Compute().instances.list(request, (error, instances) => {
													if (error) {
														return callback(error);
													}
													if (instances && instances.items) {
														//extract name and ip from response
														instances.items.forEach((oneInstance) => {
															let mIP;
															oneInstance.networkInterfaces.forEach((oneNetInterface) => {
																if (oneNetInterface.accessConfigs) {
																	oneNetInterface.accessConfigs.forEach((oneAC) => {
																		if (oneAC.name === 'external-nat') {
																			mIP = oneAC.natIP;
																		}
																	});
																}
															});
															if (mIP) {
																machineIPs.push(mIP);
															}
														});
													}
													callback();
												});
											}, (err) => {
												if (err) {
													return fCb(err);
												}
												let region;
												
												function getRegion(cb) {
													if (zones.length > 1) {
														region = cluster.options.zone;
														return cb();
													} else {
														request.region = cluster.options.zone;
														v1Compute().zones.get(request, function (err, response) {
															if (err) {
																return cb(err);
															}
															if (response && response.region){
																let regionUrl = response.region.split("/");
																region = regionUrl[regionUrl.length - 1];
															}
															return cb();
														});
													}
												}
												
												getRegion((err) => {
													if (err) {
														return fCb(err);
													}
													delete request.region;
													delete request.filter;
													delete request.clusterId;
													request.region = region;
													async.eachSeries(machineIPs, function (oneIP, callback) {
														let date = new Date();
														request.resource = {
															"name": "gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-" + date.getTime(),
															"address": oneIP
														};
														v1Compute().addresses.insert(request, (err) => {
															if (err) {
																return callback(err);
															}
															options.soajs.log.debug("IP " + oneIP + " is now static!");
															return callback();
														});
													}, fCb);
												});
											});
										});
									}]
								}, (error) => {
									if (error) {
										return cb(error);
									}
									options.soajs.log.debug("Cluster " + cluster.id + " is now ready to use at:", machineIp);
									return cb(null, machineIp);
								});
							});
						}
					}
				});
			});
		}
	},
	
	/**
	 * This method returns the instruction to update the dns to link the domain of this environment
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDNSInfo": function (options, cb) {
		let stack = options.infra.stack;
		
		let nginxDeploymentName = options.soajs.registry.code.toLowerCase() + '-nginx';
		let deployer = {};
		let deployerConfig = {
			url: `https://${options.soajs.registry.deployer.container.kubernetes.remote.nodes}:${options.soajs.registry.deployer.container.kubernetes.remote.apiPort}`,
			version: 'v1',
			auth: {
				bearer: options.soajs.registry.deployer.container.kubernetes.remote.auth.token
			},
			request: {strictSSL: false}
		};
		
		//build namespace
		let namespace = options.soajs.registry.deployer.container.kubernetes.remote.namespace.default;
		if (options.soajs.registry.deployer.container.kubernetes.remote.namespace.perService) {
			namespace += '-' + nginxDeploymentName;
		}
		
		deployer.core = new K8Api.Core(deployerConfig);
		let nginxServiceName = nginxDeploymentName + '-service';
		deployer.core.namespaces(namespace).services.get({name: nginxServiceName}, (error, service) => {
			if (error) {
				return cb(error);
			}
			
			if (!service || !service.metadata || !service.metadata.name || !service.spec) {
				return cb(new Error("Nginx deployment not found!"));
			}
			
			let DNSIPAddress;
			if (service.spec.type === 'LoadBalancer' && service.status && service.status.loadBalancer && service.status.loadBalancer.ingress) {
				DNSIPAddress = service.status.loadBalancer.ingress[0].ip; //NOTE: not sure about this, need access to a gke deployment to verify it
			} else if (service.spec.type === 'NodePort' && service.spec.clusterIP) {
				DNSIPAddress = service.spec.clusterIP;
			}
			
			let mockedResponse = {
				"id": stack.id
			};
			
			if (DNSIPAddress) {
				mockedResponse = {
					"id": stack.id,
					"dns": {
						"msg": "<table>" +
							"<thead>" +
							"<tr><th>Field Type</th><th>Field Value</th></tr>" +
							"</thead>" +
							"<tbody>" +
							"<tr><td>DNS Type</td><td>A</td></tr>" +
							"<tr class='even'><td>Domain Value</td><td>%domain%</td></tr>" +
							"<tr><td>IP Address</td><td>" + DNSIPAddress + "</td></tr>" +
							"<tr class='even'><td>TTL</td><td>5 minutes</td></tr>" +
							"</tbody>" +
							"</table>"
					}
				};
			}
			
			return cb(null, mockedResponse);
		});
	},
	
	/**
	 * This method scales the deployment for the given cluster
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"scaleCluster": function (options, cb) {
		let cluster = options.infra.stack;
		
		//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters.nodePools/autoscaling
		let request = getConnector(options.infra.api);
		let project = request.project;
		delete request.project;
		request.clusterId = cluster.id;
		request.projectId = options.infra.api.project;
		request.zone = cluster.options.zone;
		v1Container().projects.zones.clusters.get(request, (err, clusterResponse) => {
			if (err) {
				return cb(err);
			}
			request.zone = [];
			request.name = `projects/${options.infra.api.project}/locations/${cluster.options.zone}/clusters/${cluster.id}`;
			request.nodePoolId = cluster.options.nodePoolId;
			request.resource = {
				"nodeCount": options.params.number, // get this from ui
			};
			v1Container().projects.zones.clusters.nodePools.setSize(request, (err, nodePoolsResponse) => {
				if (err) {
					return cb(err);
				}
				let maxCounter = 10;
				let counter = 0;
				
				function checkIfClusterisReady(type, miniCB) {
					setTimeout(function () {
						options.soajs.log.debug("Checking if Cluster is Ready.");
						//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.operations/get
						request.operationId = nodePoolsResponse.name;
						request.name = `projects/${options.infra.api.project}/locations/${cluster.options.zone}/operations/${nodePoolsResponse.name}`;
						delete request.resource;
						delete request.nodePoolId;
						delete request.clusterId;
						request.zone = cluster.options.zone;
						v1beta1container().projects[type].operations.get(request, function (err, response) {
							if (err) {
								return miniCB(err);
							} else if (response && response.operationType === "SET_NODE_POOL_SIZE" && response.status === "DONE") {
								return miniCB(null, true);
							} else if (counter > maxCounter) {
								return miniCB(new Error("cluster failed to update node pool size"));
							} else {
								counter++;
								checkIfClusterisReady(type, miniCB);
							}
						});
					}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 25 * 1000);
				}
				
				function updateMachineIps(cb) {
					driver.checkZoneRegion(options, cluster.options.zone, false, (err, type) => {
						if (err) {
							return cb(err);
						}
						checkIfClusterisReady(type, function (err) {
							if (err) {
								return cb(err);
							}
							options.soajs.log.debug("Updating Cluster IP Addresses");
							if (clusterResponse) {
								request.clusterId = cluster.id;
								request.filter = "name eq gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-.*";
								driver.checkZoneRegion(options, cluster.options.zone, true, (err, zones) => {
									if (err) {
										return cb(err);
									}
									//loop over all the zone ang get the ip of each location found in the zone
									//if zonal we only have to loop once
									let machineIPs = [];
									async.each(zones, function (oneZone, callback) {
										request.zone = oneZone;
										delete request.name;
										request.project = project;
										v1Compute().instances.list(request, (error, instances) => {
											if (error) {
												return callback(error);
											}
											if (instances && instances.items) {
												//extract name and ip from response
												instances.items.forEach((oneInstance) => {
													let mIP;
													oneInstance.networkInterfaces.forEach((oneNetInterface) => {
														if (oneNetInterface.accessConfigs) {
															oneNetInterface.accessConfigs.forEach((oneAC) => {
																if (oneAC.name === 'external-nat') {
																	mIP = oneAC.natIP;
																}
															});
														}
													});
													if (mIP) {
														machineIPs.push(mIP);
													}
												});
											}
											callback();
										});
									}, (err) => {
										if (err) {
											return cb(err);
										}
										let region;
										
										function getRegion(cb) {
											if (zones.length > 1) {
												region = cluster.options.zone;
												return cb();
											} else {
												request.region = cluster.options.zone;
												v1Compute().zones.get(request, function (err, response) {
													if (err) {
														return cb(err);
													}
													if (response && response.region){
														let regionUrl = response.region.split("/");
														region = regionUrl[regionUrl.length - 1];
													}
													return cb();
												});
											}
										}
										
										getRegion((err) => {
											if (err) {
												return cb(err);
											}
											delete request.region;
											delete request.filter;
											delete request.clusterId;
											request.region = region;
											v1Compute().addresses.list(request, (err, addresses) => {
												if (err) {
													return cb(err);
												}
												
												//remove ip address
												if (clusterResponse.currentNodeCount > options.params.number && addresses && addresses.items) {
													async.eachSeries(addresses.items, (oneAddress, callback) => {
														if (machineIPs.indexOf(oneAddress.address) === -1) {
															request.address = oneAddress.name;
															//release each address in series
															v1Compute().addresses.delete(request, (err) => {
																if (err) {
																	return callback(err);
																}
																options.soajs.log.debug("IP " + oneAddress.address + " is released!");
																return callback();
															});
														} else {
															return callback();
														}
													}, cb);
												}
												
												//add ip address
												else if (clusterResponse.currentNodeCount < options.params.number) {
													let addressArray = [];
													if (addresses && addresses.items) {
														addresses.items.forEach((oneItem) => {
															addressArray.push(oneItem.address);
														});
													}
													
													async.eachSeries(machineIPs, (oneMachineIP, callback) => {
														if (addressArray.indexOf(oneMachineIP) === -1) {
															let date = new Date();
															request.resource = {
																"name": "gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-" + date.getTime(),
																"address": oneMachineIP
															};
															v1Compute().addresses.insert(request, (err) => {
																if (err) {
																	return callback(err);
																}
																options.soajs.log.debug("IP " + oneMachineIP + " is now static!");
																return callback();
															});
														} else {
															return callback();
														}
													}, cb);
												}
											});
										});
									});
								});
							}
						});
					});
				}
				
				if (clusterResponse && clusterResponse.currentNodeCount === options.params.number) {
					return cb(null, true);
				} else {
					updateMachineIps((err) => {
						if (err) {
							options.soajs.log.error(err);
						}
					});
					return cb(null, true);
				}
			});
		});
	},
	
	/**
	 * This method returns the project cluster id and zone that was used to create a deployment at the google.
	 *
	 * @param options
	 * @param cb
	 */
	"getCluster": function (options, cb) {
		//call google api and get the machines
		let cluster = options.infra.stack;
		
		//Ref: https://cloud.google.com/compute/docs/reference/latest/instances/list
		let request = getConnector(options.infra.api);
		request.clusterId = cluster.id;
		request.filter = "name eq gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-.*";
		let response = {
			"env": options.soajs.registry.code,
			"stackId": cluster.id,
			"stackName": cluster.id,
			"templateProperties": {
				"region": cluster.options.zone
				//"keyPair": "keyPair" //todo: what is this for ????
			},
			"machines": [],
		};
		driver.checkZoneRegion(options, cluster.options.zone, true, (err, zones) => {
			if (err) {
				return cb(err)
			}
			//loop over all the zone ang get the ip of each location found in the zone
			//if zonal we only have to loop once
			async.each(zones, function (oneZone, callback) {
				request.zone = oneZone;
				v1Compute().instances.list(request, (error, instances) => {
					if (error) {
						return callback(error);
					}
					if (instances && instances.items) {
						//extract name and ip from response
						instances.items.forEach((oneInstance) => {
							let machineIP;
							
							oneInstance.networkInterfaces.forEach((oneNetInterface) => {
								if (oneNetInterface.accessConfigs) {
									oneNetInterface.accessConfigs.forEach((oneAC) => {
										if (oneAC.name === 'external-nat') {
											machineIP = oneAC.natIP;
										}
									});
								}
							});
							
							if (machineIP) {
								response.machines.push({
									"name": oneInstance.name,
									"ip": machineIP,
									"zone": oneZone
								});
							}
						});
					}
					callback();
				});
			}, function (err) {
				if (err) {
					return cb(err)
				} else {
					return cb(null, response);
				}
			});
		});
	},
	
	/**
	 * This method Updates the deployment at google
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateCluster": function (options, cb) {
		return cb(null, true);
		
		// let cluster = info[0];
		//
		// //Ref https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1beta1/projects.zones.clusters/update
		// let request = getConnector(cluster.infra.google.api);
		// request.zone = cluster.zone;
		// request.clusterId = cluster.id;
		//
		// request.update = {
		// 	"update": {
		// 		"desiredImageType": ""
		// 	}
		// };
		// v1Container().projects.zones.clusters.update(request, function(err){
		// 	return cb(err, true);
		// });
	},
	
	/**
	 * This method removes the deployment at google and updates the project record infra.google.deployment array
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteCluster": function (options, cb) {
		//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1beta1/projects.zones.clusters/delete
		let request = getConnector(options.infra.api);
		let stack = options.infra.stack;
		request.zone = [];
		request.clusterId = stack.id;
		let project = request.project;
		delete request.project;
		options.soajs.log.debug("Removing Cluster:", request.clusterId);
		driver.checkZoneRegion(options, stack.options.zone, false, (err, type) => {
			if (err) {
				return cb(err)
			}
			request.name = `projects/${options.infra.api.project}/locations/${stack.options.zone}/clusters/${stack.id}`;
			v1beta1container().projects[type].clusters.get(request, function (err, clusterInformation) {
				if (err) {
					return cb(err);
				}
				v1beta1container().projects[type].clusters.delete(request, function (err, operation) {
					if (err) {
						return cb(err);
					}
					if (operation) {
						checkIfDeleteIsDone(operation, type, (error) => {
							if (error) {
								options.soajs.log.error(error);
							} else {
								let deleteNetwork = true;
								if (options.infra && options.infra._id && options.soajs && options.soajs.registry && options.soajs.registry.restriction && options.soajs.registry.restriction[options.infra._id]) {
									if (Object.keys(options.soajs.registry.restriction[options.infra._id]).length > 0) {
										let region = stack.options.zone;
										if (options.soajs.registry.restriction[options.infra._id][region] && options.soajs.registry.restriction[options.infra._id][region].network) {
											if (options.soajs.registry.restriction[options.infra._id][region].network === clusterInformation.network) {
												options.soajs.log.debug("Cluster network provided as input, it will not be deleted ...");
												options.soajs.log.debug("Cluster deleted successfully");
												deleteNetwork = false;
											}
										}
									}
								}
								
								if (deleteNetwork) {
									options.soajs.log.debug("waiting 1 min for network propagation before deleting Firewalls.");
									let networkOptions = Object.assign({}, options);
									networkOptions.params = {name: clusterInformation.network};
									networks.delete(networkOptions, (error) => {
										if (error) {
											options.soajs.log.error(error);
										} else {
											deleteAddress();
											options.soajs.log.debug("Cluster and Network Deleted Successfully.");
										}
									});
								} else {
									deleteAddress();
								}
							}
						});
						
					}
					//return response that cluster delete was triggered correctly
					return cb(null, true);
				});
			});
		});
		
		function checkIfDeleteIsDone(operation, type, vCb) {
			//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.operations/get
			let request = getConnector(options.infra.api);
			delete request.project;
			options.soajs.log.debug("Checking if Cluster was removed:", stack.id);
			request.zone = [];
			request.name = `projects/${options.infra.api.project}/locations/${stack.options.zone}/operations/${operation.name}`;
			request.operationId = operation.name;
			v1beta1container().projects[type].operations.get(request, function (err, response) {
				if (err) {
					return vCb(err);
				}
				
				if (response && response.operationType === "DELETE_CLUSTER" && response.status === "DONE") {
					return vCb(null, true);
				} else {
					setTimeout(function () {
						checkIfDeleteIsDone(operation, type, vCb);
					}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 60 * 1000);
				}
			});
		}
		
		function deleteAddress() {
			options.soajs.log.debug("Deleting Cluster IP Addresses");
			let region;
			request.project = project;
			
			function getRegion(cb) {
				request.zone = stack.options.zone;
				v1Compute().zones.get(request, function (err, response) {
					if (err) {
						options.soajs.log.error(err);
					} else {
						//zonal
						if (response && response.region) {
							let regionUrl = response.region.split("/");
							region = regionUrl[regionUrl.length - 1];
						} else {
							//regional
							region = stack.options.zone;
						}
					}
					return cb();
				});
				
			}
			
			request.filter = "name eq gke-" + stack.id.substring(0, 19) + "-" + stack.options.nodePoolId + "-.*";
			getRegion((err) => {
				if (err) {
					options.soajs.log.error(err);
				}
				delete request.region;
				delete request.clusterId;
				request.region = region;
				//list all addresses
				v1Compute().addresses.list(request, (err, addresses) => {
					if (err) {
						options.soajs.log.error(err);
					}
					if (addresses && addresses.items && addresses.items.length > 0) {
						async.eachSeries(addresses.items, function (one, callback) {
							request.address = one.name;
							//release each address in series
							v1Compute().addresses.delete(request, (err) => {
								if (err) {
									return callback(err);
								}
								options.soajs.log.debug("IP " + one.address + " is released!");
								return callback();
							});
						}, (err) => {
							if (err) {
								options.soajs.log.error(err);
							}
						});
					}
				});
			});
		}
	}
};

Object.assign(driver, kubeDriver);

driver.listNodes = function (options, cb) {
	async.auto({
		"getCluster": (mCb) => {
			if (!options.params) {
				options.params = {};
			}
			options.params.env = options.env;
			driver.getCluster(options, mCb);
		},
		"listNodes": (mCb) => {
			kubeDriver.listNodes(options, mCb);
		},
	}, (error, results) => {
		if (error) {
			return cb(error);
		}
		results.getCluster.machines.forEach((oneMachine) => {
			results.listNodes.forEach((oneNode) => {
				if (oneMachine.name === oneNode.hostname) {
					oneNode.ip = oneMachine.ip;
					oneNode.zone = oneMachine.zone;
				}
			});
		});
		return cb(null, results.listNodes);
	});
};

driver.deployService = function (options, cb) {
	kubeDriver.deployService(options, (error, response) => {
		if (error) {
			return cb(error);
		}
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			kubeDriver.inspectService(options, (error, deployedServiceDetails) => {
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

driver.redeployService = function (options, cb) {
	kubeDriver.redeployService(options, (error, response) => {
		if (error) {
			return cb(error);
		}
		//update env settings
		//check exposed external ports
		setTimeout(() => {
			options.params.id = response.id;
			kubeDriver.inspectService(options, (error, deployedServiceDetails) => {
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
};

module.exports = driver;
