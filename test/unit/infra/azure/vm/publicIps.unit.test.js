"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/azure/index.js');
const serviceUtils = helper.requireModule("./infra/azure/utils/index.js");

let dD = require('../../../../schemas/azure/cluster.js');
let info = {};
let options = {};

describe("testing /lib/azure/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;

	describe("calling executeDriver - listPublicIps", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			info = dD();
			sinon
				.stub(serviceUtils, 'authenticate')
				.yields(null, {
					credentials: {},
				});
			sinon
				.stub(serviceUtils, 'getConnector')
				.returns({
					publicIPAddresses: {
						list: (resourceGroupName, cb) => {
							return cb(null,  [
								{
								  "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
								  "ipAddress": "137.117.72.226",
								  "tags": {},
								  "name": "tester-vm-ip",
								  "publicIPAllocationMethod": "Dynamic",
								   "location": "eastus"
								}
							  ]
							  )
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
			};
			let expectedResponce =  [
				{
				  "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
				  "ipAddress": "137.117.72.226",
			 	  "labels": {},
				  "name": "tester-vm-ip",
				  "publicIPAllocationMethod": "Dynamic",
			 	  "region": "eastus"
				}
			  ];
			service.executeDriver('listPublicIps', options, function (error, response) {
				assert.ifError(error);
				assert.ok(response);
				assert.deepEqual(response, expectedResponce);
				done();
			});
		});
	});

});

describe("calling executeDriver - createPublicIp", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		info = dD();
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				publicIPAddresses: {
					createOrUpdate: (resourceGroupName,publicIpAddressName,params, cb) => {
						return cb(null,
							[
								{
								  "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
								  "ipAddress": "137.117.72.226",
								   "tags": {},
								  "name": "tester-vm-ip",
								  "publicIPAllocationMethod": "Dynamic",
								   "location": "eastus"
								}
							  ]

						  )
					}
				},
			});

		options = info.deployCluster;
		options.params = {
			resourceGroupName: "tester",
			publicIpName:"tester-vm-ip",
			region:"eastus",

		};
		let expectedResponce =
		    [
				{
				  "id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
				  "ipAddress": "137.117.72.226",
			 	  "labels": {},
				  "name": "tester-vm-ip",
				  "publicIPAllocationMethod": "Dynamic",
			 	  "region": "eastus"
				}




		];
		service.executeDriver('createPublicIp', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual(response, expectedResponce);
			done();
		});
	});
});

describe("calling executeDriver - updatePublicIp", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		info = dD();
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				publicIPAddresses: {
					createOrUpdate: (resourceGroupName,publicIpAddressName,params, cb) => {
						return cb(null, [
							{
								"name": "tester-vm-ip",
								"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
								"location": "eastus",
								"ipAddress": "137.117.72.226",
								"publicIPAllocationMethod": "Dynamic",
								"tags": {}
							  }

						  ])
					}
				},
			});

		options = info.deployCluster;
		options.params = {
			resourceGroupName: "tester",
			publicIpName:"tester-vm-ip",
			region:"eastus",

		};
		let expectedResponce = [
			{
				"name": "tester-vm-ip",
				"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-vm-ip",
				"region": "eastus",
				"ipAddress": "137.117.72.226",
				"publicIPAllocationMethod": "Dynamic",
				"labels": {}
			}

		];
		service.executeDriver('updatePublicIp', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			assert.deepEqual(response, expectedResponce);
			done();
		});
	});
});



describe("calling executeDriver - deletePublicIp", function () {
	afterEach((done) => {
		sinon.restore();
		done();
	});
	it("Success", function (done) {
		sinon
			.stub(serviceUtils, 'authenticate')
			.yields(null, {
				credentials: {},
			});
		sinon
			.stub(serviceUtils, 'getConnector')
			.returns({
				publicIPAddresses: {
					deleteMethod: (resourceGroupName, publicIpName, cb) => {
						return cb(null, true);
					}
				},
			});
		info = dD();
		options = info.deployCluster;
		options.params = {
			group: "testcase",
			publicIpName:"tester-vm-ip2",
		};
		service.executeDriver('deletePublicIp', options, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			done();
		});
	});
});
