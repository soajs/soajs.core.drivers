'use strict';

const defaultDriver = 'docker';
const utils = require("../../lib/utils/utils");

function runCorrespondingDriver(method, options, cb) {
	utils.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {
	"authenticate": function (options, cb) {
		runCorrespondingDriver('authenticate', options, cb);
	},
	
	"getExtras": function(options, cb) {
		runCorrespondingDriver('getExtras', options, cb);
	},
	
	"deployCluster": function (options, cb) {
		runCorrespondingDriver('deployCluster', options, cb);
	},
	
	"getDeployClusterStatus": function (options, cb) {
		runCorrespondingDriver('getDeployClusterStatus', options, cb);
	},
	
	"getDNSInfo": function (options, cb) {
		runCorrespondingDriver('getDNSInfo', options, cb);
	},
	
	"getRegions": function (options, cb) {
		runCorrespondingDriver('getRegions', options, cb);
	},
	
	"scaleCluster": function (options, cb) {
		runCorrespondingDriver('scaleCluster', options, cb);
	},
	
	"getCluster": function (options, cb) {
		runCorrespondingDriver('getCluster', options, cb);
	},
	
	"updateCluster": function (options, cb) {
		runCorrespondingDriver('updateCluster', options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		runCorrespondingDriver('deleteCluster', options, cb);
	},
	
	"publishPorts": function (options, cb) {
		runCorrespondingDriver('publishPorts', options, cb);
	},
	
	"createLoadBalancer": function (options, cb) {
		runCorrespondingDriver('createLoadBalancer', options, cb);
	},
	
	"updateLoadBalancer": function (options, cb) {
		runCorrespondingDriver('updateLoadBalancer', options, cb);
	},
	
	"deleteLoadBalancer": function (options, cb) {
		runCorrespondingDriver('deleteLoadBalancer', options, cb);
	},
	
	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
