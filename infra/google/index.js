'use strict';

/**
 * appended code for testing
 */
const googleApi = require('./utils/utils.js');
const v1Compute = function () {
	return googleApi.compute();
};
const defaultDriver = 'kubernetes';

const LBDriver = require("./cluster/lb.js");
const ClusterDriver = require("./cluster/cluster.js");
const utils = require('../../lib/utils/utils.js');

function runCorrespondingDriver(method, options, cb) {
	utils.runCorrespondingDriver(method, options, defaultDriver, cb);
}

function getConnector(opts) {
	return require('./utils/utils.js').connector(opts);
}

const driver = {
	/**
	 * this method authenticates the credentials provided by invoking the google api
	 * Note: data.options provided to this method is different from other methods as this method is invoked via 3rd parties systems ( projects )
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"authenticate": function (options, cb) {
		options.soajs.log.debug("Authenticating Google Credentials");
		//Ref: https://cloud.google.com/compute/docs/reference/latest/zones/list
		let request = getConnector(options.infra.api);
		v1Compute().zones.list(request, function (err) {
			if (err) {
				return cb(err);
			}
			return cb(null, true);
		});
	},

	"getExtras": function(options, cb) {
		return cb(null, {technologies: ['kubernetes'], templates: ['local'], drivers: ['GKE']});
	},

	"deployCluster": function (options, cb) {
		ClusterDriver.deployCluster(options, cb);
	},

	"getDeployClusterStatus": function (options, cb) {
		ClusterDriver.getDeployClusterStatus(options, cb);
	},

	"getDNSInfo": function (options, cb) {
		ClusterDriver.getDNSInfo(options, cb);
	},

	/**
	 * This method returns the available deployment zones at google
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function (options, cb) {
		//Ref: https://cloud.google.com/compute/docs/reference/latest/zones/list
		let request = getConnector(options.infra.api);
		v1Compute().regions.list(request, function (err, regions) {
			if (err) {
				return cb(err);
			}
			let response = [];
			regions.items.forEach(function (oneRegion) {
				if (oneRegion.status === 'UP') {
					response.push({
						'l': 'All Zones',
						'v': oneRegion.name,
						'group': oneRegion.name
					});
					if (oneRegion.zones && Array.isArray(oneRegion.zones) && oneRegion.zones.length> 0){
						oneRegion.zones.forEach((oneZone)=>{
							let temp =  oneZone.split("/");
							if (temp.length > 0){
								response.push({
									'l': temp[temp.length-1],
									'v': temp[temp.length-1],
									'group': oneRegion.name
								});
							}
						});
					}
				}
			});
			return cb(null, {
				"regions": response
			});
		});
	},
	
	"scaleCluster": function (options, cb) {
		ClusterDriver.scaleCluster(options, cb);
	},
	
	"getCluster": function (options, cb) {
		ClusterDriver.getCluster(options, cb);
	},
	
	"updateCluster": function (options, cb) {
		ClusterDriver.updateCluster(options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		ClusterDriver.deleteCluster(options, cb);
	},
	
	"publishPorts": function (options, cb) {
		LBDriver.publishPorts(options, cb);
	},
	
	"createLoadBalancer": function (options, cb) {
		LBDriver.createLoadBalancer(options, cb);
	},
	
	"updateLoadBalancer": function (options, cb) {
		LBDriver.updateLoadBalancer(options, cb);
	},
	
	"deleteLoadBalancer": function (options, cb) {
		LBDriver.deleteLoadBalancer(options, cb);
	},
	
	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
