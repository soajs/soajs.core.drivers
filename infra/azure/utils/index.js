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
	},

	validateInput: function (soajs, inputs, extra, cb) {
		let myValidator = new soajs.validator.Validator();
		let schema;

		//create a copy of the inputs
		let inputsCopy = JSON.parse(JSON.stringify(inputs));

		try {
			schema = require('../schemas/' + extra + '.js')
		} catch (e) {
			return cb({
				code: 761,
				msg: 'No schema found to validate inputs.'
			});
		}

		//delete group from params in case the extra is of type group
		if (extra === 'group') delete inputsCopy.group;

		let status = myValidator.validate(inputsCopy, schema);

		soajs.log.debug(status);

		if (!status.valid) {
			let errors = [];
			status.errors.forEach(function (err) {
				errors.push(err.stack);
			});
			return cb({
				code: 173,
				msg: errors.join(" - ")
			});
		}
		else return cb(null, true);
	}
};

module.exports = driver;
