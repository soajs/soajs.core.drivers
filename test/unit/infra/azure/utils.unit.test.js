"use strict";
const helper = require("../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/azure/utils/index.js');

let dD = require('../../../schemas/azure/cluster.js');
let info = {};
let options = {};
describe("testing /lib/azure/utils/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("calling authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});

		it("Error wrong credentials", function (done) {

			info = dD();
			options = info.deployCluster;
			service.authenticate(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});

		it("Error no credentials", function (done) {
			info = dD();
			options = {};
			service.authenticate(options, function (error, response) {
				assert.ok(error);
				done();
			});
		});
	});

	describe("calling connector", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});

		it("Success", function (done) {
			info = dD();
			options  = {
				"credentials": {
					"signRequest": {},
					"environment": {
						"validateAuthority": true,
						"name": "Azure",
						"portalUrl": "https://portal.azure.com",
						"publishingProfileUrl": "http://go.microsoft.com/fwlink/?LinkId=254432",
						"managementEndpointUrl": "https://management.core.windows.net",
						"resourceManagerEndpointUrl": "https://management.azure.com/",
						"sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
						"sqlServerHostnameSuffix": ".database.windows.net",
						"galleryEndpointUrl": "https://gallery.azure.com/",
						"activeDirectoryEndpointUrl": "https://login.microsoftonline.com/",
						"activeDirectoryResourceId": "https://management.core.windows.net/",
						"activeDirectoryGraphResourceId": "https://graph.windows.net/",
						"batchResourceId": "https://batch.core.windows.net/",
						"activeDirectoryGraphApiVersion": "2013-04-05",
						"storageEndpointSuffix": ".core.windows.net",
						"keyVaultDnsSuffix": ".vault.azure.net",
						"azureDataLakeStoreFileSystemEndpointSuffix": "azuredatalakestore.net",
						"azureDataLakeAnalyticsCatalogAndJobEndpointSuffix": "azuredatalakeanalytics.net"
					},
					"authorizationScheme": "Bearer",
					"tokenCache": {
						"_entries": [
							{
								"tokenType": "Bearer",
								"expiresIn": 3599,
								"expiresOn": "2018-06-06T16:55:03.317Z",
								"resource": "https://management.core.windows.net/",
								"accessToken": "1",
								"isMRRT": true,
								"_clientId": "2",
								"_authority": "3"
							}
						]
					},
					"clientId": "1",
					"domain": "2",
					"secret": "3",
					"context": {}
				},
				"subscriptions": [
					{
						"id": "123",
						"state": "Disabled",
						"authorizationSource": "RoleBased",
						"tenantId": "123",
						"user": {
							"name": "123",
							"type": "123"
						},
						"environmentName": "Azure",
						"name": "Free Trial"
					}
				],
				subscriptionId: '123'
			};
			options.api = 'compute';
			service.getConnector(options);
			options.api = 'storage';
			service.getConnector(options);
			options.api = 'network';
			service.getConnector(options);
			options.api = 'resource';
			service.getConnector(options);
			options.api = 'weird';
			service.getConnector(options);
			done();
		});
	});
});
