"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/google/cluster/networks.js');
const serviceUtils = helper.requireModule("./infra/google/utils/utils.js");

let dD = require('../../../../schemas/google/cluster.js');
let info = {};
let options = {};

describe("testing /lib/google/cluster/networks.js", function () {
    process.env.SOAJS_CLOOSTRO_TEST = true;

    describe("listNetworks", function () {
        afterEach((done) => {
            sinon.restore();
            done();
        });

        it("Success -- No region ", function (done) {
            sinon
                .stub(serviceUtils, 'compute')
                .returns({
                    networks: {
                        list: function (test, cb) {
                            return cb(null, {items: [{routingConfig: {}, subnetworks: ["/regions//subnetworks/"]}]})
                        }
                    },
                    subnetworks: {
                        get: function (test, cb) {
                            return cb(null, {routingConfig: {}, subnetworks: []})
                        }
                    },
                });
            sinon
                .stub(serviceUtils, 'connector')
                .returns({
                    virtualNetworks: {
                        list: (resourceGroupName, cb) => {
                            return cb(null, info.virtualNetworks);
                        }
                    },
                });
            info = dD();
            options = info.deployCluster;
            options.params = {
                resourceGroupName: "tester",
            };
            options.soajs = {inputmaskData: {}};
            service.list(options, function (error, response) {
                assert.ifError(error);
                assert.ok(response);
                done();
            });
        });

        it("Success -- With region ", function (done) {
            sinon
                .stub(serviceUtils, 'compute')
                .returns({
                    networks: {
                        list: function (test, cb) {
                            return cb(null, {items: [{routingConfig: {}, subnetworks: ["/regions/test/subnetworks/"]}]})
                        }
                    },
                    subnetworks: {
                        get: function (test, cb) {
                            return cb(null, {routingConfig: {}, subnetworks: []})
                        }
                    },
                });
            sinon
                .stub(serviceUtils, 'connector')
                .returns({
                    virtualNetworks: {
                        list: (resourceGroupName, cb) => {
                            return cb(null, info.virtualNetworks);
                        }
                    },
                });
            info = dD();
            options = info.deployCluster;
            options.params = {
                resourceGroupName: "tester",
            };
            options.soajs = {
                inputmaskData: {
                    region: 'test'
                }
            };
            service.list(options, function (error, response) {
                assert.ifError(error);
                assert.ok(response);
                done();
            });
        });
    });

    describe("addNetworks", function () {
        afterEach((done) => {
            sinon.restore();
            done();
        });

        it("Success", function (done) {
            sinon
                .stub(serviceUtils, 'compute')
                .returns({
                    networks: {
                        insert: function (test, cb) {
                            return cb(null, true)
                        }
                    }
                });
            sinon
                .stub(serviceUtils, 'connector')
                .returns({
                    virtualNetworks: {
                        list: (resourceGroupName, cb) => {
                            return cb(null, info.virtualNetworks);
                        }
                    },
                });
            info = dD();
            options = info.deployCluster;

            options.params = {
                resourceGroupName: "tester",
            };

            options.soajs = {
                inputmaskData: {
                    params: {
                        name: 'test',
                        description: 'test'
                    }
                }
            };
            service.add(options, function (error, response) {
                assert.ifError(error);
                assert.ok(response);
                done();
            });
        });
    });

    describe("deleteNetworks", function () {
        afterEach((done) => {
            sinon.restore();
            done();
        });

        it("Success", function (done) {
            sinon
                .stub(serviceUtils, 'compute')
                .returns({
                    networks: {
                        delete: function (test, cb) {
                            return cb(null, true)
                        },
                        get: function (test, cb) {
                            return cb(null, {subnetworks: []})
                        },
                    },
                    firewalls: {
                        list: function (test, cb) {
                            return cb(null, {items: [{name: 'test'}]})
                        },
                        delete: function (test, cb) {
                            return cb(null, {items: [{name: 'test'}]})
                        }
                    },
                    globalOperations: {
                        get: function (test, cb) {
                            return cb(null, {status: 'DONE'})
                        },
                    },
                    subnetworks: {
                        delete: function (test, cb) {
                            return cb(null, true)
                        },
                    }
                });
            sinon
                .stub(serviceUtils, 'connector')
                .returns({
                    virtualNetworks: {
                        list: (resourceGroupName, cb) => {
                            return cb(null, info.virtualNetworks);
                        }
                    },
                });
            sinon
                .stub(service, 'list')
                .yields(null, [{'name' : 'test', autoCreateSubnetworks : true}, {'name' : 'test', autoCreateSubnetworks : false, subnetworks : [{name : 'test'}]}]);

            info = dD();
            options = info.deployCluster;

            options.params = {
                resourceGroupName: "tester",
                name: 'test'
            };

            options.soajs = {
                inputmaskData: {
                    name: 'test'

                },
                log : {
                    debug : function () {
                        return (null, null)
                    }
                }
            };
            service.delete(options, function () {
                done();
            });
        });
    });
});
