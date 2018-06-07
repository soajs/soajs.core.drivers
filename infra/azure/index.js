'use strict';

const utils = require('../../lib/utils/utils.js');
const helper = require('./helper.js');
const driverUtils = require('./utils/index.js');

const defaultDriver = 'vm';

function runCorrespondingDriver(method, options, cb) {
	utils.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {
	
	"getExtras": function (options, cb) {
		return cb(null, {technologies: ['vm'], templates: 'local', drivers: ['Native']});  //TODO: confirm templates array
		return cb(null, {technologies: ['vm'], templates: ['local'], drivers: ['Native', 'Terraform']});
	},
	
	"deployCluster": function (options, cb) {
		return cb(null, true);
	},
	
	"getDeployClusterStatus": function (options, cb) {
		return cb(null, true);
	},
	
	"getDNSInfo": function (options, cb) {
		return cb(null, true);
	},
	
	"getRegions": function (options, cb) {
		options.returnCredentials = true;
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				let opts = {
					subscriptionId: options.infra.api.subscriptionId,
					bearerToken: authData.credentials.tokenCache._entries[0].accessToken
				};

				helper.listRegions(opts, function(error, regions) {
					utils.checkError(error, 713, cb, () => {
						return cb(null, (regions) ? {"regions": regions }  : []);
					});
				});
			});
		});
	},

	"scaleCluster": function (options, cb) {
		return cb(null, true);
	},
	
	"getCluster": function (options, cb) {
		return cb(null, true);
	},
	
	"updateCluster": function (options, cb) {
		return cb(null, true);
	},
	
	"deleteCluster": function (options, cb) {
		return cb(null, true);
	},
	
	"publishPorts": function (options, cb) {
		return cb(null, true);
	},
	
	"deployExternalLb": function (options, cb) {
		return cb(null, true);
	},
	
	"updateExternalLB": function (options, cb) {
		return cb(null, true);
	},
	
	"deleteExternalLB": function (options, cb) {
		return cb(null, true);
	},
	
	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;