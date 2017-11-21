"use strict";
let fs = require('fs');
let shell = require('shelljs');
let assert = require('assert');
let helper = require("../helper.js");
let drivers = helper.requireModule('./index.js');
let imagePrefix = process.env.SOAJS_IMAGE_PREFIX;

describe("Testing kubernetes driver functionality", function() {
    //Used when data from one testCase is needed in another test case
    let interData = {};
	let options = {};
	let template = {};
	options.deployerConfig = {

	};
	options.model = {}; //NOTE: kubernetes driver does not require a mongo connection
	options.soajs = {
		registry: {
			serviceConfig: {
				ports: {
					controller: 4000,
					maintenanceInc: 1000
				}
			},
			coreDB: {
				provision: {

				}
			}
		}
	};

    options.strategy = "kubernetes";
    options.driver = 'kubernetes.local';
	options.env = "DEV";

    describe("Adding kubernetes plugins - heapster and metrics server", function() {

        //Managing Resources post
		it("Success - managing Resources - post - heapster", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				"action" : 'post',
				"resource": 'heapster'
			};

			drivers.manageResources(options, function(error, service){
				assert.ok(service);
				done();
			});
		});

        it("Success - managing Resources - post - metrics server", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				"action" : 'post',
				"resource": 'metrics-server'
			};

			drivers.manageResources(options, function(error, service){
				assert.ok(service);
				done();
			});
		});

    });

    //Testing the different namespace methods
    describe("Testing kubernetes namespace management", function() {

        it("Success - creating global namespace", function(done){
           options.deployerConfig.namespace ={
               "default": "soajs",
               "perService": false
           };

           options.params = {
               "serviceName": "testservice",
               "env": "testenv"
           };

           drivers.createNameSpace(options, function(error, namespace){
               assert.ok(namespace);
               setTimeout(function(){
                   done();
               }, 5000);
           });
        });

        it("Fail - creating global namespace (namespace already exists)", function(done){
            options.deployerConfig.namespace ={
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "serviceName": "testservice",
                "env": "testenv"
            };

            drivers.createNameSpace(options, function(error, namespace){
                assert.equal(error.code, 672);
                assert.equal(error.msg, "Namespace already exists");
                assert.ok(error);
                done();
            });
        });

        it("Success - creating perService namespace", function(done){
            options.deployerConfig.namespace ={
                "default": "soajs",
                "perService": true
            };

            options.params = {
                "serviceName": "testservice",
                "env": "testenv"
            };

            drivers.createNameSpace(options, function(error, namespace){
                assert.ok(namespace);
                setTimeout(function(){
                    done();
                }, 5000);
            });
        });

        it("Fail - creating perService namespace (namespace already exists)", function(done){
            options.deployerConfig.namespace ={
                "default": "soajs",
                "perService": true
            };

            options.params = {
                "serviceName": "testservice",
                "env": "testenv"
            };

            drivers.createNameSpace(options, function(error, namespace){
                assert.equal(error.code, 672);
                assert.equal(error.msg, "Namespace already exists");
                assert.ok(error);
                done();
            });
        });

        it("Success - list all namespaces", function(done){
            options.deployerConfig.namespace ={
                "default": "soajs",
                "perService": true
            };

            drivers.listNameSpaces(options, function(error, namespace){
                assert.ok(namespace);
                done();
            });
        });

        it("Fail - delete a nonexistent namespace", function(done){
            options.deployerConfig.namespace ={
                "default": "nonamespace",
                "perService": false
            };

            drivers.deleteNameSpace(options, function(error, namespace){
                assert.equal(error.code, 671);
                assert.equal(error.msg, "Error while deleting the namespace");
                assert.ok(error);
                done();
            });
        });

        it("Success - delete a perService namespace", function(done){
            options.deployerConfig.namespace ={
                "default": "soajs",
                "perService": true
            };

            options.params = {
                "serviceName": "testservice",
                "env": "testenv"
            };

            drivers.deleteNameSpace(options, function(error){
                assert.ifError(error);
                done();
            });
        });
    });

    //Testing the different methods of node and cluster management
    describe("Testing kubernetes cluster/node management", function() {

        //Success in listing the cluster nodes
        it("Success - listing nodes", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            drivers.listNodes(options, function(error, nodes){
                assert.ok(nodes);
                interData.nodeId = nodes[0].id;
                done();
            });
        });

	    it("Success - List Kube services", function(done){
		    options.params = { };
		    drivers.listKubeServices(options, function(error, services){
			    assert.ok(services);
			    done();
		    });
	    });

        //Failure in inspecting node
        it("Fail - inspecting node", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing"
            };

            drivers.inspectNode(options, function(error, nodes){
                assert.equal(error.code, 655);
                assert.equal(error.msg, "Unable to inspect node");
                assert.ok(error);
                done();
            });
        });

        //Success in inspecting node
        it("Success - inspecting node", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.nodeId
            };

            drivers.inspectNode(options, function(error, node){
                assert.ok(node);
                done();
            });
        });

        //Failure in updating node
        it("Fail - updating node", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing",
                "update": "Nothing"
            };

            drivers.updateNode(options, function(error, nodes){
                assert.equal(error.code, 655);
                assert.equal(error.msg, "Unable to inspect node");
                assert.ok(error);
                done();
            });
        });

        //Success in updating node
        it("Success - updating node", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.nodeId,
                "availability": "active"
            };

            drivers.updateNode(options, function(error, node){
                assert.ok(node);
                done();
            });
        });

        it("Fail - remove node", function(done) {
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": 'tester'
            };

            drivers.removeNode(options, function(error, result){
                assert.ok(error);
                assert.equal(error.code, 523);
                done();
            });
        });

    });

    //Testing the different methods of service management
    describe("Testing kubernetes service management", function() {

        //Successfully deploying a service global mode
        it("Success - service deployment global mode - global namespace - readinessProbes", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs-test",
                "perService": false
            };
	        options.deployerConfig.nginxDeployType = "LoadBalancer";
            options.params = {
                "env": "dev",
	            "namespace": "soajs-test",
                "name": "testdeploymentglobalmode",
	            "customName": "customName",
                "image": "alpine",
                "variables": [
                    "Dummy_Variable=variable",
	                "$SOAJS_DEPLOY_HA"
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dev",
                    "soajs.service.name": "testdeploymentglobalmode",
                    "soajs.service.version": "2",
                    "soajs.service.label": "testdeploymentglobalmode"
                },
                "command": [
                    "sh",
                    "-c",
                    "ping www.google.com"
                ],
	            "cpuLimit": "0.1",
                "replication": {
                    "mode": "daemonset",
                },
                "version": "",
                "containerDir": "/opt/",
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "readinessProbe": {
                    "httpGet": {
                        "path": "/heartbeat",
                        "port": "maintenance"
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 5,
                    "periodSeconds": 3,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
	            "voluming": {
		            "volumes": [
			            {
				            "name": "soajs-log-volume-test",
				            "hostPath": {
					            "path": "/var/log/soajstest"
				            }
			            }
		            ],
		            "volumeMounts": [
			            {
				            "mountPath": "/var/log/soajstest",
				            "name": "soajs-log-volume-test",
			            }
		            ]
	            }
            };

            drivers.deployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    options.params = {
                        "env": "dev"
                    };

                    drivers.listServices(options, function(error, service){
                        interData.globalId = service[0].id;
                        done();
                    });
                }, 2000);
            });
        });

        //Successfully deploying a service replicated mode
        it("Success - service deployment replicated mode (needed for tests below) - global namespace", function(done){
	        options.deployerConfig.nginxDeployType = "LoadBalancer";
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "dev2",
                "name": "servicetobemanipulated",
                "image": "alpine",
                "variables": [
                    "Dummy_Variable=variable",
                ],
                "labels": {
                    "soajs.content": "true",
                    "soajs.env.code": "dev2",
                    "soajs.service.name": "servicetobemanipulated",
                    "soajs.service.version": "2",
                    "soajs.service.label": "servicetobemanipulated"
                },
                "command": [
                    "sh"
                ],
                "args": [
                    "-c",
                    "ping www.google.com"
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "deployment",
                    "replicas": 1
                },
                "version": "",
                "containerDir": "",
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
	            serviceAccount: {
		            "metadata": {
			            "name": "heapster",
			            "namespace": "soajs"
		            }
	            },
	            "autoScale": {
		            min: 1,
		            max: 3,
		            metrics: {
			            cpu: {
				            percent: 50
			            }
		            }
	            },
                "network": "soajsnet",
	            "cpuLimit": "0.1",
                "ports": [
                    {
                        "name": "service",
                        "isPublished": false,
                        "target": 4004
                    },
                    {
                        "name": "maintenance",
                        "isPublished": false,
                        "target": 5004
                    },
	                {
		                "name": "published",
		                "isPublished": true,
		                "target": 4044
	                }
                ]
            };

            drivers.deployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    options.params = {
                        "env": "dev2",
                    };

                    drivers.listServices(options, function(error, service){
                        interData.id = service[0].id

                        options.params.custom = true;
                        drivers.listServices(options, function (error, services) {
	                        delete  options.deployerConfig.nginxDeployType;
                            assert.ifError(error);
                            assert.ok(services);
                            done();
                        });
                    });
                }, 2000);
            });
        });

        //Successfully deploying a service replicated mode
        it("Success - service deployment replicated mode", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "dashboard",
                "name": "proxy",
                "image": imagePrefix + "/soajs",
                "variables": [
                    'NODE_ENV=production',
                    'SOAJS_ENV=dashboard',

                    'SOAJS_DEPLOY_HA=kubernetes',
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
                    "soajs.service.label": "proxy"
                },
                "command": [
                    "node index -T service -X"
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "deployment",
                    "replicas": 2
                },
                "version": "",
                "containerDir": '/opt/soajs/deployer/',
                "restartPolicy": {
                    "condition": "any",
                    "maxAttempts": 5
                },
                "network": "soajsnet",
                "ports": [
                    {
                        "name": "service",
                        "isPublished": false,
                        "target": 4009
                    },
                    {
                        "name": "maintenance",
                        "isPublished": false,
                        "target": 5009
                    },
	                {
		                "name": "published",
		                "isPublished": true,
		                "target": 4044
	                }
                ]
            };

            drivers.deployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    options.params = {
                        "env": "dashboard",
                    };

                    drivers.listServices(options, function(error, service){
                        interData.replicaId = service[0].id;
                        done();
                    });
                }, 10000);
            });
        });

        //Failure to deploy service (Deployment exists already)
        it("Fail - service deployment (Deployment exists already)", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "dashboard",
                "name": "proxy",
                "image": imagePrefix + "/soajs",
                "variables": [
                    'NODE_ENV=production',
                    'SOAJS_ENV=dashboard',

                    'SOAJS_DEPLOY_HA=kubernetes',
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
                    "soajs.service.label": "proxy"
                },
                "cmd": [
                    "bash",
                    "-c",
                    './soajsDeployer.sh -T service -X deploy -L'
                ],
                "memoryLimit": 200000000,
                "replication": {
                    "mode": "deployment",
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
                    {
                        "name": "service",
                        "isPublished": false,
                        "target": 4003
                    },
                    {
                        "name": "maintenance",
                        "isPublished": false,
                        "target": 5003
                    }
                ]
            };
            drivers.deployService(options, function(error, service){
                assert.equal(error.code, 525);
                assert.equal(error.msg, "Unable to create the kubernetes service");
                assert.ok(error);
                done();
            });
        });

        //Failure in scaling a deployed service
        it("Fail - Scale service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing",
                "replica": "nothing"
            };

            drivers.scaleService(options, function(error, service){
                assert.equal(error.code, 536);
                assert.equal(error.msg, "Unable to retrieve the kubernetes service deployment");
                assert.ok(error);
                done();
            });
        });

        //Success in scaling a deployed service
        it("Success - Scale service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.replicaId,
                "scale": 3
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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing",
                "mode": "deployment",
                "action": "redeploy"
            };

            drivers.redeployService(options, function(error, service){
                assert.equal(error.code, 536);
                assert.equal(error.msg, "Unable to retrieve the kubernetes service deployment");
                assert.ok(error);
                done();
            });
        });

        //Success in redeploying a deployed service 1
        it("Success - redeploy service 1", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.id,
                "mode": "deployment",
                "action": "redeploy"
            };

            drivers.redeployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

	    //Success in redeploying a deployed service 2
	    it("Success - redeploy service 2", function(done){
		    options.deployerConfig.namespace = {
			    "default": "soajs-test",
			    "perService": false
		    };

		    options.params = {
			    "id": interData.globalId,
			    "name": "testdeploymentglobalmode",
			    "mode": "daemonset",
			    "action": "rebuild",
			    "labels": {
				    "soajs.content": "true",
				    "soajs.env.code": "dev",
				    "soajs.service.name": "testdeploymentglobalmode",
				    "soajs.service.version": "2",
				    "soajs.service.label": "testdeploymentglobalmode"
			    },
			    "newBuild": {
				    "labels": {
					    "soajs.content": "true",
					    "soajs.env.code": "dev",
					    "soajs.service.name": "testdeploymentglobalmode",
					    "soajs.service.version": "2",
					    "soajs.service.label": "testdeploymentglobalmode"
				    },
				    "image": "alpine",
			    	"variables": [
					    "testVar=$SOAJS_DEPLOY_HA"
				    ],
				    "ports": [
					    {
						    "name": "service",
						    "isPublished": false,
						    "target": 4004
					    },
					    {
						    "name": "maintenance",
						    "isPublished": false,
						    "target": 5004
					    },
					    {
						    "name": "published",
						    "isPublished": true,
						    "target": 4044
					    }
				    ],
				    "cpuLimit": "100m",
				    "memoryLimit": 1000000,
				    "voluming": {
					    "volumes": [
						    {
							    "name": "soajs-log-volume-test",
							    "hostPath": {
								    "path": "/var/log/soajstest"
							    }
						    }
					    ],
					    "volumeMounts": [
						    {
							    "mountPath": "/var/log/soajstest",
							    "name": "soajs-log-volume-test",
						    }
					    ]
				    }
			    }
		    };

		    drivers.redeployService(options, function(error, service){
			    assert.ok(service);
			    setTimeout(function () {
				    done();
			    }, 2000);
		    });
	    });

        //Success in rebuilding a deployed service with UI
        it("Success - rebuilding a service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.id,
                "mode": "deployment",
                "action": "rebuild",
                "newBuild": {
                    "env": "dev2",
                    "name": "servicetobemanipulated",
                    "image": "alpine",
                    "variables": [
                        "Dummy_Variable=variable",
                    ],
                    "labels": {
                        "soajs.content": "true",
                        "soajs.env.code": "dev2",
                        "soajs.service.name": "servicetobemanipulated",
                        "soajs.service.version": "2",
                        "soajs.service.label": "servicetobemanipulated"
                    },
                    "command": [
                        "sh"
                    ],
                    "args": [
                        "-c",
                        "sleep 3600"
                    ],
                    "memoryLimit": 200000000,
                    "replication": {
                        "mode": "deployment",
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
                            "name": "service",
                            "isPublished": false,
                            "target": 4004
                        },
                        {
                            "name": "maintenance",
                            "isPublished": false,
                            "target": 5004
                        }
                    ]
                }
            };

            drivers.redeployService(options, function(error, service){
                assert.ok(service);
                setTimeout(function () {
                    done();
                }, 2000);
            });
        });

        //Failure in deleting a deployed service
        it("Fail - delete service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing",
                "replica": "nothing",
                "mode": "daemonset",
            };

            drivers.deleteService(options, function(error, service){
                assert.equal(error.code, 536);
                assert.ok(error);
                done();
            });
        });

        //Success in deleting a deployed replicated service
        it("Success - delete replicated service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "mode": "deployment",
                "id": interData.id
            };

            drivers.deleteService(options, function(error, service){
                assert.ok(service);
                done();
            });
        });

        //Success in deleting a deployed global service
        it("Success - delete global service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs-test",
                "perService": false
            };

            options.params = {
                "mode": "daemonset",
                "id": interData.globalId
            };

            drivers.deleteService(options, function(error, service){
                assert.ok(service);
                done();
            });
        });
    });

    //Test the different scenarios of finding/listing/inspection docker swarm services
    describe("Testing kubernetes service finding/listing/inspection", function(){
        //Finding a service that does exist
        it("Success - finding service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "nothing",
                "serviceName": "nothing",
                "version": "nothing"
            };

            drivers.findService(options, function(error, service){
                assert.equal(error.code, '657');
                assert.equal(error.msg, 'Could not find a Kubernetes deployment for the specified environment');
                done();
            });
        });

        //Listing services of an environment that does exist
        it("Success - listing services", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "dashboard"
            };
            drivers.inspectService(options, function(error, service){
                assert.ok(error);
                assert.equal(error.code, '536');
                assert.equal(error.msg, 'Unable to retrieve the kubernetes service deployment');
                done();
            });
        });

        //Inspecting a service that does exist
        it("Success - inspecting service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "nothing",
                "serviceName": "nothing"
            };

            drivers.getLatestVersion(options, function(error, serviceVersion){
                assert.ok(error)
                assert.equal(error.code, '657');
                assert.equal(error.msg, "Could not find a Kubernetes deployment for the specified environment");
                done();
            });
        });

        //Getting the service host of a service that does exists
        it("Success - Getting the service host of a service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "dashboard",
                "serviceName": "proxy",
                "version": "1"
            };

            drivers.getServiceHost(options, function(error, serviceHost){
                assert.ok(serviceHost);
                done();
            });
        });

        //Getting the service host of a service that does not exists
        it("Fail - Getting the service host of a service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "env": "nothing",
                "serviceName": "nothing"
            };

            drivers.getLatestVersion(options, function(error, serviceHost){
                assert.ok(error)
                assert.equal(error.code, '657');
                assert.equal(error.msg, "Could not find a Kubernetes deployment for the specified environment");
                done();
            });
        });
    });

	//Test the different scenarios of finding/listing/inspection docker swarm services
	describe("Testing kubernetes service finding/listing/inspection", function(){

		it("Success - create Autoscaler", function(done){

			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			//options.env = "dev2";
			options.params = {
				id: interData.replicaId,
				type: 'deployment',
				min: 1,
				max: 3,
				metrics: {
					cpu: {
						percent: 50
					}
				}
			};
			drivers.createAutoscaler(options, function (error, task) {
				assert.ok(task);
				done();
			});
		});

		it("Success - get Autoscaler", function(done){

			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				id: interData.replicaId
			};
			drivers.getAutoscaler(options, function (error, task) {
				assert.ok(task);
				done();
			});
		});

		it("Success - update Autoscaler", function(done){

			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			//options.env = "dev2";
			options.params = {
				id: interData.replicaId,
				type: 'deployment',
				min: 1,
				max: 3,
				metrics: {
					cpu: {
						percent: 60
					}
				}
			};
			drivers.updateAutoscaler(options, function (error, task) {
				assert.ok(task);
				done();
			});
		});

		//Inspecting a service with autoscale
		it("Success - inpsecting service", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};

			options.params = {
				"id": interData.replicaId
			};
			drivers.inspectService(options, function(error, service){
				assert.ok(service);
				done();
			});
		});

		//Managing Resources get with out  template
		it("Success - managing Resource - get", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'get',
				"resource": 'heapster'
			};
			drivers.manageResources(options, function(error, service){
				template = service;
				assert.ok(service);
				done();
			});
		});

        //Managing Resources get resource that is not per namespace
		it("Success - managing Resource - get - resource is not per namespace", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'get',
				"resource": 'metrics-server'
			};
			drivers.manageResources(options, function(error, service){
				assert.ok(service);
				done();
			});
		});

        //Managing Resources get resource that is not per namespace
		it.skip("Success - managing Resource - delete - resource is not per namespace", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'delete',
				"resource": 'heapster'
			};
			drivers.manageResources(options, function(error, output){
				assert.ok(output);
				done();
			});
		});

		//Managing Resources get with template
		it("Success - managing Resource - get - with template", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'get',
				"resource": 'heapster',
				"templates": template
			};
			drivers.manageResources(options, function(error, service){
				assert.ok(service);
				done();
			});
		});


		it("Success - managing Resource - delete", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'delete',
				"resource": 'heapster',
				"id": interData.replicaId
			};
			drivers.manageResources(options, function(error, service){
				assert.ok(service);
				done();
			});
		});

        //Managing Resources get resource that does not exist
		it("Fail - managing Resource - invalid resource name passed", function(done){
			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			options.params = {
				action : 'get',
				"resource": 'invalid-resource'
			};
			drivers.manageResources(options, function(error, service){
				assert.ok(error);
                assert.equal(error.code, 681);
				done();
			});
		});

		it("Success - delete Autoscaler", function(done){

			options.deployerConfig.namespace = {
				"default": "soajs",
				"perService": false
			};
			//options.env = "dev2";
			options.params = {
				id: interData.replicaId
			};
			drivers.deleteAutoscaler(options, function (error, task) {
				assert.ok(task);
				done();
			});
		});

	});

    //Test the different methods of kubernetes tasks/containers
    describe("Testing kubernetes task operations", function(){
        //Inspecting a task that does not exist
        it("Fail - inspecting task", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "taskId": "nothing"
            };
            drivers.inspectTask(options, function(error, task){
                assert.ok(error);
                assert.equal(error.code, "656");
                done();
            });
        });

        //Inspecting a task that does exist
        it("Success - inspecting service", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

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
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": "nothing"
            };

            drivers.maintenance(options, function(error, response){
                assert.ok(error);
                assert.equal(error.code, "657");
                done();
            });
        });

        //Performing a maintenance operation of a container that does exist
        it("Success - maintenance operation", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "id": interData.replicaId,
                "maintenancePort": 5009,
                "operation": "reloadRegistry"
            };

            drivers.maintenance(options, function(error, response){
                assert.ok(response);
                done();
            });
        });

        //getting the logs of a container that does not exist
        it("Fail - get container logs", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "taskId": "nothing"
            };
            drivers.getContainerLogs(options, function(error, logs){
                assert.equal(error.code, "656");
                assert.equal(error.msg, "Unable to inspect the specified pod");
                assert.ok(error);
                done();
            });
        });

        //Getting the logs of a container that does exist
        it("Success - get container logs", function(done){
            options.deployerConfig.namespace = {
                "default": "soajs",
                "perService": false
            };

            options.params = {
                "taskId": interData.taskId
            };
            options.driver = "kubernetes.local";
            drivers.getContainerLogs(options, function(error, logs){
                done();
            });
        });


    });

	describe("Testing kubernetes metrics", function() {

		it("success - will get service metrics", function(done) {
			options.params = {};
            setTimeout(function() {
                getMetrics(0, function(error, metrics) {
                    assert.ifError(error);
    				assert.ok(metrics);
    				done();
                });
            }, 5000);

            //metrics may take some time to be available
            function getMetrics(counter, cb) {
                drivers.getServicesMetrics(options, function(error, metrics) {
    				assert.ifError(error);

                    if(metrics && Object.keys(metrics).length > 0) {
						return cb(null, metrics);
					}
					else {
						counter++;
						if(counter < 110) {
							setTimeout(function() {
								return getMetrics(counter, cb);
							}, 1000);
						}
						else {
							return cb(null, {});
						}
					}
    			});
            }
		});

        it("success - will get node metrics", function(done) {
			options.params = {};
            setTimeout(function() {
                getMetrics(0, function(error, metrics) {
                    assert.ifError(error);
    				assert.ok(metrics);
    				done();
                });
            }, 5000);

            //metrics may take some time to be available
            function getMetrics(counter, cb) {
                drivers.getNodesMetrics(options, function(error, metrics) {
    				assert.ifError(error);

                    if(metrics && Object.keys(metrics).length > 0) {
						return cb(null, metrics);
					}
					else {
						counter++;
						if(counter < 110) {
							setTimeout(function() {
								return getMetrics(counter, cb);
							}, 1000);
						}
						else {
							return cb(null, {});
						}
					}
    			});
            }
		});

	});
});
