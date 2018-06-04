'use strict';
const config = require('../config');
const _ = require('lodash');
const async = require("async");
const K8Api = require('kubernetes-client');
const randomstring = require("randomstring");
const traverse = require("traverse");

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

function getConnector(opts) {
	return require('../utils/utils.js').connector(opts);
}

const kubeDriver = require("../../../lib/container/kubernetes/index.js");
const LBDriver = require("../cluster/lb.js");

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
		let request = getConnector(options.infra.api);
		//no create a name made from ht + deployment type + random string
		let name = `ht${options.params.soajs_project.toLowerCase()}${randomstring.generate({
			length: 13,
			charset: 'alphanumeric',
			capitalization: 'lowercase'
		})}`;
		
		let oneDeployment = {};
		
		function prepareDeploymentConfiguration(mCb) {
			options.soajs.log.debug("Preparing Deployment Entry in Project");
			
			if (!options.infra.deployments) {
				options.infra.deployments = [];
			}
			
			oneDeployment = {
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
			//Ref: https://cloud.google.com/compute/docs/reference/latest/networks/insert
			request.resource = {
				name: name,
				routingConfig: config.vpc.routingConfig,
				autoCreateSubnetworks: config.vpc.autoCreateSubnetworks
			};
			options.soajs.log.debug("Creating new Network:", name);
			v1Compute().networks.insert(request, function (err, globalOperationResponse) {
				if (err) {
					return cb(err);
				}
				
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
						}
						else {
							return miniCB(null, response);
						}
					});
				}
				
				globalOperations(function (err) {
					if (err) {
						return mCb(err);
					}
					else {
						//Ref: https://cloud.google.com/compute/docs/reference/latest/firewalls/insert
						let firewallRules = [
							{
								//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-icmp --description=Allows\ ICMP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=icmp --source-ranges=0.0.0.0/0
								"kind": "compute#firewall",
								"name": name + "-allow-icmp",
								"description": "Allow ICMP Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "icmp",
										"ports": "0-65535"
									}
								]
							},
							{
								//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-ssh --description=Allows\ TCP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network\ using\ port\ 22. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=tcp:22 --source-ranges=0.0.0.0/0
								"kind": "compute#firewall",
								"name": name + "-allow-ssh",
								"description": "Allow SSH Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": "22"
									}
								]
							},
							{
								//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-rdp --description=Allows\ RDP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network\ using\ port\ 3389. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=tcp:3389 --source-ranges=0.0.0.0/0
								"kind": "compute#firewall",
								"name": name + "-allow-rdp",
								"description": "Allow RDP Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": "3389"
									}
								]
							},
							{
								"kind": "compute#firewall",
								"name": name + "-allow-http",
								"description": "Allow HTTP Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": "80"
									}
								]
							},
							{
								"kind": "compute#firewall",
								"name": name + "-allow-https",
								"description": "Allow HTTPS Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": "443"
									}
								]
							},
							{
								//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-internal --description=Allows\ connections\ from\ any\ source\ in\ the\ network\ IP\ range\ to\ any\ instance\ on\ the\ network\ using\ all\ protocols. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=all --source-ranges=10.128.0.0/9
								"kind": "compute#firewall",
								"name": name + "-allow-internal",
								"description": "Allow All Internal Connections",
								"network": "projects/" + options.infra.api.project + "/global/networks/" + name,
								"priority": 65534,
								"sourceRanges": "10.128.0.0/9",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": "0-65535"
									}
								]
							}
						];
						
						let request = getConnector(options.infra.api);
						async.each(firewallRules, (oneRule, vCb) => {
							options.soajs.log.debug("Registering new firewall rule:", oneRule.name);
							request.resource = oneRule;
							v1Compute().firewalls.insert(request, vCb);
						}, mCb);
					}
				});
				
			}
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
					
				}
				else if (response && response.defaultClusterVersion && !version) {
					version = response.defaultClusterVersion;
					options.soajs.log.debug("Initial Cluster version set to default version :", version);
				}
				else {
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
				//cluster failed, delete network
				//Ref: https://cloud.google.com/compute/docs/reference/latest/networks/delete
				let request = getConnector(options.infra.api);
				request.network = oneDeployment.options.network;
				v1Compute().networks.delete(request, (error) => {
					if (error) {
						options.soajs.log.error(error);
					}
					else {
						options.soajs.log.debug("VPC Network Deleted Successfully.");
					}
					
				});
			}, (process.env.SOAJS_CLOOSTRO_TEST)? 1 : 5 * 60 * 1000);
		}
		
		function createTemplate(mCb) {
			
			//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters#Cluster
			let template = JSON.parse(JSON.stringify(options.params.template.content));
			if(!template){
				return mCb(new Error("Invalid or Cluster Template detected to create the cluster from!"));
			}
			
			template.cluster.name = name; //same name as network
			template.cluster.zone = options.params.region;
			// template.cluster.zoneLocation = data.options.region;
			template.cluster.network = name;
			template.cluster.subnetwork = name;
			
			mapTemplateInputsWithValues(options.params.template.inputs, options.params, template.cluster, () => {
				
				let request = getConnector(options.infra.api);
				request.zone = options.params.region;
				
				options.soajs.log.debug("Retrieving cluster version to use from google");
				getClusterVersion(request, function (err, version) {
					if (err) {
						options.soajs.log.debug("Deleting VPC network...");
						deleteNetwork();
						return mCb(err);
					}
					
					template.cluster.initialClusterVersion = version;
					delete request.project;
					request.resource = template;
					
					//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters/create
					options.soajs.log.debug("Deploying new Cluster from Template:", name);
					v1Container().projects.zones.clusters.create(request, function (err, operation) {
						if (err) {
							options.soajs.log.debug("Deleting VPC network...");
							deleteNetwork();
							return mCb(err);
						}
						else {
							oneDeployment.id = name;
							oneDeployment.name = name;
							oneDeployment.options.nodePoolId = template.cluster.nodePools[0].name;
							oneDeployment.options.zone = options.params.region;
							oneDeployment.options.operationId = operation.name;
							return mCb(null, true);
						}
					});
				});
			});
		}
		
		let stages = [prepareDeploymentConfiguration];
		stages.push(createVpcNetwork);
		stages.push(createTemplate);
		
		async.series(stages, (error) => {
			if (error) {
				return cb(error);
			}
			return cb(null, oneDeployment);
		});
		
		function mapTemplateInputsWithValues(inputs, params, template, mapCb){
			let templateInputs= {};
			async.each(inputs, (oneInput, iCb) => {
				if(oneInput.entries){
					mapTemplateInputsWithValues(oneInput.entries, params, template, iCb);
				}
				else{
					let paramValue = params[oneInput.name].toString();
					if(!paramValue){
						paramValue = oneInput.value.toString();
					}
					templateInputs[oneInput.name] = paramValue;
					return iCb();
				}
			}, () =>{
				//loop in template recursively till you find a match, replace value of found matches
				for(let property in templateInputs){
					traverse(template).forEach(function (x) {
						if(this.key === property){
							this.update( templateInputs[property]);
						}
					});
				}
				return mapCb();
			});
		}
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
		delete request.project;
		request.zone = cluster.options.zone;
		request.operationId = cluster.options.operationId;
		
		function checkIfClusterisReady(miniCB) {
			setTimeout(function () {
				options.soajs.log.debug("Checking if Cluster is Ready.");
				//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.operations/get
				v1Container().projects.zones.operations.get(request, function (err, response) {
					if (err) {
						return miniCB(err);
					}
					else {
						return miniCB(null, (response && response.operationType === "CREATE_CLUSTER" && response.status === "DONE"));
					}
				});
			}, (process.env.SOAJS_CLOOSTRO_TEST)? 1 : 5 * 1000);
		}
		
		options.soajs.log.debug("Getting Environment Record:", options.soajs.registry.code.toUpperCase());
		
		//get the environment record
		if (options.soajs.registry.deployer.container.kubernetes.remote.nodes && options.soajs.registry.deployer.container.kubernetes.remote.nodes !== '') {
			let machineIp = options.soajs.registry.deployer.container.kubernetes.remote.nodes;
			return cb(null, machineIp);
		}
		else {
			checkIfClusterisReady(function (err, response) {
				if (err) {
					return cb(err);
				}
				else {
					if (!response) {
						options.soajs.log.debug("Cluster Not Ready Yet.");
						return cb(null, false);
					}
					else {
						//trigger get cluster & store the end point ip in the environment nodes entry
						//Ref https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1beta1/projects.locations.clusters/get
						let request = getConnector(options.infra.api);
						delete request.project;
						request.zone = cluster.options.zone;
						request.clusterId = cluster.id;
						options.soajs.log.debug("Getting Cluster Information.");
						v1Container().projects.zones.clusters.get(request, function (err, clusterInformation) {
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
											}
											else {
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
											name: "soajs",
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
			}
			else if (service.spec.type === 'NodePort' && service.spec.clusterIP) {
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
		delete request.project;
		request.clusterId = cluster.id;
		request.zone = cluster.options.zone;
		request.nodePoolId = cluster.options.nodePoolId;
		request.resource = {
			"nodeCount": options.params.number, // get this from ui
		};
		v1Container().projects.zones.clusters.nodePools.setSize(request, cb);
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
		request.zone = cluster.options.zone;
		request.clusterId = cluster.id;
		request.filter = "name eq gke-" + cluster.id.substring(0, 19) + "-" + cluster.options.nodePoolId + "-.*";
		v1Compute().instances.list(request, (error, instances) => {
			if (error) {
				return cb(error);
			}
			
			let mockedResponse = {
				"env": options.soajs.registry.code,
				"stackId": cluster.id,
				"stackName": cluster.id,
				"templateProperties": {
					"region": cluster.options.zone,
					"keyPair": "keyPair" //todo: what is this for ????
				},
				"machines": []
			};
			
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
						mockedResponse.machines.push({
							"name": oneInstance.name,
							"ip": machineIP
						});
					}
				});
			}
			
			return cb(null, mockedResponse);
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
		request.zone = stack.options.zone;
		request.clusterId = stack.id;
		delete request.project;
		options.soajs.log.debug("Removing Cluster:", request.clusterId);
		v1Container().projects.zones.clusters.get(request, function (err, clusterInformation) {
			if (err) {
				return cb(err);
			}
			v1Container().projects.zones.clusters.delete(request, function (err, operation) {
				if (err) {
					return cb(err);
				}
				if (operation) {
					//check cluster status and delete network in the background
					checkIfDeleteIsDone(operation, (error) => {
						if (error) {
							options.soajs.log.error(error);
						}
						else {
							options.soajs.log.debug("waiting 10 min for network propagation before deleting network.");
							setTimeout(function () {
								//cluster deleted, save to remove network
								//Ref: https://cloud.google.com/compute/docs/reference/latest/networks/delete
								let request = getConnector(options.infra.api);
								request.network = clusterInformation.network;
								options.soajs.log.debug("Removing Network:", clusterInformation.network);
								v1Compute().networks.delete(request, (error) => {
									if (error) {
										options.soajs.log.error(error);
									}
									else {
										options.soajs.log.debug("Cluster and Network Deleted Successfully.");
									}
								});
							}, (process.env.SOAJS_CLOOSTRO_TEST)? 1 : 10 * 60 * 1000);
						}
					});
				}
				//return response that cluster delete was triggered correctly
				return cb(null, true);
			});
		});
		
		function checkIfDeleteIsDone(operation, vCb) {
			//Ref: https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.operations/get
			let request = getConnector(options.infra.api);
			request.operationId = operation.name;
			request.zone = stack.options.zone;
			delete request.project;
			options.soajs.log.debug("Checking if Cluster was removed:", stack.id);
			v1Container().projects.zones.operations.get(request, function (err, response) {
				if (err) {
					return vCb(err);
				}
				
				if (response && response.operationType === "DELETE_CLUSTER" && response.status === "DONE") {
					return vCb(null, true);
				}
				else {
					setTimeout(function () {
						checkIfDeleteIsDone(operation, vCb);
					}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 60 * 1000);
				}
			});
		}
	}
};

Object.assign(driver, kubeDriver);

driver.listNodes = function (options, cb) {
	async.auto({
		"getCluster": (mCb) => {
			if(!options.params){
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
				}
			});
		});
		return cb(null, results.listNodes);
	});
};

driver.deployService = function (options, cb){
	kubeDriver.deployService(options, (error, response) => {
		if(error){ return cb(error); }
		
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
				
				infraUtils.updateEnvSettings(driver, LBDriver, options, deployedServiceDetails, (error) => {
					return cb(error, deployedServiceDetails);
				});
			});
		}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1500);
	});
};

module.exports = driver;
