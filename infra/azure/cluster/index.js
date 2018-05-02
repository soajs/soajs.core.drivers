'use strict';

const async = require('async');
const fs = require('fs');

const azureApi = require('ms-rest-azure');
const AzureComputeManagementClient = require('azure-arm-compute');
const AzureStorageManagementClient = require('azure-arm-storage');
const AzureNetworkManagementClient = require('azure-arm-network');
const AzureResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

const utils = require('../../../lib/utils/utils.js');
const helper = require('./helper.js');

const defaultDriver = 'vm';


function getConnector(opts) {
	switch (opts.api) {
		case 'compute':
			return new AzureComputeManagementClient(opts.credentials, opts.subscriptionId);
		case 'storage':
			return new AzureStorageManagementClient(opts.credentials, opts.subscriptionId);
		case 'network':
			return new AzureNetworkManagementClient(opts.credentials, opts.subscriptionId);
		case 'resource':
			return new AzureResourceManagementClient(opts.credentials, opts.subscriptionId);
		default:
			return new AzureComputeManagementClient(opts.credentials, opts.subscriptionId);
	}
}

function runCorrespondingDriver(method, options, cb) {
	let driverName = (options.infra && options.infra.stack && options.infra.stack.technology) ? options.infra.stack.technology : defaultDriver;
	driverName = (options.params && options.params.technology) ? options.params.technology : driverName;
	fs.exists(__dirname + "/../" + driverName + "/", (exists) => {
		if (!exists) {
			return cb(new Error("Requested driver does not exist!"));
		}

		let driver = require("../" + driverName);
		driver[method](options, cb);
	});
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
		return cb(null, {technologies: ['vm'], templates: ['local']});  //TODO: confirm templates array
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

	"listRegions": function (options, cb) {
		options.returnCredentials = true;
        driver.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                let opts = {
                    subscriptionId: options.infra.api.subscriptionId,
                    bearerToken: authData.credentials.tokenCache._entries[0].accessToken
                };

                helper.listRegions(opts, function(error, regions) {
                    utils.checkError(error, 713, cb, () => {
                        return cb(null, (regions) ? regions : []);
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

	"deployVM": function (options, cb) {
		runCorrespondingDriver('deployVM', options, cb);
	},

	"inspectVM": function (options, cb) {
		runCorrespondingDriver('inspectVM', options, cb);
	},

	"powerOffVM": function (options, cb) {
		runCorrespondingDriver('powerOffVM', options, cb);
	},

	"startVM": function (options, cb) {
		runCorrespondingDriver('startVM', options, cb);
	},

	"listVMs": function (options, cb) {
		runCorrespondingDriver('listVMs', options, cb);
	},

	"deleteVM": function (options, cb) {
		runCorrespondingDriver('deleteVM', options, cb);
	},

	"restartVM": function (options, cb) {
		runCorrespondingDriver('restartVM', options, cb);
	},

	"redeployVM": function (options, cb) {
		runCorrespondingDriver('redeployVM', options, cb);
	},

	"deleteResourceGroup": function (options, cb) {
		runCorrespondingDriver('deleteResourceGroup', options, cb);
	},

	"listVmSizes": function (options, cb) {
		runCorrespondingDriver('listVmSizes', options, cb);
	},

	"listVmImagePublishers": function (options, cb) {
		runCorrespondingDriver('listVmImagePublishers', options, cb);
	},

	"listVmImagePublisherOffers": function (options, cb) {
		runCorrespondingDriver('listVmImagePublisherOffers', options, cb);
	},

	"listVmImageVersions": function (options, cb) {
		runCorrespondingDriver('listVmImageVersions', options, cb);
	},

};

module.exports = driver;
