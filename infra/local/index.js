'use strict';

const fs = require('fs');

const defaultDriver = 'docker';
function runCorrespondingDriver(method, options, cb) {
	let driverName = (options.infra && options.infra.stack && options.infra.stack.technology) ? options.infra.stack.technology : defaultDriver;
	if(!driverName){
		driverName = (options.params && options.params.technology) ? options.params.technology : driverName;
	}
	if(driverName === 'dockerlocal'){
		driverName = 'docker';
	}
	fs.exists(__dirname + "/" + driverName + "/index.js", (exists) => {
		if (!exists) {
			return cb(new Error("Requested Driver does not exist!"));
		}
		
		let driver = require("./" + driverName + "/index.js");
		driver[method](options, cb);
	});
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
	
	"deployExternalLb": function (options, cb) {
		runCorrespondingDriver('deployExternalLb', options, cb);
	},
	
	"updateExternalLB": function (options, cb) {
		runCorrespondingDriver('updateExternalLB', options, cb);
	},
	
	"deleteExternalLB": function (options, cb) {
		runCorrespondingDriver('deleteExternalLB', options, cb);
	},
	
	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
