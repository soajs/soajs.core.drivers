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
	
	describe.skip("calling executeDriver - listPublicIps", function () {
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
							return cb(null, [info.publicIp["tester-ip"]])
						}
					},
				});

			options = info.deployCluster;
			options.params = {
				resourceGroupName: "tester",
			};
			let expectedResponce = [
				{
					"name": "tester-ip",
					"id": "/subscriptions/d159e994-8b44-42f7-b100-78c4508c34a6/resourceGroups/tester/providers/Microsoft.Network/publicIPAddresses/tester-ip",
					"location": "eastus",
					"ipAddress": "40.121.55.181",
					"publicIPAllocationMethod": "Dynamic",
					"tags": {}
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
