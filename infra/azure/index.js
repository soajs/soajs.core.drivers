'use strict';

const azureApi = require('ms-rest-azure');

const utils = require('../../lib/utils/utils.js');
const helper = require('./helper.js');

const defaultDriver = 'vm';

function runCorrespondingDriver(method, options, cb) {
	utils.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {

	"authenticate": function (options, cb) {
		azureApi.loginWithServicePrincipalSecret(options.infra.api.clientId, options.infra.api.secret, options.infra.api.domain, function (error, credentials, subscriptions) {
			if(error) return cb(error);

			if (options.returnCredentials) {
				return cb(null, { credentials, subscriptions });
			}
			return cb(null, true);
		});
	},

	"getExtras": function (options, cb) {
		return cb(null, {technologies: ['vm'], templates: null, drivers: ['Native']});  //TODO: confirm templates array
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
		driver.authenticate(options, (error, authData) => {
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
