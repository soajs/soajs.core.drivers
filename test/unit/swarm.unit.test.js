"use strict";
var fs = require('fs');
var assert = require('assert');
var helper = require("../helper.js");
var drivers = helper.requireModule('./index.js');
var imagePrefix = process.env.SOAJS_IMAGE_PREFIX;

describe("testing docker swarm driver functionality", function() {
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

    options.strategy = "swarm";

    //Testing the different methods of node and cluster management
    describe("Testing docker swarm cluster/node management", function() {
	    beforeEach(function(done){
		    setTimeout(function(){
			    done();
		    }, 2000);
	    });
	    
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
    describe("Testing docker swarm service management", function() {
	    beforeEach(function(done){
		    setTimeout(function(){
			    done();
		    }, 2000);
	    });
	    
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
                "name": "dashboard_soajs_prx",
                "image": imagePrefix + "/soajs",
                "variables": [
                    'NODE_ENV=production',
                    'SOAJS_ENV=dashboard',
                    'SOAJS_SOLO=true',
                    'SOAJS_DEPLOY_HA=swarm',
                    'SOAJS_HA_NAME={{.Task.Name}}',

                    'SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js',
                    'SOAJS_SRV_AUTOREGISTERHOST=true',

                    'SOAJS_GIT_OWNER=soajs',
                    'SOAJS_GIT_REPO=soajs.prx',
                    'SOAJS_GIT_BRANCH=develop'
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dashboard",
                    "soajs.service.type": "service",
                    "soajs.service.name": "proxy",
                    "soajs.service.group": "SOAJS-Core-Services",
                    "soajs.service.version": "1",
                    "soajs.service.label": "dashboard_soajs_prx"
                },
                "cmd": [
                    "bash",
                    "-c",
                    './soajsDeployer.sh -T service -X deploy -L'
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "replicated",
                    "replicas": 1
                },
                "version": "",
                "containerDir": '/opt/soajs/FILES/deployer/',
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
                ]
            };

            drivers.deployService(options, function(error, service){
                interData.replicaId = service.id;
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 10000);
            });
        });

        //Failure to deploy service (Deployment exists already)
        it("Fail - service deployment", function(done){
            options.params = {
                "env": "dashboard",
                "name": "dashboard_soajs_prx",
                "image": imagePrefix + "/soajs",
                "variables": [
                    'NODE_ENV=production',
                    'SOAJS_ENV=dashboard',

                    'SOAJS_DEPLOY_HA=swarm',
                    'SOAJS_HA_NAME={{.Task.Name}}',

                    'SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js',
                    'SOAJS_SRV_AUTOREGISTERHOST=true',

                    'SOAJS_GIT_OWNER=soajs',
                    'SOAJS_GIT_REPO=soajs.prx',
                    'SOAJS_GIT_BRANCH=develop'
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dashboard",
                    "soajs.service.type": "service",
                    "soajs.service.name": "proxy",
                    "soajs.service.group": "SOAJS-Core-Services",
                    "soajs.service.version": "1",
                    "soajs.service.label": "dashboard_soajs_prx"
                },
                "cmd": [
                    "bash",
                    "-c",
                    './soajsDeployer.sh -T service -X deploy -L'
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "replicated",
                    "replicas": 2
                },
                "version": "",
                "containerDir": '/opt/soajs/FILES/deployer/',
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
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
                "scale": 2
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
    describe("testing docker swarm service finding/listing/inspection", function(){
	    beforeEach(function(done){
		    setTimeout(function(){
			    done();
		    }, 2000);
	    });
	    
    	//Finding a service that does exist
        it("Success - finding service", function(done){
            options.params = {
                "env": "dashboard",
                "serviceName": "proxy"
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
                interData.taskId = service.tasks[0].id;
                assert.ok(service);
                done();
            });
        });

        //Getting the latest version of a service that does exists
        it("Success - Getting the latest version of a service", function(done){
            options.params = {
                "env": "dashboard",
                "serviceName": "proxy"
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
                "serviceName": "proxy"
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

    //Test the different methods of docker swarm tasks/containers
    describe("Testing docker swarm task operations", function(){
    	beforeEach(function(done){
			setTimeout(function(){
		        done();
			}, 2000);
	    });
    	
        //Inspecting a task that does not exist
        it("Fail - inspecting task", function(done){
            options.params = {
                "taskId": "nothing"
            };
            drivers.inspectTask(options, function(error, task){
                assert.equal(error.code, "555");
                assert.equal(error.msg, "Unable to inspect the docker swarm task");
                assert.ok(error);
                done();
            });
        });

        //Inspecting a task that does exist
        it("Success - inspecting service", function(done){
            options.params = {
                "taskId": interData.taskId
            };
            drivers.inspectTask(options, function(error, task){
                assert.ok(task);
                done();
            });
        });

        //Performing a maintenance operation of a container that does not exist
        it("Fail - maintenance operation", function(done){
            options.params = {
                "id": "nothing"
            };

            drivers.maintenance(options, function(error, response){
               assert.ok(error);
               assert.equal(error.code, "552");
               assert.equal(error.msg, "Unable to list the docker swarm service tasks");
               done();
            });
        });

        //Performing a maintenance operation of a container that does exist
        it("Success - maintenance operation", function(done){
            options.params = {
                "id": interData.replicaId,
                "maintenancePort": 5009,
                "operation": "reloadRegistry"
            };

            drivers.maintenance(options, function(error, response){
                assert.ok(response)
                done();
            });
        });

        //getting the logs of a containter that does not exist
        it("Fail - get container logs", function(done){
            options.params = {
                "taskId": "nothing"
            };
            drivers.getContainerLogs(options, function(error, logs){
                assert.equal(error.code, "555");
                assert.equal(error.msg, "Unable to inspect the docker swarm task");
                assert.ok(error);
                done();
            });
        });

        //Getting the logs of a container that does exist
        it("Success - get container logs", function(done){
            options.params = {
                "taskId": interData.taskId
            };
            options.driver = "swarm.local";
            drivers.getContainerLogs(options, function(error, logs){
            	assert.ifError(error);
                assert.ok(logs);
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