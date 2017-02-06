"use strict";
var fs = require('fs');
var assert = require('assert');
var helper = require("../helper.js");
var drivers = helper.requireModule('./index.js');

describe("testing docker swarm driver functionality", function() {
    //Used when data from one testCase is needed in another test case
    var interData = {};

    var options = {};
    options.strategy = "swarm";
    options.deployerConfig = {};

    options.soajs = {
        registry: {
            serviceConfig: {
                ports: {
                    controller: 4000,
                    maintenanceInc: 1000
                }
            }
        }
    };
    //Testing the different scenarios of deploying a service
    describe("testing deploy service", function() {

        //Successfully deploying a service global mode
        it("Success - service deployment global mode", function(done){

            options.params = {
                "env": "dashboard",
                "name": "TestDeploymentGlobalMode",
                "image": "alpine",
                "variables": [
                    "Dummy_Variable=variable",
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dashboard",
                    "soajs.service.name": "TestDeploymentGlobalMode",
                    "soajs.service.version": "2",
                },
                "cmd": [
                    "sh",
                    "-c",
                    "sleep 36000"
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "global",
                },
                "version": "",
                "containerDir": "/opt/",
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
                    {
                        "name": "service-port",
                        "isPublished": false,
                        "target": 4002
                    },
                    {
                        "name": "maintenance-port",
                        "isPublished": false,
                        "target": 5002
                    }
                ]
            };

            drivers.deployService(options, function(error, service){
                interData.id = service.id;
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Successfully deploying a service replicated mode
        it("Success - service deployment replicated mode", function(done){

            options.params = {
                "env": "dashboard",
                "name": "TestDeployment",
                "image": "alpine",
                "variables": [
                    "Dummy_Variable=variable",
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dashboard",
                    "soajs.service.name": "TestDeployment",
                    "soajs.service.version": "2",
                },
                "cmd": [
                    "sh",
                    "-c",
                    "sleep 36000"
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "replicated",
                    "replicas": 2
                },
                "version": "",
                "containerDir": "/opt/",
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
                    {
                        "name": "service-port",
                        "isPublished": false,
                        "target": 4001
                    },
                    {
                        "name": "maintenance-port",
                        "isPublished": false,
                        "target": 5001
                    }
                ]
            };

            drivers.deployService(options, function(error, service){
                interData.id = service.id;
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Failure to deploy service (Deployment exists already)
        it("Fail - service deployment", function(done){
            options.params = {
                "env": "dashboard",
                "name": "TestDeployment",
                "image": "alpine",
                "variables": [
                    "Dummy_Variable=variable",
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dashboard",
                    "soajs.service.name": "TestDeployment",
                    "soajs.service.version": "2",
                },
                "cmd": [
                    "sh",
                    "-c",
                    "sleep 36000"
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "replicated",
                    "replicas": 1
                },
                "version": "",
                "containerDir": "/opt/",
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
                    {
                        "name": "service-port",
                        "isPublished": false,
                        "target": 4001
                    },
                    {
                        "name": "maintenance-port",
                        "isPublished": false,
                        "target": 5001
                    }
                ]
            };
            drivers.deployService(options, function(error, service){
                assert.equal(error.code, 662);
                assert.equal(error.msg, "Unable to deploy service")
                assert.ok(error);
                done();
            });
        });
    });

    //Test the different scenarios of finding/listing/inspection docker swarm services
    describe("Docker swarm service finding/listing/inspection", function(){
        //Finding a service that exists
        it("Success - finding service", function(done){
            options.params = {
                "env": "dashboard",
                "serviceName": "TestDeployment"
            };

            drivers.findService(options, function(error, service){
                assert.ok(service);
                done();
            });
        });

        //Finding a service that does not exist
        it("Fail - finding service", function(done){
            options.params = {
                "env": "nothing",
                "serviceName": "nothing"
            };

            drivers.findService(options, function(error, service){
                assert.equal(error.code, '661');
                assert.equal(error.msg, 'Unable to find service');
                done();
            });
        });

        //Listing services of an environment that exists
        it("Success - listing services", function(done){
            options.params = {
                "env": "dashboard"
            };
            drivers.listServices(options, function(error, service){
                assert.ok(service);
                done();
            });
        });

        //Inspecting a service that does not exist
        it("Fail - inpsecting service", function(done){
            options.params = {
                "id": "dashboard"
            };
            drivers.inspectService(options, function(error, service){
                assert.ok(error);
                assert.equal(error.code, '550');
                assert.equal(error.msg, 'Unable to inspect the docker swarm service');
                done();
            });
        });

        //Inspecting a service that does exist
        it("Success - inspecting service", function(done){
            options.params = {
                "id": interData.id
            };
            drivers.inspectService(options, function(error, service){
                assert.ok(service);
                done();
            });
        });

        //Getting the latest version of a service that does exists
        it("Success - Getting the latest version of a service", function(done){
            options.params = {
                "env": "dashboard",
                "serviceName": "TestDeployment"
            };

            drivers.getLatestVersion(options, function(error, serviceVersion){
                assert.ok(serviceVersion);
                done();
            });
        });

        //Getting the latest version of a service that does not exists
        it("Fail - Getting the latest version of a service", function(done){
            options.params = {
                "env": "nothing",
                "serviceName": "nothing"
            };

            drivers.getLatestVersion(options, function(error, serviceVersion){
                assert.ok(error)
                assert.equal(error.code, '661');
                assert.equal(error.msg, "Unable to find service");
                done();
            });
        });
    });
});


describe("Invalid strategy selection", function(){
    //provided a strategy that doesn't exist
    it("Fail - Invalid strategy", function(done){
        var options = {};
        options.strategy = "nothing";
        drivers.deployService(options, function(error){
            assert.ok(error);
            assert.equal(error.code, '518');
            assert.equal(error.msg, 'The chosen strategy does not exist');
            done();
        });
    });
});