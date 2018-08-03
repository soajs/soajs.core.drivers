'use strict';

const azureApi = require('ms-rest-azure');
const AzureComputeManagementClient = require('azure-arm-compute');
const AzureStorageManagementClient = require('azure-arm-storage');
const AzureNetworkManagementClient = require('azure-arm-network');
const AzureResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

const driver = {

	"authenticate": function (options, cb) {
		if (options && options.infra && options.infra.api && options.infra.api.clientId &&  options.infra.api.secret &&  options.infra.api.domain){
			azureApi.loginWithServicePrincipalSecret(options.infra.api.clientId, options.infra.api.secret, options.infra.api.domain, function (error, credentials, subscriptions) {
				if(error) return cb(error);

				return cb(null, { credentials, subscriptions });
			});
		}
		else {
			return cb(new Error("Invalid credentials"));
		}
	},

	/**
	 * Gets the connector to the appropriate azure api
	 * @param  {Object}   opts  Options passed to function as params
	 * @return {Instance}       Instance of the azure api class
	 */
	getConnector: function (opts) {
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
};

module.exports = driver;
