"use strict";
const async = require("async");

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

const GCLB = {
	
	/**
	 * This method add service published ports to firewall rules
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"publishPorts": function (options, cb) {
		let request = getConnector(options.infra.api);
		let stack = options.infra.stack;
		let ports = [];
		
		options.params.ports.forEach(function (onePort) {
			if (onePort.published) {
				if (parseInt(onePort.published) < 30000) {
					onePort.published = parseInt(onePort.published) + 30000;
				}
				onePort.published = onePort.published.toString();
				ports.push(onePort.published);
			}
		});
		options.params.ports = ports;
		
		if (ports.length === 0) {
			return cb(null, true);
		}
		
		let project = request.project;
		delete request.project;
		request.zone = [];
		request.clusterId = stack.id;
		options.soajs.log.debug("Getting Cluster network name...");
		request.name = `projects/${options.infra.api.project}/locations/${stack.options.zone}/clusters/${stack.id}`;
		v1Container().projects.zones.clusters.get(request, function (err, clusterInformation) {
			if (err) {
				options.soajs.log.error(err);
				return cb(new Error(`Failed to find ${stack.id} cluster!`));
			}
			if (!clusterInformation || clusterInformation === '' || typeof clusterInformation !== 'object' || Object.keys(clusterInformation).length === 0) {
				options.soajs.log.debug("Cluster Not found!");
				return cb(new Error(`Failed to find ${ stack.id} cluster!`));
			}
			else {
				request.filter = "network eq " + "https://www.googleapis.com/compute/v1/projects/" + options.infra.api.project + "/global/networks/" + clusterInformation.network;
				request.project = project;
				v1Compute().firewalls.list(request, (err, firewalls) => {
					if (err) {
						options.soajs.log.error(err);
						return cb(new Error(`Failed to find ${stack.name} network!`));
					}
					let name = stack.name + "-allow-tcp-";
					if (options.params.name) {
						if (options.params.name === 'nginx') {
							name += options.params.envCode.toLowerCase() + "-" + options.params.name;
						}
						else if (options.params.version) {
							name += options.params.envCode.toLowerCase() + "-" + options.params.name;
							name += "-v" + options.params.version;
						}
						else if(options.params.type){
							name += options.params.envCode.toLowerCase() + "-" + options.params.type;
							name += (options.params.version) ? "-v" + options.params.version : "";
						}
						else{
							name += options.params.name;
						}
					}
					
					async.detect(firewalls.items, function (oneFireWall, call) {
						return call(null, oneFireWall.name === name)
					}, function (err, result) {
						if (err) {
							return cb(err);
						}
						else {
							let method = 'insert';
							if (result) {
								options.soajs.log.debug("Update firewall rule: ", name);
								//service found update firewall
								request.firewall = name;
								method = 'update';
							}
							else {
								//create new firewall
								options.soajs.log.debug("Registering new firewall rule: ", name);
							}
							request.resource = {
								//gcloud compute --project=ragheb-project firewall-rules create template-cluster-allow-icmp --description=Allows\ ICMP\ connections\ from\ any\ source\ to\ any\ instance\ on\ the\ network. --direction=INGRESS --priority=65534 --network=template-cluster --action=ALLOW --rules=icmp --source-ranges=0.0.0.0/0
								"kind": "compute#firewall",
								"name": name,
								"description": "Allow tcp Connections for " + name,
								"network": "projects/" + options.infra.api.project + "/global/networks/" + clusterInformation.network,
								"priority": 65534,
								"sourceRanges": "0.0.0.0/0",
								"allowed": [
									{
										"IPProtocol": "tcp",
										"ports": ports
									}
								]
							};
							v1Compute().firewalls[method](request, function (err) {
								if (err) {
									options.soajs.log.error(err);
									return cb(new Error(`Failed to add ${ports} to Firewall Rules!`));
								}
								else {
									return cb(null, true);
								}
							});
						}
					});
				});
			}
		});
	},
	
	"createLoadBalancer": function (options, cb) {
		return cb(null, true);
	},
	
	"updateLoadBalancer": function (options, cb) {
		return cb(null, true);
	},
	
	"deleteLoadBalancer": function (options, cb) {
		return cb(null, true);
	}
};

module.exports = GCLB;