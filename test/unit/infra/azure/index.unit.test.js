"use strict";
const helper = require("../../../helper");
const assert = require("assert");
const sinon = require('sinon');
const nock = require("nock");

const service = helper.requireModule('./infra/azure/index.js');
const serviceUtils = helper.requireModule("./infra/azure/utils/index.js");
const config = helper.requireModule('./infra/azure/config.js');

let dD = require('../../../schemas/azure/cluster.js');
let info = {};
let options = {};
describe("testing /lib/azure/index.js", function () {
	
	describe("calling executeDriver -  authenticate", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {
						tokenCache: {
							_entries: [
								{
									accessToken: "1"
								}
							]
						}
					},
				});
			service.authenticate(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, true);
				done();
			});
		});
	});
	
	describe("calling getExtras", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		let expectedRes = { technologies: ['vm'], templates: ['local'], drivers: ['Terraform'] , providerSpecific: [ 'groups' ]};

		it("Success", function (done) {
			service.getExtras(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedRes);
				done();
			});
		});
	});

	describe("calling getRegions", function () {
		afterEach((done) => {
			sinon.restore();
			nock.cleanAll();
			done();
		});
		let res =
			{
				"value":
					[
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/eastasia",
							"name": "eastasia",
							"displayName": "East Asia",
							"longitude": "114.188",
							"latitude": "22.267"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/southeastasia",
							"name": "southeastasia",
							"displayName": "Southeast Asia",
							"longitude": "103.833",
							"latitude": "1.283"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/centralus",
							"name": "centralus",
							"displayName": "Central US",
							"longitude": "-93.6208",
							"latitude": "41.5908"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/eastus",
							"name": "eastus",
							"displayName": "East US",
							"longitude": "-79.8164",
							"latitude": "37.3719"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/eastus2",
							"name": "eastus2",
							"displayName": "East US 2",
							"longitude": "-78.3889",
							"latitude": "36.6681"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/westus",
							"name": "westus",
							"displayName": "West US",
							"longitude": "-122.417",
							"latitude": "37.783"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/northcentralus",
							"name": "northcentralus",
							"displayName": "North Central US",
							"longitude": "-87.6278",
							"latitude": "41.8819"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/southcentralus",
							"name": "southcentralus",
							"displayName": "South Central US",
							"longitude": "-98.5",
							"latitude": "29.4167"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/northeurope",
							"name": "northeurope",
							"displayName": "North Europe",
							"longitude": "-6.2597",
							"latitude": "53.3478"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/westeurope",
							"name": "westeurope",
							"displayName": "West Europe",
							"longitude": "4.9",
							"latitude": "52.3667"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/japanwest",
							"name": "japanwest",
							"displayName": "Japan West",
							"longitude": "135.5022",
							"latitude": "34.6939"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/japaneast",
							"name": "japaneast",
							"displayName": "Japan East",
							"longitude": "139.77",
							"latitude": "35.68"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/brazilsouth",
							"name": "brazilsouth",
							"displayName": "Brazil South",
							"longitude": "-46.633",
							"latitude": "-23.55"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/australiaeast",
							"name": "australiaeast",
							"displayName": "Australia East",
							"longitude": "151.2094",
							"latitude": "-33.86"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/australiasoutheast",
							"name": "australiasoutheast",
							"displayName": "Australia Southeast",
							"longitude": "144.9631",
							"latitude": "-37.8136"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/southindia",
							"name": "southindia", "displayName": "South India",
							"longitude": "80.1636",
							"latitude": "12.9822"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/centralindia",
							"name": "centralindia",
							"displayName": "Central India",
							"longitude": "73.9197",
							"latitude": "18.5822"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/westindia",
							"name": "westindia",
							"displayName": "West India",
							"longitude": "72.868",
							"latitude": "19.088"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/canadacentral",
							"name": "canadacentral",
							"displayName": "Canada Central",
							"longitude": "-79.383",
							"latitude": "43.653"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/canadaeast",
							"name": "canadaeast",
							"displayName": "Canada East",
							"longitude": "-71.217",
							"latitude": "46.817"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/uksouth",
							"name": "uksouth",
							"displayName": "UK South",
							"longitude": "-0.799",
							"latitude": "50.941"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/ukwest",
							"name": "ukwest",
							"displayName": "UK West",
							"longitude": "-3.084",
							"latitude": "53.427"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/westcentralus",
							"name": "westcentralus",
							"displayName": "West Central US",
							"longitude": "-110.234",
							"latitude": "40.890"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/westus2",
							"name": "westus2",
							"displayName": "West US 2",
							"longitude": "-119.852",
							"latitude": "47.233"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/koreacentral",
							"name": "koreacentral",
							"displayName": "Korea Central",
							"longitude": "126.9780",
							"latitude": "37.5665"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/koreasouth",
							"name": "koreasouth",
							"displayName": "Korea South",
							"longitude": "129.0756",
							"latitude": "35.1796"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/francecentral",
							"name": "francecentral",
							"displayName": "France Central",
							"longitude": "2.3730",
							"latitude": "46.3772"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/francesouth",
							"name": "francesouth",
							"displayName": "France South",
							"longitude": "2.1972",
							"latitude": "43.8345"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/australiacentral",
							"name": "australiacentral",
							"displayName": "Australia Central",
							"longitude": "149.1244",
							"latitude": "-35.3075"
						},
						{
							"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/locations/australiacentral2",
							"name": "australiacentral2", "displayName": "Australia Central 2",
							"longitude": "149.1244", "latitude": "-35.3075"
						}
					]

			};
		let expectedResponse =
			{
				regions: [
					{
						v: 'eastasia',
						l: 'East Asia'
					},
					{
						v: 'southeastasia',
						l: 'Southeast Asia'
					},
					{
						v: 'centralus',
						l: 'Central US'
					},
					{
						v: 'eastus',
						l: 'East US'
					},
					{
						v: 'eastus2',
						l: 'East US 2'
					},
					{
						v: 'westus',
						l: 'West US'
					},
					{
						v: 'northcentralus',
						l: 'North Central US'
					},
					{
						v: 'southcentralus',
						l: 'South Central US'
					},
					{
						v: 'northeurope',
						l: 'North Europe'
					},
					{
						v: 'westeurope',
						l: 'West Europe'
					},
					{
						v: 'japanwest',
						l: 'Japan West'
					},
					{

						v: 'japaneast',
						l: 'Japan East'
					},
					{
						v: 'brazilsouth',
						l: 'Brazil South'
					},
					{
						v: 'australiaeast',
						l: 'Australia East'
					},
					{
						v: 'australiasoutheast',
						l: 'Australia Southeast'
					},
					{
						v: 'southindia',
						l: 'South India'
					},
					{
						v: 'centralindia',
						l: 'Central India'
					},
					{
						v: 'westindia',
						l: 'West India'
					},
					{
						v: 'canadacentral',
						l: 'Canada Central'
					},
					{
						v: 'canadaeast',
						l: 'Canada East'
					},
					{
						v: 'uksouth',
						l: 'UK South'
					},
					{

						v: 'ukwest',
						l: 'UK West'
					},
					{
						v: 'westcentralus',
						l: 'West Central US'
					},
					{
						v: 'westus2',
						l: 'West US 2'
					},
					{
						v: 'koreacentral',
						l: 'Korea Central'
					},
					{
						v: 'koreasouth',
						l: 'Korea South'
					},
					{
						v: 'francecentral',
						l: 'France Central'
					},
					{
						v: 'francesouth',
						l: 'France South'
					},
					{
						v: 'australiacentral',
						l: 'Australia Central'
					},
					{
						v: 'australiacentral2',
						l: 'Australia Central 2'
					}
				]
			};
		it("Success", function (done) {
			info = dD();
			options = info.deployCluster;
			let nocks = nock(`https://management.azure.com`)
				.get(`/subscriptions/${options.infra.api.subscriptionId}/locations`)
				.query({
					'api-version': config.apiVersion2016
				})
				.reply(200, res);
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {
						tokenCache: {
							_entries: [
								{
									accessToken: "1"
								}
							]
						}
					},
				});

			service.getRegions(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponse);
				done();
			});
		});
		it("fail", function (done) {
			info = dD();
			options = info.deployCluster;
			let nocks = nock(`https://management.azure.com`)
				.get(`/subscriptions/${options.infra.api.subscriptionId}/locations`)
				.query({
					'api-version': config.apiVersion2016
				})
				.reply(400, { error: new Error("region") });
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {
						tokenCache: {
							_entries: [
								{
									accessToken: "1"
								}
							]
						}
					},
				});

			service.getRegions(options, function (error, response) {

				assert.ok(error);

				done();
			});
		});
	});

	describe("calling deployCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling getDeployClusterStatus", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		// let expectedRes={},
		it("Success", function (done) {
			service.getDeployClusterStatus(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				//	assert.deepEqual(response, expectedRes);
				done();
			});
		});
	});

	describe("calling getDNSInfo", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		// let expectedRes={},
		it("Success", function (done) {
			service.getDNSInfo(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				//	assert.deepEqual(response, expectedRes);
				done();
			});
		});
	});

	describe("calling scaleCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			service.scaleCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				//	assert.deepEqual(response, expectedRes);
				done();
			});
		});
	});

	describe("calling getCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		// let expectedRes={},
		it("Success", function (done) {
			service.getCluster(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				//	assert.deepEqual(response, expectedRes);
				done();
			});
		});
	});

	describe("calling updateCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling deleteCluster", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});

	describe("calling publishPorts", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		// let expectedRes={},
		it("Success", function (done) {
			service.publishPorts(options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				done();
			});
		});
	});
});
