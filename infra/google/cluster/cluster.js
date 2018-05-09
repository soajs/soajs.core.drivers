'use strict';

let kubernetesModule = require("../kubernetes/index.js");

let driver = {
	
	"deployCluster": function (options, cb) {
		kubernetesModule.deployCluster(options, cb);
	},
	
	"getDeployClusterStatus": function (options, cb) {
		kubernetesModule.getDeployClusterStatus(options, cb);
	},
	
	"getDNSInfo": function (options, cb) {
		kubernetesModule.getDNSInfo(options, cb);
	},
	
	"scaleCluster": function (options, cb) {
		kubernetesModule.scaleCluster(options, cb);
	},
	
	"getCluster": function (options, cb) {
		kubernetesModule.getCluster(options, cb);
	},
	
	"updateCluster": function (options, cb) {
		kubernetesModule.updateCluster(options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		kubernetesModule.deleteCluster(options, cb);
	}
};

module.exports = driver;
