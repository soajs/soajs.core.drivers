"use strict";
var fs = require('fs');
var assert = require('assert');
var helper = require("../helper.js");
var drivers = helper.requireModule('./index.js');

//Used when data from one testCase is needed in another test case
var interData = {};
var options = {};
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
describe("testing docker swarm driver functionality", function() {
    options.strategy = "swarm";

    //Testing the different methods of node and cluster management
    describe("testing cluster/node management", function() {
        //Success inspecting a cluster
        it("Success - inspecting a cluster", function(done) {
            drivers.inspectCluster(options, function(error, cluster){
                assert.ok(cluster);
                done();
            });
        });

        //Success in listing the cluster nodes
        it("Success - listing nodes", function(done) {
            drivers.listNodes(options, function(error, nodes){
                assert.ok(nodes);
                interData.nodeId = nodes[0].id;
                done();
            });
        });

        //Failure in inspecting node
        it("Failure - inspecting node", function(done) {
            options.params = {
                "id": "nothing"
            };

            drivers.inspectNode(options, function(error, nodes){
                assert.equal(error.code, 547);
                assert.equal(error.msg, "Unable to inspect the node");
                assert.ok(error);
                done();
            });
        });

        //Success in inspecting node
        it("Success - inspecting node", function(done) {
            options.params = {
                "id": interData.nodeId
            };

            drivers.inspectNode(options, function(error, node){
                assert.ok(node);
                done();
            });
        });

        //Failure in updating node
        it("Failure - updating node", function(done) {
            options.params = {
                "id": "nothing",
                "update": "Nothing"
            };

            drivers.updateNode(options, function(error, nodes){
                assert.equal(error.code, 547);
                assert.equal(error.msg, "Unable to inspect the node");
                assert.ok(error);
                done();
            });
        });

        //Success in updating node
        it("Success - updating node", function(done) {
            options.params = {
                "id": interData.nodeId,
                "availability": "active"
            };

            drivers.updateNode(options, function(error, node){
                assert.ok(node);
                done();
            });
        });

    });

    //Testing the different methods of service management
    describe("testing service management", function() {

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
                interData.replicaId = service.id;
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
                assert.equal(error.msg, "Unable to deploy service");
                assert.ok(error);
                done();
            });
        });

        //Failure in scaling a deployed service
        it("Fail - Scale service", function(done){
            options.params = {
                "id": "nothing",
                "replica": "nothing"
            };

            drivers.scaleService(options, function(error, service){
                assert.equal(error.code, 550);
                assert.equal(error.msg, "Unable to inspect the docker swarm service");
                assert.ok(error);
                done();
            });
        });

        //Success in scaling a deployed service
        it("Success - Scale service", function(done){
            options.params = {
                "id": interData.replicaId,
                "scale": 4
            };

            drivers.scaleService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Failure in redeploying a deployed service
        it("Fail - redeploy service", function(done){
            options.params = {
                "id": "nothing"
            };

            drivers.redeployService(options, function(error, service){
                assert.equal(error.code, 550);
                assert.equal(error.msg, "Unable to inspect the docker swarm service");
                assert.ok(error);
                done();
            });
        });

        //Success in redeploying a deployed service without UI
        it("Success - redeploy service without UI", function(done){
            options.params = {
                "id": interData.id
            };

            drivers.redeployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Success in redeploying a deployed service with UI
        it("Success - redeploy service with UI", function(done){
            options.params = {
                "id": interData.id
            };

            options.params.ui ={
                "repo": "repo",
                "owner": "owner",
                "branch": "branch",
                "commit": "commit",
                "provider": "provider",
                "domain": "domain"
            }

            drivers.redeployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Failure in deleting a deployed service
        it("Fail - delete service", function(done){
            options.params = {
                "id": "nothing",
                "replica": "nothing"
            };

            drivers.deleteService(options, function(error, service){
                assert.equal(error.code, 553);
                assert.equal(error.msg, "Unable to delete the docker swarm service");
                assert.ok(error);
                done();
            });
        });

        //Success in deleting a deployed service
        it("Success - delete service", function(done){
            options.params = {
                "id": interData.id
            };

            drivers.deleteService(options, function(error, service){
                assert.ok(service);
                done();
            });
        });
    });

    //Test the different scenarios of finding/listing/inspection docker swarm services
    describe("Docker swarm service finding/listing/inspection", function(){
        //Finding a service that does exist
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

        //Listing services of an environment that does exist
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
                "id": interData.replicaId
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

        //Getting the service host of a service that does exists
        it("Success - Getting the service host of a service", function(done){
            options.params = {
                "env": "dashboard",
                "serviceName": "TestDeployment"
            };

            drivers.getServiceHost(options, function(error, serviceHost){
                assert.ok(serviceHost);
                done();
            });
        });

        //Getting the service host of a service that does not exists
        it("Fail - Getting the service host of a service", function(done){
            options.params = {
                "env": "nothing",
                "serviceName": "nothing"
            };

            drivers.getLatestVersion(options, function(error, serviceHost){
                assert.ok(error)
                assert.equal(error.code, '661');
                assert.equal(error.msg, "Unable to find service");
                done();
            });
        });
    });
});


describe("Invalid strategy selection", function(){
    //provided a strategy that does not exist
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