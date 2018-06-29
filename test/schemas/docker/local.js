'use strict';
let infra = {
	"_id": "5b044a4df920c675412f82e3",
	"api": {
		"ipaddress": "192.168.61.51",
		"token": "",
		"network": "soajsnet",
		"port": 443,
		"protocol": "https"
	},
	"name": "local",
	"technologies": [
		"docker"
	],
	"templates": null,
	"label": "Local Docker Machine",
	"deployments": [
		{
			"technology": "docker",
			"options": {
				"zone": "local"
			},
			"environments": [
				"BLOOOOM"
			],
			"loadBalancers": {},
			"name": "htlocal091o3vvyh3z82",
			"id": "htlocal091o3vvyh3z82"
		}
	],
	"info": [
		[
			{
				"technology": "docker",
				"options": {
					"zone": "local"
				},
				"environments": [
					"BLOOOOM"
				],
				"loadBalancers": {},
				"name": "htlocal091o3vvyh3z82",
				"id": "htlocal091o3vvyh3z82"
			}
		],
		[
			{
				"code": "BLOOOOM"
			}
		],
		0
	],
	"stack": {
		"technology": "docker",
		"options": {
			"zone": "local"
		},
		"environments": [
			"BLOOOOM"
		],
		"loadBalancers": {},
		"name": "htlocal091o3vvyh3z82",
		"id": "htlocal091o3vvyh3z82"
	}
};
let registry = {
	"_id": "5b05a55220957fbc7ac752cc",
	"code": "BLOOOOM",
	"description": "werwerw",
	"sensitive": false,
	"domain": "loolper.com",
	"profile": "/opt/soajs/FILES/profiles/profile.js",
	"sitePrefix": "site",
	"apiPrefix": "api",
	"dbs": {
		"config": {
			"prefix": ""
		},
		"databases": {}
	},
	"deployer": {
		"manual": {
			"nodes": ""
		},
		"container": {
			"docker": {
				"local": {
					"socketPath": "/var/run/docker.sock"
				},
				"remote": {
					"apiPort": 443,
					"nodes": "192.168.61.51",
					"apiProtocol": "https",
					"auth": {
						"token": "78954f458f5ec9aaafa45d4322e4302126570585b7ec997584005d8113cb4358b4f7c18a00dd5663727453d45dc7447473c4a9008ba2c1dfc8754df249e05bee41d063f091f283ec36714542fb97725117211fe99da2a81c365dba5290c112c06e4182f661bafe9ba1ff6f12d06110452887a72077f65f4a44431d34478387d48969e1a62da6642390e4c80b444ccbe530459b6f6115d1297de481884b0b7d462f18e70cf8109f75f07b842baa1ee1413c5d6adb2c10173d2d16cc69c525d73b2b9c354a8553d5c86d51bb0abe474458a3562aae8fc648ed4daafa577f72a37aa30a43656a0f1216ea06eeb020e8ba7965f13743bd51b5b415b7506621254ca33f509a5cb6203d6a95202efbd3c5ff2f995af0e428fcef5330e75ae26311b90cc20884145afcab1623713278b2d104541b18d552e2ee67c5b19fafbd8c4830a42e0b5c2abad381ddb0343c9eb70f0575527cfec01efd0baf5bf1d45dfbc99309cbe4923630323ef284ce8c0d94d611c55768209dca646c6f4128ee9d020c266b7fee37081e2a18bdda1dbf2bb16cf599ebaf5a9ad2518e1faf8f0221fa1386298e38390e46ff5d24ca7d49fdbc8dc7c0861d5a8ea57c524abadd2b7d20da8cf9f9ae29c1c70ca85a64f38cc7bee548e3a5d9cbce7d04c076a58849cbe4fb1f0d37270cffdcacd61fe617ed3369ebb995f11a54fc8b097de35ecdba834c2df5eb"
					}
				}
			},
			"kubernetes": {
				"local": {
					"nodes": "",
					"namespace": {
						"default": "soajs",
						"perService": false
					},
					"auth": {
						"token": ""
					}
				},
				"remote": {
					"nodes": "",
					"namespace": {
						"default": "soajs",
						"perService": false
					},
					"auth": {
						"token": ""
					}
				}
			}
		},
		"type": "container",
		"selected": "container.docker.remote"
	},
	"services": {
		"controller": {
			"maxPoolSize": 100,
			"authorization": true,
			"requestTimeout": 30,
			"requestTimeoutRenewal": 0
		},
		"config": {
			"awareness": {
				"cacheTTL": 3600000,
				"healthCheckInterval": 5000,
				"autoRelaodRegistry": 3600000,
				"maxLogCount": 5,
				"autoRegisterService": true
			},
			"agent": {
				"topologyDir": "/opt/soajs/"
			},
			"key": {
				"algorithm": "aes256",
				"password": "weqerw"
			},
			"logger": {
				"src": true,
				"level": "debug",
				"formatter": {
					"levelInString": true,
					"outputMode": "long"
				}
			},
			"cors": {
				"enabled": true,
				"origin": "*",
				"credentials": "true",
				"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
				"headers": "key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization",
				"maxage": 1728000
			},
			"oauth": {
				"grants": [
					"password",
					"refresh_token"
				],
				"debug": false,
				"accessTokenLifetime": 7200,
				"refreshTokenLifetime": 1209600
			},
			"ports": {
				"controller": 4000,
				"maintenanceInc": 1000,
				"randomInc": 100
			},
			"cookie": {
				"secret": "SJ9IrXXyX"
			},
			"session": {
				"name": "SJxc8rmQJ7",
				"secret": "By_q8rXQyX",
				"cookie": {
					"path": "/",
					"httpOnly": true,
					"secure": false,
					"maxAge": null
				},
				"resave": false,
				"saveUninitialized": false,
				"rolling": false,
				"unset": "keep"
			}
		}
	},
	"port": 32773,
	"protocol": "http"
};
let soajs = {
	"log": {
		"error": (data) => {
			return data;
		},
		"warn": (data) => {
			return data;
		},
		"info": (data) => {
			return data;
		},
		"debug": (data) => {
			return data;
		}
	},
	registry: registry,
	validator: require('jsonschema'),
};
module.exports = function () {
	let data = {
		'deployer': {
			"strategy": "docker",
			"driver": "docker.remote",
			"env": "docker",
			"deployerConfig": {
				"apiPort": 443,
				"nodes": "192.168.61.51",
				"apiProtocol": "https",
				"auth": {
					"token": "1"
				}
			},
			"model": {},
			"infra": {
				"_id": "5b044a4df920c675412f82e3",
				"api": {
					"ipaddress": "192.168.61.51",
					"token": "",
					"network": "soajsnet",
					"port": 443,
					"protocol": "https"
				},
				"name": "local",
				"technologies": [
					"docker"
				],
				"templates": null,
				"label": "Local Docker Machine",
				"deployments": [{
					"technology": "docker",
					"options": {
						"zone": "local"
					},
					"environments": [
						"DOCKER"
					],
					"loadBalancers": {},
					"name": "htlocal42vkx8l4o1fim",
					"id": "htlocal42vkx8l4o1fim"
				}
				],
				"stack": ""
			},
			"params": {
				"env": "docker"
			},
			"soajs": soajs
		},
		'serviceList': [
			{
				"ID": "2z3amlp3y2gg67f83rfrrznf9",
				"Version": {
					"Index": 295
				},
				"CreatedAt": "2018-05-23T17:31:01.705795919Z",
				"UpdatedAt": "2018-05-25T07:56:58.683791961Z",
				"Spec": {
					"Name": "bloooom-controller",
					"Labels": {
						"memoryLimit": "500",
						"service.branch": "master",
						"service.commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
						"service.image.name": "soajs",
						"service.image.prefix": "soajsorg",
						"service.image.tag": "latest",
						"service.image.ts": "1522243952636",
						"service.owner": "soajs",
						"service.repo": "soajs.controller",
						"soajs.catalog.id": "5ad9cab35c967d35b8710658",
						"soajs.content": "true",
						"soajs.env.code": "bloooom",
						"soajs.service.group": "soajs-core-services",
						"soajs.service.label": "bloooom-controller",
						"soajs.service.mode": "replicated",
						"soajs.service.name": "controller",
						"soajs.service.replicas": "1",
						"soajs.service.repo.name": "soajs-controller",
						"soajs.service.subtype": "soajs",
						"soajs.service.type": "service",
						"soajs.service.version": "1"
					},
					"TaskTemplate": {
						"ContainerSpec": {
							"Image": "soajsorg/soajs:latest",
							"Command": [
								"bash"
							],
							"Args": [
								"-c",
								"node index.js -T service"
							],
							"Env": [
								"NODE_TLS_REJECT_UNAUTHORIZED=0",
								"NODE_ENV=production",
								"SOAJS_ENV=bloooom",
								"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js",
								"SOAJS_SRV_AUTOREGISTERHOST=true",
								"SOAJS_SRV_MEMORY=500",
								"SOAJS_DEPLOY_HA=swarm",
								"SOAJS_HA_NAME={{.Task.Name}}",
								"SOAJS_MONGO_NB=1",
								"SOAJS_MONGO_PREFIX=local_",
								"SOAJS_MONGO_IP_1=192.168.61.51",
								"SOAJS_MONGO_PORT_1=27017",
								"SOAJS_GIT_PROVIDER=github",
								"SOAJS_GIT_DOMAIN=github.com",
								"SOAJS_GIT_OWNER=soajs",
								"SOAJS_GIT_REPO=soajs.controller",
								"SOAJS_GIT_BRANCH=master",
								"SOAJS_GIT_COMMIT="
							],
							"Dir": "/opt/soajs/deployer/",
							"Secrets": [
								{
									"File": {
										"Name": "mountPath",
										"UID": "0",
										"GID": "0",
										"Mode": 644
									},
									"SecretID": "f6xlz2x8ysma2vu5qft8v3cp1",
									"SecretName": "test-secret-1"
								}
							],
							"Mounts": [
								{
									"Type": "volume",
									"Source": "soajs_log_volume",
									"Target": "/var/log/soajs/"
								},
								{
									"Type": "bind",
									"Source": "/var/run/docker.sock",
									"Target": "/var/run/docker.sock",
									"ReadOnly": true
								},
								{
									"Type": "volume",
									"Source": "soajs_certs_volume",
									"Target": "/var/certs/soajs/"
								}
							],
							"Isolation": "default"
						},
						"Resources": {
							"Limits": {
								"MemoryBytes": 524288000
							}
						},
						"RestartPolicy": {
							"Condition": "any",
							"MaxAttempts": 5
						},
						"ForceUpdate": 0,
						"Runtime": "container"
					},
					"Mode": {
						"Replicated": {
							"Replicas": 1
						}
					},
					"UpdateConfig": {
						"Parallelism": 2,
						"Delay": 500,
						"FailureAction": "pause",
						"MaxFailureRatio": 0,
						"Order": "stop-first"
					},
					"Networks": [
						{
							"Target": "ifaxhwl3dy2ymt3cebxbufnaq"
						}
					],
					"EndpointSpec": {
						"Mode": "vip"
					}
				},
				"Endpoint": {
					"Spec": {
						"Mode": "vip"
					},
					"VirtualIPs": [
						{
							"NetworkID": "ifaxhwl3dy2ymt3cebxbufnaq",
							"Addr": "10.0.0.36/24"
						}
					]
				}
			}],
		'servicesTasks': [
			{
				"ID": "kryfpx1uuj33t4z31mvkzvjod",
				"Version": {
					"Index": 313
				},
				"CreatedAt": "2018-05-25T07:56:59.8027991Z",
				"UpdatedAt": "2018-05-25T07:57:06.240972258Z",
				"Labels": {},
				"Spec": {
					"ContainerSpec": {
						"Image": "soajsorg/soajs:latest",
						"Command": [
							"bash"
						],
						"Args": [
							"-c",
							"node index.js -T service"
						],
						"Env": [
							"NODE_TLS_REJECT_UNAUTHORIZED=0",
							"NODE_ENV=production",
							"SOAJS_ENV=bloooom",
							"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js",
							"SOAJS_SRV_AUTOREGISTERHOST=true",
							"SOAJS_SRV_MEMORY=500",
							"SOAJS_DEPLOY_HA=swarm",
							"SOAJS_HA_NAME={{.Task.Name}}",
							"SOAJS_MONGO_NB=1",
							"SOAJS_MONGO_PREFIX=local_",
							"SOAJS_MONGO_IP_1=192.168.61.51",
							"SOAJS_MONGO_PORT_1=27017",
							"SOAJS_GIT_PROVIDER=github",
							"SOAJS_GIT_DOMAIN=github.com",
							"SOAJS_GIT_OWNER=soajs",
							"SOAJS_GIT_REPO=soajs.controller",
							"SOAJS_GIT_BRANCH=master",
							"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8"
						],
						"Dir": "/opt/soajs/deployer/",
						"Mounts": [
							{
								"Type": "volume",
								"Source": "soajs_log_volume",
								"Target": "/var/log/soajs/"
							},
							{
								"Type": "bind",
								"Source": "/var/run/docker.sock",
								"Target": "/var/run/docker.sock",
								"ReadOnly": true
							},
							{
								"Type": "volume",
								"Source": "soajs_certs_volume",
								"Target": "/var/certs/soajs/"
							}
						],
						"Isolation": "default"
					},
					"Resources": {
						"Limits": {
							"MemoryBytes": 524288000
						}
					},
					"RestartPolicy": {
						"Condition": "any",
						"MaxAttempts": 5
					},
					"ForceUpdate": 0
				},
				"ServiceID": "2z3amlp3y2gg67f83rfrrznf9",
				"Slot": 1,
				"NodeID": "mwdhuz0wfj6e9d40175g8kpge",
				"Status": {
					"Timestamp": "2018-05-25T07:57:06.229273186Z",
					"State": "running",
					"Message": "started",
					"ContainerStatus": {
						"ContainerID": "640158f719bebc0044016d9e53f2f30697888debc0961de4f9e73419f8b8c743",
						"PID": 4692,
						"ExitCode": 0
					},
					"PortStatus": {
						"Ports": [{
							"TargetPort": 27017
						}]
					}
				},
				"DesiredState": "running",
				"NetworksAttachments": [
					{
						"Network": {
							"ID": "ifaxhwl3dy2ymt3cebxbufnaq",
							"Version": {
								"Index": 293
							},
							"CreatedAt": "2018-05-22T16:50:21.594817178Z",
							"UpdatedAt": "2018-05-25T07:56:58.681817847Z",
							"Spec": {
								"Name": "soajsnet",
								"Labels": {},
								"DriverConfiguration": {
									"Name": "overlay"
								},
								"Attachable": true,
								"IPAMOptions": {
									"Driver": {
										"Name": "default"
									}
								},
								"Scope": "swarm"
							},
							"DriverState": {
								"Name": "overlay",
								"Options": {
									"com.docker.network.driver.overlay.vxlanid_list": "4097"
								}
							},
							"IPAMOptions": {
								"Driver": {
									"Name": "default"
								},
								"Configs": [
									{
										"Subnet": "10.0.0.0/24",
										"Gateway": "10.0.0.1"
									}
								]
							}
						},
						"Addresses": [
							"10.0.0.4/24"
						]
					}
				]
			}
		],
		'constrollerDeploy': {
			"strategy": "docker",
			"driver": "docker.local",
			"env": "bloooom",
			"deployerConfig": {
				"apiPort": 443,
				"nodes": "192.168.61.51",
				"apiProtocol": "https",
				"auth": {
					"token": ""
				}
			},
			"soajs": soajs,
			"params": {
				"data": {
					"variables": {
						"$SOAJS_NX_DOMAIN": "loolper.com",
						"$SOAJS_NX_SITE_DOMAIN": "site.loolper.com",
						"$SOAJS_NX_API_DOMAIN": "api.loolper.com",
						"$SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",
						"$SOAJS_EXTKEY": "",
						"$SOAJS_MONGO_NB": 1,
						"$SOAJS_MONGO_IP_1": "192.168.61.51",
						"$SOAJS_MONGO_PORT_1": 27017,
						"$SOAJS_MONGO_PREFIX": "local_",
						"$SOAJS_GIT_PROVIDER": "github",
						"$SOAJS_GIT_DOMAIN": "github.com",
						"$SOAJS_GIT_OWNER": "soajs",
						"$SOAJS_GIT_REPO": "soajs.controller",
						"$SOAJS_GIT_BRANCH": "master",
						"$SOAJS_GIT_COMMIT": "",
						"$SOAJS_SRV_PORT": 4000,
						"$SOAJS_SRV_PORT_MAINTENANCE": 5000
					},
					"serviceName": "controller",
					"serviceGroup": "SOAJS Core Services",
					"name": "bloooom-controller"
				},
				"catalog": {
					"_id": "5ad9cab35c967d35b8710658",
					"name": "SOAJS API Gateway Recipe",
					"type": "service",
					"subtype": "soajs",
					"description": "This recipe allows you to deploy the SOAJS API Gateway",
					"locked": true,
					"recipe": {
						"deployOptions": {
							"image": {
								"prefix": "soajsorg",
								"name": "soajs",
								"tag": "latest",
								"pullPolicy": "IfNotPresent"
							},
							"sourceCode": {},
							"readinessProbe": {
								"httpGet": {
									"path": "/heartbeat",
									"port": "maintenance"
								},
								"initialDelaySeconds": 5,
								"timeoutSeconds": 2,
								"periodSeconds": 5,
								"successThreshold": 1,
								"failureThreshold": 3
							},
							"restartPolicy": {
								"condition": "any",
								"maxAttempts": 5
							},
							"container": {
								"network": "soajsnet",
								"workingDir": "/opt/soajs/deployer/"
							},
							"certificates": 'maybe',
							"ports": [
								{
									"name": "http",
									"target": 80
								},
								{
									"name": "https",
									"target": 443
								},
								{
									"name": "maintenance",
									"isPublished": false,
									"target": 4000
								}
							],
							"voluming": [
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "soajs_log_volume",
											"Target": "/var/log/soajs/"
										}
									},
									"kubernetes": {
										"volume": {
											"name": "soajs-log-volume",
											"hostPath": {
												"path": "/var/log/soajs/"
											}
										},
										"volumeMount": {
											"mountPath": "/var/log/soajs/",
											"name": "soajs-log-volume"
										}
									}
								},
								{
									"docker": {
										"volume": {
											"Type": "bind",
											"ReadOnly": true,
											"Source": "/var/run/docker.sock",
											"Target": "/var/run/docker.sock"
										}
									}
								},
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "soajs_certs_volume",
											"Target": "/var/certs/soajs/"
										}
									}
								}
							]
						},
						"buildOptions": {
							"settings": {
								"accelerateDeployment": true
							},
							"env": {
								"NODE_TLS_REJECT_UNAUTHORIZED": {
									"type": "static",
									"value": "0"
								},
								"NODE_ENV": {
									"type": "static",
									"value": "production"
								},
								"SOAJS_ENV": {
									"type": "computed",
									"value": "$SOAJS_ENV"
								},
								"SOAJS_PROFILE": {
									"type": "static",
									"value": "/opt/soajs/FILES/profiles/profile.js"
								},
								"SOAJS_SRV_AUTOREGISTERHOST": {
									"type": "static",
									"value": "true"
								},
								"SOAJS_SRV_MEMORY": {
									"type": "computed",
									"value": "$SOAJS_SRV_MEMORY"
								},
								"SOAJS_SRV_MAIN": {
									"type": "computed",
									"value": "$SOAJS_SRV_MAIN"
								},
								"SOAJS_DEPLOY_HA": {
									"type": "computed",
									"value": "$SOAJS_DEPLOY_HA"
								},
								"SOAJS_HA_NAME": {
									"type": "computed",
									"value": "$SOAJS_HA_NAME"
								},
								"SOAJS_MONGO_NB": {
									"type": "computed",
									"value": "$SOAJS_MONGO_NB"
								},
								"SOAJS_MONGO_PREFIX": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PREFIX"
								},
								"SOAJS_MONGO_RSNAME": {
									"type": "computed",
									"value": "$SOAJS_MONGO_RSNAME"
								},
								"SOAJS_MONGO_AUTH_DB": {
									"type": "computed",
									"value": "$SOAJS_MONGO_AUTH_DB"
								},
								"SOAJS_MONGO_SSL": {
									"type": "computed",
									"value": "$SOAJS_MONGO_SSL"
								},
								"SOAJS_MONGO_IP": {
									"type": "computed",
									"value": "$SOAJS_MONGO_IP_N"
								},
								"SOAJS_MONGO_PORT": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PORT_N"
								},
								"SOAJS_MONGO_USERNAME": {
									"type": "computed",
									"value": "$SOAJS_MONGO_USERNAME"
								},
								"SOAJS_MONGO_PASSWORD": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PASSWORD"
								},
								"SOAJS_GIT_PROVIDER": {
									"type": "computed",
									"value": "$SOAJS_GIT_PROVIDER"
								},
								"SOAJS_GIT_DOMAIN": {
									"type": "computed",
									"value": "$SOAJS_GIT_DOMAIN"
								},
								"SOAJS_GIT_OWNER": {
									"type": "computed",
									"value": "$SOAJS_GIT_OWNER"
								},
								"SOAJS_GIT_REPO": {
									"type": "computed",
									"value": "$SOAJS_GIT_REPO"
								},
								"SOAJS_GIT_BRANCH": {
									"type": "computed",
									"value": "$SOAJS_GIT_BRANCH"
								},
								"SOAJS_GIT_COMMIT": {
									"type": "computed",
									"value": "$SOAJS_GIT_COMMIT"
								},
								"SOAJS_NX_CONTROLLER_NB": {
									"type": "computed",
									"value": "$SOAJS_NX_CONTROLLER_NB"
								},
								"SOAJS_NX_CONTROLLER_IP": {
									"type": "computed",
									"value": "$SOAJS_NX_CONTROLLER_IP_N"
								},
								"SOAJS_NX_CONTROLLER_PORT": {
									"type": "computed",
									"value": "$SOAJS_NX_CONTROLLER_PORT"
								}
							},
							"cmd": {
								"deploy": {
									"command": [
										"bash"
									],
									"args": [
										"-c",
										"node index.js -T service"
									]
								}
							}
						}
					}
				},
				"inputmaskData": {
					"env": "BLOOOOM",
					"recipe": "5ad9cab35c967d35b8710658",
					"gitSource": {
						"owner": "soajs",
						"repo": "soajs.controller",
						"branch": "master",
						"commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8"
					},
					"deployConfig": {
						"replication": {
							"mode": "replicated",
							"replicas": 1
						},
						"memoryLimit": 524288000
					},
					"custom": {
						"name": "controller",
						"type": "service",
						"ports": [
							{
								"name": "http",
								"target": 80
							},
							{
								"name": "https",
								"target": 443
							},
							{
								"name": "maintenance",
								"isPublished": false,
								"target": 4000
							}
						],
						"secrets": [{
							"id": "!231",
							"name": "test-secret-1",
							"mountPath": "secretPath",
							"type": 'certificate'
						}],
						"sourceCode": {},
						"version": 1
					}
				},
				"action": "deploy"
			},
			"infra": infra
		},
		'controllerRedeploy': {
			"strategy": "docker",
			"driver": "docker.remote",
			"env": "bloooom",
			"deployerConfig": {
				"apiPort": 443,
				"nodes": "192.168.61.51",
				"apiProtocol": "https",
				"auth": {
					"token": ""
				}
			},
			"soajs": soajs,
			"params": {
				"data": {
					"variables": {
						"$SOAJS_NX_DOMAIN": "loolper.com",
						"$SOAJS_NX_SITE_DOMAIN": "site.loolper.com",
						"$SOAJS_NX_API_DOMAIN": "api.loolper.com",
						"$SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",
						"$SOAJS_EXTKEY": "9b96ba56ce934ded56c3f21ac9bdaddc8ba4782b7753cf07576bfabcace8632eba1749ff1187239ef1f56dd74377aa1e5d0a1113de2ed18368af4b808ad245bc7da986e101caddb7b75992b14d6a866db884ea8aee5ab02786886ecf9f25e974",
						"$SOAJS_MONGO_NB": 1,
						"$SOAJS_MONGO_IP_1": "192.168.61.51",
						"$SOAJS_MONGO_PORT_1": 27017,
						"$SOAJS_MONGO_PREFIX": "local_",
						"$SOAJS_SRV_PORT": 4000,
						"$SOAJS_SRV_PORT_MAINTENANCE": 5000,
						"$SOAJS_GIT_PROVIDER": "github",
						"$SOAJS_GIT_DOMAIN": "github.com",
						"$SOAJS_GIT_OWNER": "soajs",
						"$SOAJS_GIT_REPO": "soajs.controller",
						"$SOAJS_GIT_BRANCH": "master",
						"$SOAJS_GIT_COMMIT": "468588b0a89e55020f26b805be0ff02e0f31a7d8"
					},
					"serviceName": "controller",
					"serviceGroup": "SOAJS Core Services",
					"name": "bloooom-controller"
				},
				"catalog": {
					"_id": "5ad9cab35c967d35b8710658",
					"name": "SOAJS API Gateway Recipe",
					"type": "service",
					"subtype": "soajs",
					"description": "This recipe allows you to deploy the SOAJS API Gateway",
					"locked": true,
					"recipe": {
						"deployOptions": {
							"image": {
								"prefix": "soajsorg",
								"name": "soajs",
								"tag": "latest",
								"pullPolicy": "IfNotPresent"
							},
							"sourceCode": {},
							"readinessProbe": {
								"httpGet": {
									"path": "/heartbeat",
									"port": "maintenance"
								},
								"initialDelaySeconds": 5,
								"timeoutSeconds": 2,
								"periodSeconds": 5,
								"successThreshold": 1,
								"failureThreshold": 3
							},
							"restartPolicy": {
								"condition": "any",
								"maxAttempts": 5
							},
							"container": {
								"network": "soajsnet",
								"workingDir": "/opt/soajs/deployer/"
							},
							"ports": [
								{
									"name": "http",
									"target": 80
								},
								{
									"name": "https",
									"target": 443,
									"preserveClientIP": true,
									"isPublished": true,
								},
								{
									"name": "maintenance",
									"isPublished": false,
									"target": 4000
								}
							],
							"voluming": [
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "soajs_log_volume",
											"Target": "/var/log/soajs/"
										}
									},
									"kubernetes": {
										"volume": {
											"name": "soajs-log-volume",
											"hostPath": {
												"path": "/var/log/soajs/"
											}
										},
										"volumeMount": {
											"mountPath": "/var/log/soajs/",
											"name": "soajs-log-volume"
										}
									}
								},
								{
									"docker": {
										"volume": {
											"Type": "bind",
											"ReadOnly": true,
											"Source": "/var/run/docker.sock",
											"Target": "/var/run/docker.sock"
										}
									}
								},
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "soajs_certs_volume",
											"Target": "/var/certs/soajs/"
										}
									}
								}
							]
						},
						"buildOptions": {
							"settings": {
								"accelerateDeployment": true
							},
							"env": {
								"NODE_TLS_REJECT_UNAUTHORIZED": {
									"type": "static",
									"value": "0"
								},
								"NODE_ENV": {
									"type": "static",
									"value": "production"
								},
								"SOAJS_ENV": {
									"type": "computed",
									"value": "$SOAJS_ENV"
								},
								"SOAJS_PROFILE": {
									"type": "static",
									"value": "/opt/soajs/FILES/profiles/profile.js"
								},
								"SOAJS_SRV_AUTOREGISTERHOST": {
									"type": "static",
									"value": "true"
								},
								"SOAJS_SRV_MEMORY": {
									"type": "computed",
									"value": "$SOAJS_SRV_MEMORY"
								},
								"SOAJS_SRV_MAIN": {
									"type": "computed",
									"value": "$SOAJS_SRV_MAIN"
								},
								"SOAJS_DEPLOY_HA": {
									"type": "computed",
									"value": "$SOAJS_DEPLOY_HA"
								},
								"SOAJS_HA_NAME": {
									"type": "computed",
									"value": "$SOAJS_HA_NAME"
								},
								"SOAJS_MONGO_NB": {
									"type": "computed",
									"value": "$SOAJS_MONGO_NB"
								},
								"SOAJS_MONGO_PREFIX": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PREFIX"
								},
								"SOAJS_MONGO_RSNAME": {
									"type": "computed",
									"value": "$SOAJS_MONGO_RSNAME"
								},
								"SOAJS_MONGO_AUTH_DB": {
									"type": "computed",
									"value": "$SOAJS_MONGO_AUTH_DB"
								},
								"SOAJS_MONGO_SSL": {
									"type": "computed",
									"value": "$SOAJS_MONGO_SSL"
								},
								"SOAJS_MONGO_IP": {
									"type": "computed",
									"value": "$SOAJS_MONGO_IP_N"
								},
								"SOAJS_MONGO_PORT": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PORT_N"
								},
								"SOAJS_MONGO_USERNAME": {
									"type": "computed",
									"value": "$SOAJS_MONGO_USERNAME"
								},
								"SOAJS_MONGO_PASSWORD": {
									"type": "computed",
									"value": "$SOAJS_MONGO_PASSWORD"
								},
								"SOAJS_GIT_PROVIDER": {
									"type": "computed",
									"value": "$SOAJS_GIT_PROVIDER"
								},
								"SOAJS_GIT_DOMAIN": {
									"type": "computed",
									"value": "$SOAJS_GIT_DOMAIN"
								},
								"SOAJS_GIT_OWNER": {
									"type": "computed",
									"value": "$SOAJS_GIT_OWNER"
								},
								"SOAJS_GIT_REPO": {
									"type": "computed",
									"value": "$SOAJS_GIT_REPO"
								},
								"SOAJS_GIT_BRANCH": {
									"type": "computed",
									"value": "$SOAJS_GIT_BRANCH"
								},
								"SOAJS_GIT_COMMIT": {
									"type": "computed",
									"value": "$SOAJS_GIT_COMMIT"
								}
							},
							"cmd": {
								"deploy": {
									"command": [
										"bash"
									],
									"args": [
										"-c",
										"node index.js -T service"
									]
								}
							}
						}
					}
				},
				"inputmaskData": {
					"env": "BLOOOOM",
					"serviceId": "5aornksipp1ulqs0ojcebamcd",
					"mode": "replicated",
					"action": "rebuild",
					"custom": {
						"image": {},
						"branch": "master",
						"commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
						"name": "controller",
						"type": "service",
						"version": "1",
						"secrets": [{
							"id": "!231",
							"name": "test-secret-1",
							"mountPath": "secretPath"
						}],
						"ports": [
							{
								"name": "http",
								"target": 80
							},
							{
								"name": "https",
								"target": 443,
								"preserveClientIP": true,
								"isPublished": true,
							},
							{
								"name": "maintenance",
								"isPublished": false,
								"target": 4000
							}
						]
					},
					"namespace": "",
					"recipe": "5ad9cab35c967d35b8710658",
					"imageLastTs": "1522243952636",
					"deployConfig": {
						"replication": {
							"mode": "replicated",
							"replicas": 1
						},
						"memoryLimit": 524288000
					},
					"gitSource": {
						"owner": "soajs",
						"repo": "soajs.controller",
						"branch": "master",
						"commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8"
					}
				},
				"action": "rebuild"
			},
			"infra": infra
		},
		'mongoDeploy': {
			"strategy": "docker",
			"driver": "docker.remote",
			"env": "bloooom",
			"deployerConfig": {
				"apiPort": 443,
				"nodes": "192.168.61.51",
				"apiProtocol": "https",
				"auth": {
					"token": ""
				}
			},
			"soajs": soajs,
			"params": {
				"data": {
					"variables": {
						"$SOAJS_EXTKEY": "",
						"$SOAJS_MONGO_NB": 1,
						"$SOAJS_MONGO_IP_1": "192.168.61.51",
						"$SOAJS_MONGO_PORT_1": 27017,
						"$SOAJS_MONGO_PREFIX": "local_"
					}
				},
				"catalog": {
					"_id": "5ad9cab35c967d35b871065c",
					"name": "Mongo Recipe",
					"type": "cluster",
					"subtype": "mongo",
					"description": "This recipe allows you to deploy a mongo server",
					"locked": true,
					"recipe": {
						"deployOptions": {
							"image": {
								"prefix": "",
								"name": "mongo",
								"tag": "3.4.10",
								"pullPolicy": "IfNotPresent"
							},
							"sourceCode": {
								"configuration": {
									"label": "Attach Custom Configuration",
									"repo": "",
									"branch": "",
									"required": false
								}
							},
							"readinessProbe": {
								"httpGet": {
									"path": "/",
									"port": 27017
								},
								"initialDelaySeconds": 5,
								"timeoutSeconds": 2,
								"periodSeconds": 5,
								"successThreshold": 1,
								"failureThreshold": 3
							},
							"restartPolicy": {
								"condition": "any",
								"maxAttempts": 5
							},
							"container": {
								"network": "soajsnet",
								"workingDir": ""
							},
							"voluming": [
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "custom-mongo-volume",
											"Target": "/data/db/"
										}
									},
									"kubernetes": {
										"volume": {
											"name": "custom-mongo-volume",
											"hostPath": {
												"path": "/data/custom/db/"
											}
										},
										"volumeMount": {
											"mountPath": "/data/db/",
											"name": "custom-mongo-volume"
										}
									}
								}
							],
							"ports": [
								{
									"name": "mongo",
									"target": 27017,
									"isPublished": true,
									"published": 2017,
									"preserveClientIP": true
								}
							],
							"certificates": "optional"
						},
						"buildOptions": {
							"env": {},
							"cmd": {
								"deploy": {
									"command": [
										"mongod"
									],
									"args": [
										"--smallfiles"
									]
								}
							}
						}
					}
				},
				"inputmaskData": {
					"env": "BLOOOOM",
					"recipe": "5ad9cab35c967d35b871065c",
					"deployConfig": {
						"type": "container",
						"memoryLimit": 581959680,
						"replication": {
							"mode": "replicated",
							"replicas": 1
						}
					},
					"custom": {
						"name": "mongotest",
						"ports": [
							{
								"name": "mongo",
								"target": 27017,
								"isPublished": true,
								"published": 270
							}
						],
						"loadBalancer": false,
						"secrets": [{
							"id": "!231",
							"name": "test-secret-1",
							"mountPath": "secretPath"
						}],
						"type": "resource",
						"sourceCode": {},
						"resourceId": "5b0801ec88d1aa55c1f84a0f"
					}
				},
				"action": "deploy"
			},
			"infra": infra
		},
		'mongoReDeploy': {
			"strategy": "docker",
			"driver": "docker.remote",
			"env": "bloooom",
			"deployerConfig": {
				"apiPort": 443,
				"nodes": "192.168.61.51",
				"apiProtocol": "https",
				"auth": {
					"token": ""
				}
			},
			"soajs": soajs,
			"params": {
				"data": {
					"variables": {
						"$SOAJS_EXTKEY": "",
						"$SOAJS_MONGO_NB": 1,
						"$SOAJS_MONGO_IP_1": "192.168.61.51",
						"$SOAJS_MONGO_PORT_1": 27017,
						"$SOAJS_MONGO_PREFIX": "local_"
					}
				},
				"catalog": {
					"_id": "5ad9cab35c967d35b871065c",
					"name": "Mongo Recipe",
					"type": "cluster",
					"subtype": "mongo",
					"description": "This recipe allows you to deploy a mongo server",
					"locked": true,
					"recipe": {
						"deployOptions": {
							"image": {
								"prefix": "",
								"name": "mongo",
								"tag": "3.4.10",
								"pullPolicy": "IfNotPresent"
							},
							"sourceCode": {
								"configuration": {
									"label": "Attach Custom Configuration",
									"repo": "",
									"branch": "",
									"required": false
								}
							},
							"readinessProbe": {
								"httpGet": {
									"path": "/",
									"port": 27017
								},
								"initialDelaySeconds": 5,
								"timeoutSeconds": 2,
								"periodSeconds": 5,
								"successThreshold": 1,
								"failureThreshold": 3
							},
							"restartPolicy": {
								"condition": "any",
								"maxAttempts": 5
							},
							"container": {
								"network": "soajsnet",
								"workingDir": ""
							},
							"voluming": [
								{
									"docker": {
										"volume": {
											"Type": "volume",
											"Source": "custom-mongo-volume",
											"Target": "/data/db/"
										}
									},
									"kubernetes": {
										"volume": {
											"name": "custom-mongo-volume",
											"hostPath": {
												"path": "/data/custom/db/"
											}
										},
										"volumeMount": {
											"mountPath": "/data/db/",
											"name": "custom-mongo-volume"
										}
									}
								}
							],
							"ports": [
								{
									"name": "mongo",
									"target": 27017,
									"isPublished": true,
									"published": 2017
								}
							],
							"certificates": "optional"
						},
						"buildOptions": {
							"env": {},
							"cmd": {
								"deploy": {
									"command": [
										"mongod"
									],
									"args": [
										"--smallfiles"
									]
								}
							}
						}
					}
				},
				"inputmaskData": {
					"env": "BLOOOOM",
					"serviceId": "9xabk0pf9wdfdul8vh913jvqs",
					"mode": "replicated",
					"action": "rebuild",
					"custom": {
						"image": {},
						"sourceCode": {},
						"ports": [{
							name: 'mongo',
							target: 27017,
							isPublished: true,
							published: 270,
							preserveClientIP: true
						}],
						"secrets": [{
							"id": "!231",
							"name": "test-secret-1",
							"mountPath": "secretPath"
						}],
						"name": "mongotest",
						"resourceId": "5b0801ec88d1aa55c1f84a0f"
					},
					"namespace": "",
					"recipe": "5ad9cab35c967d35b871065c",
					"imageLastTs": "1515128013261",
					"deployConfig": {
						"replication": {
							"mode": "replicated",
							"replicas": 1
						},
						"memoryLimit": 524288000
					}
				},
				"action": "rebuild"
			},
			"infra": infra
		},
		"inspectService": {
			"ID": "9xabk0pf9wdfdul8vh913jvqs",
			"Version": {
				"Index": 355
			},
			"CreatedAt": "2018-05-25T12:51:30.413401783Z",
			"UpdatedAt": "2018-05-25T15:34:03.765167021Z",
			"Spec": {
				"Name": "mongotest",
				"Labels": {
					"memoryLimit": "500",
					"service.image.name": "mongo",
					"service.image.tag": "3.4.10",
					"service.image.ts": "1515128013261",
					"soajs.catalog.id": "5ad9cab35c967d35b871065c",
					"soajs.env.code": "bloooom",
					"soajs.resource.id": "5b0801ec88d1aa55c1f84a0f",
					"soajs.service.group": "Other",
					"soajs.service.label": "mongotest",
					"soajs.service.mode": "replicated",
					"soajs.service.name": "mongotest",
					"soajs.service.replicas": "1",
					"soajs.service.subtype": "mongo",
					"soajs.service.type": "cluster"
				},
				"TaskTemplate": {
					"ContainerSpec": {
						"Image": "mongo:3.4.10",
						"Labels": {
							"memoryLimit": "500",
							"service.image.name": "mongo",
							"service.image.tag": "3.4.10",
							"service.image.ts": "1515128013261",
							"soajs.catalog.id": "5ad9cab35c967d35b871065c",
							"soajs.env.code": "bloooom",
							"soajs.resource.id": "5b0801ec88d1aa55c1f84a0f",
							"soajs.service.group": "Other",
							"soajs.service.label": "mongotest",
							"soajs.service.mode": "replicated",
							"soajs.service.name": "mongotest",
							"soajs.service.replicas": "1",
							"soajs.service.subtype": "mongo",
							"soajs.service.type": "cluster"
						},
						"Command": [
							"mongod"
						],
						"Args": [
							"--smallfiles"
						],
						"Mounts": [
							{
								"Type": "volume",
								"Source": "custom-mongo-volume",
								"Target": "/data/db/"
							}
						],
						"Isolation": "default"
					},
					"Resources": {
						"Limits": {
							"MemoryBytes": 524288000
						}
					},
					"RestartPolicy": {
						"Condition": "any",
						"MaxAttempts": 5
					},
					"ForceUpdate": 0,
					"Runtime": "container"
				},
				"Mode": {
					"Replicated": {
						"Replicas": 1
					}
				},
				"UpdateConfig": {
					"Parallelism": 2,
					"Delay": 500,
					"FailureAction": "pause",
					"MaxFailureRatio": 0,
					"Order": "stop-first"
				},
				"Networks": [
					{
						"Target": "ifaxhwl3dy2ymt3cebxbufnaq"
					}
				],
				"EndpointSpec": {
					"Mode": "vip",
					"Ports": [
						{
							"Protocol": "tcp",
							"TargetPort": 27017,
							"PublishedPort": 32017,
							"PublishMode": "host"
						}
					]
				}
			},
			"Endpoint": {
				"Spec": {
					"Mode": "vip",
					"Ports": [
						{
							"Protocol": "tcp",
							"TargetPort": 27017,
							"PublishedPort": 32017,
							"PublishMode": "host"
						}
					]
				},
				"Ports": [
					{
						"Protocol": "tcp",
						"TargetPort": 27017,
						"PublishedPort": 32017,
						"PublishMode": "host"
					}
				],
				"VirtualIPs": [
					{
						"NetworkID": "uc19ia2f6u4ng4qbiz07h9jx2",
						"Addr": "10.255.0.5/16"
					},
					{
						"NetworkID": "ifaxhwl3dy2ymt3cebxbufnaq",
						"Addr": "10.0.0.8/24"
					}
				]
			}
		},
		"inspectController": {
			"ID": "5aornksipp1ulqs0ojcebamcd",
			"Version": {
				"Index": 783
			},
			"CreatedAt": "2018-05-29T14:50:32.65380385Z",
			"UpdatedAt": "2018-05-30T10:32:20.583172614Z",
			"Spec": {
				"Name": "bloooom-controller",
				"Labels": {
					"memoryLimit": "500",
					"service.branch": "master",
					"service.commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
					"service.image.name": "soajs",
					"service.image.prefix": "soajsorg",
					"service.image.tag": "latest",
					"service.image.ts": "1522243952636",
					"service.owner": "soajs",
					"service.repo": "soajs.controller",
					"soajs.catalog.id": "5ad9cab35c967d35b8710658",
					"soajs.content": "true",
					"soajs.env.code": "bloooom",
					"soajs.service.group": "soajs-core-services",
					"soajs.service.label": "bloooom-controller",
					"soajs.service.mode": "replicated",
					"soajs.service.name": "controller",
					"soajs.service.replicas": "1",
					"soajs.service.repo.name": "soajs-controller",
					"soajs.service.subtype": "soajs",
					"soajs.service.type": "service",
					"soajs.service.version": "1"
				},
				"TaskTemplate": {
					"ContainerSpec": {
						"Image": "soajsorg/soajs:latest",
						"Labels": {
							"memoryLimit": "500",
							"service.branch": "master",
							"service.commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
							"service.image.name": "soajs",
							"service.image.prefix": "soajsorg",
							"service.image.tag": "latest",
							"service.image.ts": "1522243952636",
							"service.owner": "soajs",
							"service.repo": "soajs.controller",
							"soajs.catalog.id": "5ad9cab35c967d35b8710658",
							"soajs.content": "true",
							"soajs.env.code": "bloooom",
							"soajs.service.group": "soajs-core-services",
							"soajs.service.label": "bloooom-controller",
							"soajs.service.mode": "replicated",
							"soajs.service.name": "controller",
							"soajs.service.replicas": "1",
							"soajs.service.repo.name": "soajs-controller",
							"soajs.service.subtype": "soajs",
							"soajs.service.type": "service",
							"soajs.service.version": "1"
						},
						"Command": [
							"bash"
						],
						"Args": [
							"-c",
							"node index.js -T service"
						],
						"Env": [
							"NODE_TLS_REJECT_UNAUTHORIZED=0",
							"NODE_ENV=production",
							"SOAJS_ENV=bloooom",
							"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js",
							"SOAJS_SRV_AUTOREGISTERHOST=true",
							"SOAJS_SRV_MEMORY=500",
							"SOAJS_DEPLOY_HA=swarm",
							"SOAJS_HA_NAME={{.Task.Name}}",
							"SOAJS_MONGO_NB=1",
							"SOAJS_MONGO_PREFIX=local_",
							"SOAJS_MONGO_IP_1=192.168.61.51",
							"SOAJS_MONGO_PORT_1=27017",
							"SOAJS_GIT_PROVIDER=github",
							"SOAJS_GIT_DOMAIN=github.com",
							"SOAJS_GIT_OWNER=soajs",
							"SOAJS_GIT_REPO=soajs.controller",
							"SOAJS_GIT_BRANCH=master",
							"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8"
						],
						"Dir": "/opt/soajs/deployer/",
						"Mounts": [
							{
								"Type": "volume",
								"Source": "soajs_log_volume",
								"Target": "/var/log/soajs/"
							},
							{
								"Type": "bind",
								"Source": "/var/run/docker.sock",
								"Target": "/var/run/docker.sock",
								"ReadOnly": true
							},
							{
								"Type": "volume",
								"Source": "soajs_certs_volume",
								"Target": "/var/certs/soajs/"
							}
						],
						"StopGracePeriod": 10000000000,
						"DNSConfig": {},
						"Isolation": "default"
					},
					"Resources": {
						"Limits": {
							"MemoryBytes": 524288000
						}
					},
					"RestartPolicy": {
						"Condition": "any",
						"Delay": 5000000000,
						"MaxAttempts": 5
					},
					"Placement": {},
					"ForceUpdate": 0,
					"Runtime": "container"
				},
				"Mode": {
					"Replicated": {
						"Replicas": 1
					}
				},
				"UpdateConfig": {
					"Parallelism": 2,
					"Delay": 500,
					"FailureAction": "pause",
					"Monitor": 5000000000,
					"MaxFailureRatio": 0,
					"Order": "stop-first"
				},
				"RollbackConfig": {
					"Parallelism": 1,
					"FailureAction": "pause",
					"Monitor": 5000000000,
					"MaxFailureRatio": 0,
					"Order": "stop-first"
				},
				"Networks": [
					{
						"Target": "ifaxhwl3dy2ymt3cebxbufnaq"
					}
				],
				"EndpointSpec": {
					"Mode": "vip"
				}
			},
			"PreviousSpec": {
				"Name": "bloooom-controller",
				"Labels": {
					"memoryLimit": "500",
					"service.branch": "master",
					"service.commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
					"service.image.name": "soajs",
					"service.image.prefix": "soajsorg",
					"service.image.tag": "latest",
					"service.image.ts": "1522243952636",
					"service.owner": "soajs",
					"service.repo": "soajs.controller",
					"soajs.catalog.id": "5ad9cab35c967d35b8710658",
					"soajs.content": "true",
					"soajs.env.code": "bloooom",
					"soajs.service.group": "soajs-core-services",
					"soajs.service.label": "bloooom-controller",
					"soajs.service.mode": "replicated",
					"soajs.service.name": "controller",
					"soajs.service.replicas": "1",
					"soajs.service.repo.name": "soajs-controller",
					"soajs.service.subtype": "soajs'use strict';\n" +
					"let infra = {\n" +
					"\t\"_id\": \"5b044a4df920c675412f82e3\",\n" +
					"\t\"api\": {\n" +
					"\t\t\"ipaddress\": \"192.168.61.51\",\n" +
					"\t\t\"token\": \"\",\n" +
					"\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\"port\": 443,\n" +
					"\t\t\"protocol\": \"https\"\n" +
					"\t},\n" +
					"\t\"name\": \"local\",\n" +
					"\t\"technologies\": [\n" +
					"\t\t\"docker\"\n" +
					"\t],\n" +
					"\t\"templates\": null,\n" +
					"\t\"label\": \"Local Docker Machine\",\n" +
					"\t\"deployments\": [\n" +
					"\t\t{\n" +
					"\t\t\t\"technology\": \"docker\",\n" +
					"\t\t\t\"options\": {\n" +
					"\t\t\t\t\"zone\": \"local\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"environments\": [\n" +
					"\t\t\t\t\"BLOOOOM\"\n" +
					"\t\t\t],\n" +
					"\t\t\t\"loadBalancers\": {},\n" +
					"\t\t\t\"name\": \"htlocal091o3vvyh3z82\",\n" +
					"\t\t\t\"id\": \"htlocal091o3vvyh3z82\"\n" +
					"\t\t}\n" +
					"\t],\n" +
					"\t\"info\": [\n" +
					"\t\t[\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"technology\": \"docker\",\n" +
					"\t\t\t\t\"options\": {\n" +
					"\t\t\t\t\t\"zone\": \"local\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"environments\": [\n" +
					"\t\t\t\t\t\"BLOOOOM\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"loadBalancers\": {},\n" +
					"\t\t\t\t\"name\": \"htlocal091o3vvyh3z82\",\n" +
					"\t\t\t\t\"id\": \"htlocal091o3vvyh3z82\"\n" +
					"\t\t\t}\n" +
					"\t\t],\n" +
					"\t\t[\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"code\": \"BLOOOOM\"\n" +
					"\t\t\t}\n" +
					"\t\t],\n" +
					"\t\t0\n" +
					"\t],\n" +
					"\t\"stack\": {\n" +
					"\t\t\"technology\": \"docker\",\n" +
					"\t\t\"options\": {\n" +
					"\t\t\t\"zone\": \"local\"\n" +
					"\t\t},\n" +
					"\t\t\"environments\": [\n" +
					"\t\t\t\"BLOOOOM\"\n" +
					"\t\t],\n" +
					"\t\t\"loadBalancers\": {},\n" +
					"\t\t\"name\": \"htlocal091o3vvyh3z82\",\n" +
					"\t\t\"id\": \"htlocal091o3vvyh3z82\"\n" +
					"\t}\n" +
					"};\n" +
					"let registry = {\n" +
					"\t\"_id\": \"5b05a55220957fbc7ac752cc\",\n" +
					"\t\"code\": \"BLOOOOM\",\n" +
					"\t\"description\": \"werwerw\",\n" +
					"\t\"sensitive\": false,\n" +
					"\t\"domain\": \"loolper.com\",\n" +
					"\t\"profile\": \"/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\"sitePrefix\": \"site\",\n" +
					"\t\"apiPrefix\": \"api\",\n" +
					"\t\"dbs\": {\n" +
					"\t\t\"config\": {\n" +
					"\t\t\t\"prefix\": \"\"\n" +
					"\t\t},\n" +
					"\t\t\"databases\": {}\n" +
					"\t},\n" +
					"\t\"deployer\": {\n" +
					"\t\t\"manual\": {\n" +
					"\t\t\t\"nodes\": \"\"\n" +
					"\t\t},\n" +
					"\t\t\"container\": {\n" +
					"\t\t\t\"docker\": {\n" +
					"\t\t\t\t\"local\": {\n" +
					"\t\t\t\t\t\"socketPath\": \"/var/run/docker.sock\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"remote\": {\n" +
					"\t\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\t\"token\": \"78954f458f5ec9aaafa45d4322e4302126570585b7ec997584005d8113cb4358b4f7c18a00dd5663727453d45dc7447473c4a9008ba2c1dfc8754df249e05bee41d063f091f283ec36714542fb97725117211fe99da2a81c365dba5290c112c06e4182f661bafe9ba1ff6f12d06110452887a72077f65f4a44431d34478387d48969e1a62da6642390e4c80b444ccbe530459b6f6115d1297de481884b0b7d462f18e70cf8109f75f07b842baa1ee1413c5d6adb2c10173d2d16cc69c525d73b2b9c354a8553d5c86d51bb0abe474458a3562aae8fc648ed4daafa577f72a37aa30a43656a0f1216ea06eeb020e8ba7965f13743bd51b5b415b7506621254ca33f509a5cb6203d6a95202efbd3c5ff2f995af0e428fcef5330e75ae26311b90cc20884145afcab1623713278b2d104541b18d552e2ee67c5b19fafbd8c4830a42e0b5c2abad381ddb0343c9eb70f0575527cfec01efd0baf5bf1d45dfbc99309cbe4923630323ef284ce8c0d94d611c55768209dca646c6f4128ee9d020c266b7fee37081e2a18bdda1dbf2bb16cf599ebaf5a9ad2518e1faf8f0221fa1386298e38390e46ff5d24ca7d49fdbc8dc7c0861d5a8ea57c524abadd2b7d20da8cf9f9ae29c1c70ca85a64f38cc7bee548e3a5d9cbce7d04c076a58849cbe4fb1f0d37270cffdcacd61fe617ed3369ebb995f11a54fc8b097de35ecdba834c2df5eb\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"kubernetes\": {\n" +
					"\t\t\t\t\"local\": {\n" +
					"\t\t\t\t\t\"nodes\": \"\",\n" +
					"\t\t\t\t\t\"namespace\": {\n" +
					"\t\t\t\t\t\t\"default\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"perService\": false\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"remote\": {\n" +
					"\t\t\t\t\t\"nodes\": \"\",\n" +
					"\t\t\t\t\t\"namespace\": {\n" +
					"\t\t\t\t\t\t\"default\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"perService\": false\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t}\n" +
					"\t\t\t}\n" +
					"\t\t},\n" +
					"\t\t\"type\": \"container\",\n" +
					"\t\t\"selected\": \"container.docker.remote\"\n" +
					"\t},\n" +
					"\t\"services\": {\n" +
					"\t\t\"controller\": {\n" +
					"\t\t\t\"maxPoolSize\": 100,\n" +
					"\t\t\t\"authorization\": true,\n" +
					"\t\t\t\"requestTimeout\": 30,\n" +
					"\t\t\t\"requestTimeoutRenewal\": 0\n" +
					"\t\t},\n" +
					"\t\t\"config\": {\n" +
					"\t\t\t\"awareness\": {\n" +
					"\t\t\t\t\"cacheTTL\": 3600000,\n" +
					"\t\t\t\t\"healthCheckInterval\": 5000,\n" +
					"\t\t\t\t\"autoRelaodRegistry\": 3600000,\n" +
					"\t\t\t\t\"maxLogCount\": 5,\n" +
					"\t\t\t\t\"autoRegisterService\": true\n" +
					"\t\t\t},\n" +
					"\t\t\t\"agent\": {\n" +
					"\t\t\t\t\"topologyDir\": \"/opt/soajs/\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"key\": {\n" +
					"\t\t\t\t\"algorithm\": \"aes256\",\n" +
					"\t\t\t\t\"password\": \"weqerw\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"logger\": {\n" +
					"\t\t\t\t\"src\": true,\n" +
					"\t\t\t\t\"level\": \"debug\",\n" +
					"\t\t\t\t\"formatter\": {\n" +
					"\t\t\t\t\t\"levelInString\": true,\n" +
					"\t\t\t\t\t\"outputMode\": \"long\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"cors\": {\n" +
					"\t\t\t\t\"enabled\": true,\n" +
					"\t\t\t\t\"origin\": \"*\",\n" +
					"\t\t\t\t\"credentials\": \"true\",\n" +
					"\t\t\t\t\"methods\": \"GET,HEAD,PUT,PATCH,POST,DELETE\",\n" +
					"\t\t\t\t\"headers\": \"key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization\",\n" +
					"\t\t\t\t\"maxage\": 1728000\n" +
					"\t\t\t},\n" +
					"\t\t\t\"oauth\": {\n" +
					"\t\t\t\t\"grants\": [\n" +
					"\t\t\t\t\t\"password\",\n" +
					"\t\t\t\t\t\"refresh_token\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"debug\": false,\n" +
					"\t\t\t\t\"accessTokenLifetime\": 7200,\n" +
					"\t\t\t\t\"refreshTokenLifetime\": 1209600\n" +
					"\t\t\t},\n" +
					"\t\t\t\"ports\": {\n" +
					"\t\t\t\t\"controller\": 4000,\n" +
					"\t\t\t\t\"maintenanceInc\": 1000,\n" +
					"\t\t\t\t\"randomInc\": 100\n" +
					"\t\t\t},\n" +
					"\t\t\t\"cookie\": {\n" +
					"\t\t\t\t\"secret\": \"SJ9IrXXyX\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"session\": {\n" +
					"\t\t\t\t\"name\": \"SJxc8rmQJ7\",\n" +
					"\t\t\t\t\"secret\": \"By_q8rXQyX\",\n" +
					"\t\t\t\t\"cookie\": {\n" +
					"\t\t\t\t\t\"path\": \"/\",\n" +
					"\t\t\t\t\t\"httpOnly\": true,\n" +
					"\t\t\t\t\t\"secure\": false,\n" +
					"\t\t\t\t\t\"maxAge\": null\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"resave\": false,\n" +
					"\t\t\t\t\"saveUninitialized\": false,\n" +
					"\t\t\t\t\"rolling\": false,\n" +
					"\t\t\t\t\"unset\": \"keep\"\n" +
					"\t\t\t}\n" +
					"\t\t}\n" +
					"\t},\n" +
					"\t\"port\": 32773,\n" +
					"\t\"protocol\": \"http\"\n" +
					"};\n" +
					"let soajs = {\n" +
					"\t\"log\": {\n" +
					"\t\t\"error\": (data) => {\n" +
					"\t\t\treturn data;\n" +
					"\t\t},\n" +
					"\t\t\"warn\": (data) => {\n" +
					"\t\t\treturn data;\n" +
					"\t\t},\n" +
					"\t\t\"info\": (data) => {\n" +
					"\t\t\treturn data;\n" +
					"\t\t},\n" +
					"\t\t\"debug\": (data) => {\n" +
					"\t\t\treturn data;\n" +
					"\t\t}\n" +
					"\t},\n" +
					"\tregistry: registry,\n" +
					"\tvalidator: require('jsonschema'),\n" +
					"};\n" +
					"module.exports = function () {\n" +
					"\tlet data = {\n" +
					"\t\t'deployer': {\n" +
					"\t\t\t\"strategy\": \"docker\",\n" +
					"\t\t\t\"driver\": \"docker.remote\",\n" +
					"\t\t\t\"env\": \"docker\",\n" +
					"\t\t\t\"deployerConfig\": {\n" +
					"\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\"token\": \"1\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"model\": {},\n" +
					"\t\t\t\"infra\": {\n" +
					"\t\t\t\t\"_id\": \"5b044a4df920c675412f82e3\",\n" +
					"\t\t\t\t\"api\": {\n" +
					"\t\t\t\t\t\"ipaddress\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\"token\": \"\",\n" +
					"\t\t\t\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\t\t\t\"port\": 443,\n" +
					"\t\t\t\t\t\"protocol\": \"https\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"name\": \"local\",\n" +
					"\t\t\t\t\"technologies\": [\n" +
					"\t\t\t\t\t\"docker\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"templates\": null,\n" +
					"\t\t\t\t\"label\": \"Local Docker Machine\",\n" +
					"\t\t\t\t\"deployments\": [{\n" +
					"\t\t\t\t\t\"technology\": \"docker\",\n" +
					"\t\t\t\t\t\"options\": {\n" +
					"\t\t\t\t\t\t\"zone\": \"local\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"environments\": [\n" +
					"\t\t\t\t\t\t\"DOCKER\"\n" +
					"\t\t\t\t\t],\n" +
					"\t\t\t\t\t\"loadBalancers\": {},\n" +
					"\t\t\t\t\t\"name\": \"htlocal42vkx8l4o1fim\",\n" +
					"\t\t\t\t\t\"id\": \"htlocal42vkx8l4o1fim\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"stack\": \"\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"params\": {\n" +
					"\t\t\t\t\"env\": \"docker\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"soajs\": soajs\n" +
					"\t\t},\n" +
					"\t\t'serviceList': [\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"ID\": \"2z3amlp3y2gg67f83rfrrznf9\",\n" +
					"\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\"Index\": 295\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"CreatedAt\": \"2018-05-23T17:31:01.705795919Z\",\n" +
					"\t\t\t\t\"UpdatedAt\": \"2018-05-25T07:56:58.683791961Z\",\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"Name\": \"bloooom-controller\",\n" +
					"\t\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\t\"service.branch\": \"master\",\n" +
					"\t\t\t\t\t\t\"service.commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\",\n" +
					"\t\t\t\t\t\t\"service.image.name\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"service.image.prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\t\"service.image.tag\": \"latest\",\n" +
					"\t\t\t\t\t\t\"service.image.ts\": \"1522243952636\",\n" +
					"\t\t\t\t\t\t\"service.owner\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"service.repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\t\"soajs.content\": \"true\",\n" +
					"\t\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\t\"soajs.service.group\": \"soajs-core-services\",\n" +
					"\t\t\t\t\t\t\"soajs.service.label\": \"bloooom-controller\",\n" +
					"\t\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\"soajs.service.name\": \"controller\",\n" +
					"\t\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\t\"soajs.service.repo.name\": \"soajs-controller\",\n" +
					"\t\t\t\t\t\t\"soajs.service.subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"soajs.service.type\": \"service\",\n" +
					"\t\t\t\t\t\t\"soajs.service.version\": \"1\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"TaskTemplate\": {\n" +
					"\t\t\t\t\t\t\"ContainerSpec\": {\n" +
					"\t\t\t\t\t\t\t\"Image\": \"soajsorg/soajs:latest\",\n" +
					"\t\t\t\t\t\t\t\"Command\": [\n" +
					"\t\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"Args\": [\n" +
					"\t\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"Env\": [\n" +
					"\t\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED=0\",\n" +
					"\t\t\t\t\t\t\t\t\"NODE_ENV=production\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_ENV=bloooom\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST=true\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY=500\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA=swarm\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_HA_NAME={{.Task.Name}}\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_NB=1\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX=local_\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_IP_1=192.168.61.51\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT_1=27017\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER=github\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN=github.com\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER=soajs\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_REPO=soajs.controller\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH=master\",\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT=\"\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"Dir\": \"/opt/soajs/deployer/\",\n" +
					"\t\t\t\t\t\t\t\"Secrets\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"File\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"Name\": \"mountPath\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"UID\": \"0\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"GID\": \"0\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"Mode\": 644\n" +
					"\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\"SecretID\": \"f6xlz2x8ysma2vu5qft8v3cp1\",\n" +
					"\t\t\t\t\t\t\t\t\t\"SecretName\": \"test-secret-1\"\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"Mounts\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\t\"ReadOnly\": true\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"Isolation\": \"default\"\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\t\"Limits\": {\n" +
					"\t\t\t\t\t\t\t\t\"MemoryBytes\": 524288000\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"RestartPolicy\": {\n" +
					"\t\t\t\t\t\t\t\"Condition\": \"any\",\n" +
					"\t\t\t\t\t\t\t\"MaxAttempts\": 5\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"ForceUpdate\": 0,\n" +
					"\t\t\t\t\t\t\"Runtime\": \"container\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Mode\": {\n" +
					"\t\t\t\t\t\t\"Replicated\": {\n" +
					"\t\t\t\t\t\t\t\"Replicas\": 1\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"UpdateConfig\": {\n" +
					"\t\t\t\t\t\t\"Parallelism\": 2,\n" +
					"\t\t\t\t\t\t\"Delay\": 500,\n" +
					"\t\t\t\t\t\t\"FailureAction\": \"pause\",\n" +
					"\t\t\t\t\t\t\"MaxFailureRatio\": 0,\n" +
					"\t\t\t\t\t\t\"Order\": \"stop-first\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Networks\": [\n" +
					"\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\"Target\": \"ifaxhwl3dy2ymt3cebxbufnaq\"\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t],\n" +
					"\t\t\t\t\t\"EndpointSpec\": {\n" +
					"\t\t\t\t\t\t\"Mode\": \"vip\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Endpoint\": {\n" +
					"\t\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\t\"Mode\": \"vip\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"VirtualIPs\": [\n" +
					"\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\"NetworkID\": \"ifaxhwl3dy2ymt3cebxbufnaq\",\n" +
					"\t\t\t\t\t\t\t\"Addr\": \"10.0.0.36/24\"\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t]\n" +
					"\t\t\t\t}\n" +
					"\t\t\t}],\n" +
					"\t\t'servicesTasks': [\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"ID\": \"kryfpx1uuj33t4z31mvkzvjod\",\n" +
					"\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\"Index\": 313\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"CreatedAt\": \"2018-05-25T07:56:59.8027991Z\",\n" +
					"\t\t\t\t\"UpdatedAt\": \"2018-05-25T07:57:06.240972258Z\",\n" +
					"\t\t\t\t\"Labels\": {},\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"ContainerSpec\": {\n" +
					"\t\t\t\t\t\t\"Image\": \"soajsorg/soajs:latest\",\n" +
					"\t\t\t\t\t\t\"Command\": [\n" +
					"\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Args\": [\n" +
					"\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Env\": [\n" +
					"\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED=0\",\n" +
					"\t\t\t\t\t\t\t\"NODE_ENV=production\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_ENV=bloooom\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST=true\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY=500\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA=swarm\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_HA_NAME={{.Task.Name}}\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_NB=1\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX=local_\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_IP_1=192.168.61.51\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT_1=27017\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER=github\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN=github.com\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER=soajs\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_REPO=soajs.controller\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH=master\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Dir\": \"/opt/soajs/deployer/\",\n" +
					"\t\t\t\t\t\t\"Mounts\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"ReadOnly\": true\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Isolation\": \"default\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\"Limits\": {\n" +
					"\t\t\t\t\t\t\t\"MemoryBytes\": 524288000\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"RestartPolicy\": {\n" +
					"\t\t\t\t\t\t\"Condition\": \"any\",\n" +
					"\t\t\t\t\t\t\"MaxAttempts\": 5\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"ForceUpdate\": 0\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"ServiceID\": \"2z3amlp3y2gg67f83rfrrznf9\",\n" +
					"\t\t\t\t\"Slot\": 1,\n" +
					"\t\t\t\t\"NodeID\": \"mwdhuz0wfj6e9d40175g8kpge\",\n" +
					"\t\t\t\t\"Status\": {\n" +
					"\t\t\t\t\t\"Timestamp\": \"2018-05-25T07:57:06.229273186Z\",\n" +
					"\t\t\t\t\t\"State\": \"running\",\n" +
					"\t\t\t\t\t\"Message\": \"started\",\n" +
					"\t\t\t\t\t\"ContainerStatus\": {\n" +
					"\t\t\t\t\t\t\"ContainerID\": \"640158f719bebc0044016d9e53f2f30697888debc0961de4f9e73419f8b8c743\",\n" +
					"\t\t\t\t\t\t\"PID\": 4692,\n" +
					"\t\t\t\t\t\t\"ExitCode\": 0\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"PortStatus\": {\n" +
					"\t\t\t\t\t\t\"Ports\": [{\n" +
					"\t\t\t\t\t\t\t\"TargetPort\": 27017\n" +
					"\t\t\t\t\t\t}]\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"DesiredState\": \"running\",\n" +
					"\t\t\t\t\"NetworksAttachments\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"Network\": {\n" +
					"\t\t\t\t\t\t\t\"ID\": \"ifaxhwl3dy2ymt3cebxbufnaq\",\n" +
					"\t\t\t\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\t\t\t\"Index\": 293\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"CreatedAt\": \"2018-05-22T16:50:21.594817178Z\",\n" +
					"\t\t\t\t\t\t\t\"UpdatedAt\": \"2018-05-25T07:56:58.681817847Z\",\n" +
					"\t\t\t\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"soajsnet\",\n" +
					"\t\t\t\t\t\t\t\t\"Labels\": {},\n" +
					"\t\t\t\t\t\t\t\t\"DriverConfiguration\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"Name\": \"overlay\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"Attachable\": true,\n" +
					"\t\t\t\t\t\t\t\t\"IPAMOptions\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"Driver\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"Name\": \"default\"\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"Scope\": \"swarm\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"DriverState\": {\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"overlay\",\n" +
					"\t\t\t\t\t\t\t\t\"Options\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"com.docker.network.driver.overlay.vxlanid_list\": \"4097\"\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"IPAMOptions\": {\n" +
					"\t\t\t\t\t\t\t\t\"Driver\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"Name\": \"default\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"Configs\": [\n" +
					"\t\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\t\"Subnet\": \"10.0.0.0/24\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"Gateway\": \"10.0.0.1\"\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Addresses\": [\n" +
					"\t\t\t\t\t\t\t\"10.0.0.4/24\"\n" +
					"\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t]\n" +
					"\t\t\t}\n" +
					"\t\t],\n" +
					"\t\t'constrollerDeploy': {\n" +
					"\t\t\t\"strategy\": \"docker\",\n" +
					"\t\t\t\"driver\": \"docker.local\",\n" +
					"\t\t\t\"env\": \"bloooom\",\n" +
					"\t\t\t\"deployerConfig\": {\n" +
					"\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"soajs\": soajs,\n" +
					"\t\t\t\"params\": {\n" +
					"\t\t\t\t\"data\": {\n" +
					"\t\t\t\t\t\"variables\": {\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_DOMAIN\": \"loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_SITE_DOMAIN\": \"site.loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_API_DOMAIN\": \"api.loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_PROFILE\": \"/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_EXTKEY\": \"\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_NB\": 1,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_IP_1\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PORT_1\": 27017,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PREFIX\": \"local_\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_PROVIDER\": \"github\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_DOMAIN\": \"github.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_OWNER\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_REPO\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_BRANCH\": \"master\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_COMMIT\": \"\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_SRV_PORT\": 4000,\n" +
					"\t\t\t\t\t\t\"$SOAJS_SRV_PORT_MAINTENANCE\": 5000\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"serviceName\": \"controller\",\n" +
					"\t\t\t\t\t\"serviceGroup\": \"SOAJS Core Services\",\n" +
					"\t\t\t\t\t\"name\": \"bloooom-controller\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"catalog\": {\n" +
					"\t\t\t\t\t\"_id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"name\": \"SOAJS API Gateway Recipe\",\n" +
					"\t\t\t\t\t\"type\": \"service\",\n" +
					"\t\t\t\t\t\"subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\"description\": \"This recipe allows you to deploy the SOAJS API Gateway\",\n" +
					"\t\t\t\t\t\"locked\": true,\n" +
					"\t\t\t\t\t\"recipe\": {\n" +
					"\t\t\t\t\t\t\"deployOptions\": {\n" +
					"\t\t\t\t\t\t\t\"image\": {\n" +
					"\t\t\t\t\t\t\t\t\"prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"soajs\",\n" +
					"\t\t\t\t\t\t\t\t\"tag\": \"latest\",\n" +
					"\t\t\t\t\t\t\t\t\"pullPolicy\": \"IfNotPresent\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"sourceCode\": {},\n" +
					"\t\t\t\t\t\t\t\"readinessProbe\": {\n" +
					"\t\t\t\t\t\t\t\t\"httpGet\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"path\": \"/heartbeat\",\n" +
					"\t\t\t\t\t\t\t\t\t\"port\": \"maintenance\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"initialDelaySeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"timeoutSeconds\": 2,\n" +
					"\t\t\t\t\t\t\t\t\"periodSeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"successThreshold\": 1,\n" +
					"\t\t\t\t\t\t\t\t\"failureThreshold\": 3\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"restartPolicy\": {\n" +
					"\t\t\t\t\t\t\t\t\"condition\": \"any\",\n" +
					"\t\t\t\t\t\t\t\t\"maxAttempts\": 5\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"container\": {\n" +
					"\t\t\t\t\t\t\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\t\t\t\t\t\t\"workingDir\": \"/opt/soajs/deployer/\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"certificates\": 'maybe',\n" +
					"\t\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"http\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 80\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"https\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 443\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"maintenance\",\n" +
					"\t\t\t\t\t\t\t\t\t\"isPublished\": false,\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 4000\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"voluming\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\"kubernetes\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"soajs-log-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"hostPath\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\t\"path\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volumeMount\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"mountPath\": \"/var/log/soajs/\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"soajs-log-volume\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"ReadOnly\": true,\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"buildOptions\": {\n" +
					"\t\t\t\t\t\t\t\"settings\": {\n" +
					"\t\t\t\t\t\t\t\t\"accelerateDeployment\": true\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"env\": {\n" +
					"\t\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"0\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"NODE_ENV\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"production\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_ENV\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_ENV\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_PROFILE\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"/opt/soajs/FILES/profiles/profile.js\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"true\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_SRV_MEMORY\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_MAIN\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_SRV_MAIN\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_DEPLOY_HA\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_HA_NAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_HA_NAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_NB\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_NB\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PREFIX\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_RSNAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_RSNAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_AUTH_DB\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_AUTH_DB\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_SSL\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_SSL\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_IP\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_IP_N\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PORT_N\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_USERNAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_USERNAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PASSWORD\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PASSWORD\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_PROVIDER\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_DOMAIN\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_OWNER\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_REPO\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_REPO\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_BRANCH\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_COMMIT\"\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"cmd\": {\n" +
					"\t\t\t\t\t\t\t\t\"deploy\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"command\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\t\t\"args\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"inputmaskData\": {\n" +
					"\t\t\t\t\t\"env\": \"BLOOOOM\",\n" +
					"\t\t\t\t\t\"recipe\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"gitSource\": {\n" +
					"\t\t\t\t\t\t\"owner\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\"branch\": \"master\",\n" +
					"\t\t\t\t\t\t\"commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"deployConfig\": {\n" +
					"\t\t\t\t\t\t\"replication\": {\n" +
					"\t\t\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"replicas\": 1\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"memoryLimit\": 524288000\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"custom\": {\n" +
					"\t\t\t\t\t\t\"name\": \"controller\",\n" +
					"\t\t\t\t\t\t\"type\": \"service\",\n" +
					"\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"http\",\n" +
					"\t\t\t\t\t\t\t\t\"target\": 80\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"https\",\n" +
					"\t\t\t\t\t\t\t\t\"target\": 443\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"maintenance\",\n" +
					"\t\t\t\t\t\t\t\t\"isPublished\": false,\n" +
					"\t\t\t\t\t\t\t\t\"target\": 4000\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"secrets\": [{\n" +
					"\t\t\t\t\t\t\t\"id\": \"!231\",\n" +
					"\t\t\t\t\t\t\t\"name\": \"test-secret-1\",\n" +
					"\t\t\t\t\t\t\t\"mountPath\": \"secretPath\",\n" +
					"\t\t\t\t\t\t\t\"type\": 'certificate'\n" +
					"\t\t\t\t\t\t}],\n" +
					"\t\t\t\t\t\t\"sourceCode\": {},\n" +
					"\t\t\t\t\t\t\"version\": 1\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"action\": \"deploy\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"infra\": infra\n" +
					"\t\t},\n" +
					"\t\t'controllerRedeploy': {\n" +
					"\t\t\t\"strategy\": \"docker\",\n" +
					"\t\t\t\"driver\": \"docker.remote\",\n" +
					"\t\t\t\"env\": \"bloooom\",\n" +
					"\t\t\t\"deployerConfig\": {\n" +
					"\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"soajs\": soajs,\n" +
					"\t\t\t\"params\": {\n" +
					"\t\t\t\t\"data\": {\n" +
					"\t\t\t\t\t\"variables\": {\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_DOMAIN\": \"loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_SITE_DOMAIN\": \"site.loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_NX_API_DOMAIN\": \"api.loolper.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_PROFILE\": \"/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_EXTKEY\": \"9b96ba56ce934ded56c3f21ac9bdaddc8ba4782b7753cf07576bfabcace8632eba1749ff1187239ef1f56dd74377aa1e5d0a1113de2ed18368af4b808ad245bc7da986e101caddb7b75992b14d6a866db884ea8aee5ab02786886ecf9f25e974\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_NB\": 1,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_IP_1\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PORT_1\": 27017,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PREFIX\": \"local_\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_SRV_PORT\": 4000,\n" +
					"\t\t\t\t\t\t\"$SOAJS_SRV_PORT_MAINTENANCE\": 5000,\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_PROVIDER\": \"github\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_DOMAIN\": \"github.com\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_OWNER\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_REPO\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_BRANCH\": \"master\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_GIT_COMMIT\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"serviceName\": \"controller\",\n" +
					"\t\t\t\t\t\"serviceGroup\": \"SOAJS Core Services\",\n" +
					"\t\t\t\t\t\"name\": \"bloooom-controller\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"catalog\": {\n" +
					"\t\t\t\t\t\"_id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"name\": \"SOAJS API Gateway Recipe\",\n" +
					"\t\t\t\t\t\"type\": \"service\",\n" +
					"\t\t\t\t\t\"subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\"description\": \"This recipe allows you to deploy the SOAJS API Gateway\",\n" +
					"\t\t\t\t\t\"locked\": true,\n" +
					"\t\t\t\t\t\"recipe\": {\n" +
					"\t\t\t\t\t\t\"deployOptions\": {\n" +
					"\t\t\t\t\t\t\t\"image\": {\n" +
					"\t\t\t\t\t\t\t\t\"prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"soajs\",\n" +
					"\t\t\t\t\t\t\t\t\"tag\": \"latest\",\n" +
					"\t\t\t\t\t\t\t\t\"pullPolicy\": \"IfNotPresent\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"sourceCode\": {},\n" +
					"\t\t\t\t\t\t\t\"readinessProbe\": {\n" +
					"\t\t\t\t\t\t\t\t\"httpGet\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"path\": \"/heartbeat\",\n" +
					"\t\t\t\t\t\t\t\t\t\"port\": \"maintenance\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"initialDelaySeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"timeoutSeconds\": 2,\n" +
					"\t\t\t\t\t\t\t\t\"periodSeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"successThreshold\": 1,\n" +
					"\t\t\t\t\t\t\t\t\"failureThreshold\": 3\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"restartPolicy\": {\n" +
					"\t\t\t\t\t\t\t\t\"condition\": \"any\",\n" +
					"\t\t\t\t\t\t\t\t\"maxAttempts\": 5\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"container\": {\n" +
					"\t\t\t\t\t\t\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\t\t\t\t\t\t\"workingDir\": \"/opt/soajs/deployer/\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"http\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 80\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"https\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 443,\n" +
					"\t\t\t\t\t\t\t\t\t\"preserveClientIP\": true,\n" +
					"\t\t\t\t\t\t\t\t\t\"isPublished\": true,\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"maintenance\",\n" +
					"\t\t\t\t\t\t\t\t\t\"isPublished\": false,\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 4000\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"voluming\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\"kubernetes\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"soajs-log-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"hostPath\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\t\"path\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volumeMount\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"mountPath\": \"/var/log/soajs/\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"soajs-log-volume\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"ReadOnly\": true,\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"buildOptions\": {\n" +
					"\t\t\t\t\t\t\t\"settings\": {\n" +
					"\t\t\t\t\t\t\t\t\"accelerateDeployment\": true\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"env\": {\n" +
					"\t\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"0\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"NODE_ENV\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"production\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_ENV\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_ENV\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_PROFILE\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"/opt/soajs/FILES/profiles/profile.js\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"static\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"true\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_SRV_MEMORY\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_SRV_MAIN\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_SRV_MAIN\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_DEPLOY_HA\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_HA_NAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_HA_NAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_NB\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_NB\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PREFIX\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_RSNAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_RSNAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_AUTH_DB\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_AUTH_DB\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_SSL\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_SSL\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_IP\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_IP_N\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PORT_N\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_USERNAME\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_USERNAME\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_MONGO_PASSWORD\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_MONGO_PASSWORD\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_PROVIDER\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_DOMAIN\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_OWNER\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_REPO\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_REPO\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_BRANCH\"\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"type\": \"computed\",\n" +
					"\t\t\t\t\t\t\t\t\t\"value\": \"$SOAJS_GIT_COMMIT\"\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"cmd\": {\n" +
					"\t\t\t\t\t\t\t\t\"deploy\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"command\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\t\t\"args\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"inputmaskData\": {\n" +
					"\t\t\t\t\t\"env\": \"BLOOOOM\",\n" +
					"\t\t\t\t\t\"serviceId\": \"5aornksipp1ulqs0ojcebamcd\",\n" +
					"\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\"action\": \"rebuild\",\n" +
					"\t\t\t\t\t\"custom\": {\n" +
					"\t\t\t\t\t\t\"image\": {},\n" +
					"\t\t\t\t\t\t\"branch\": \"master\",\n" +
					"\t\t\t\t\t\t\"commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\",\n" +
					"\t\t\t\t\t\t\"name\": \"controller\",\n" +
					"\t\t\t\t\t\t\"type\": \"service\",\n" +
					"\t\t\t\t\t\t\"version\": \"1\",\n" +
					"\t\t\t\t\t\t\"secrets\": [{\n" +
					"\t\t\t\t\t\t\t\"id\": \"!231\",\n" +
					"\t\t\t\t\t\t\t\"name\": \"test-secret-1\",\n" +
					"\t\t\t\t\t\t\t\"mountPath\": \"secretPath\"\n" +
					"\t\t\t\t\t\t}],\n" +
					"\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"http\",\n" +
					"\t\t\t\t\t\t\t\t\"target\": 80\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"https\",\n" +
					"\t\t\t\t\t\t\t\t\"target\": 443,\n" +
					"\t\t\t\t\t\t\t\t\"preserveClientIP\": true,\n" +
					"\t\t\t\t\t\t\t\t\"isPublished\": true,\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"maintenance\",\n" +
					"\t\t\t\t\t\t\t\t\"isPublished\": false,\n" +
					"\t\t\t\t\t\t\t\t\"target\": 4000\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"namespace\": \"\",\n" +
					"\t\t\t\t\t\"recipe\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"imageLastTs\": \"1522243952636\",\n" +
					"\t\t\t\t\t\"deployConfig\": {\n" +
					"\t\t\t\t\t\t\"replication\": {\n" +
					"\t\t\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"replicas\": 1\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"memoryLimit\": 524288000\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"gitSource\": {\n" +
					"\t\t\t\t\t\t\"owner\": \"soajs\",\n" +
					"\t\t\t\t\t\t\"repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\"branch\": \"master\",\n" +
					"\t\t\t\t\t\t\"commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"action\": \"rebuild\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"infra\": infra\n" +
					"\t\t},\n" +
					"\t\t'mongoDeploy': {\n" +
					"\t\t\t\"strategy\": \"docker\",\n" +
					"\t\t\t\"driver\": \"docker.remote\",\n" +
					"\t\t\t\"env\": \"bloooom\",\n" +
					"\t\t\t\"deployerConfig\": {\n" +
					"\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"soajs\": soajs,\n" +
					"\t\t\t\"params\": {\n" +
					"\t\t\t\t\"data\": {\n" +
					"\t\t\t\t\t\"variables\": {\n" +
					"\t\t\t\t\t\t\"$SOAJS_EXTKEY\": \"\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_NB\": 1,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_IP_1\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PORT_1\": 27017,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PREFIX\": \"local_\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"catalog\": {\n" +
					"\t\t\t\t\t\"_id\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\"name\": \"Mongo Recipe\",\n" +
					"\t\t\t\t\t\"type\": \"cluster\",\n" +
					"\t\t\t\t\t\"subtype\": \"mongo\",\n" +
					"\t\t\t\t\t\"description\": \"This recipe allows you to deploy a mongo server\",\n" +
					"\t\t\t\t\t\"locked\": true,\n" +
					"\t\t\t\t\t\"recipe\": {\n" +
					"\t\t\t\t\t\t\"deployOptions\": {\n" +
					"\t\t\t\t\t\t\t\"image\": {\n" +
					"\t\t\t\t\t\t\t\t\"prefix\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\t\"tag\": \"3.4.10\",\n" +
					"\t\t\t\t\t\t\t\t\"pullPolicy\": \"IfNotPresent\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"sourceCode\": {\n" +
					"\t\t\t\t\t\t\t\t\"configuration\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"label\": \"Attach Custom Configuration\",\n" +
					"\t\t\t\t\t\t\t\t\t\"repo\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\t\"branch\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\t\"required\": false\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"readinessProbe\": {\n" +
					"\t\t\t\t\t\t\t\t\"httpGet\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"path\": \"/\",\n" +
					"\t\t\t\t\t\t\t\t\t\"port\": 27017\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"initialDelaySeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"timeoutSeconds\": 2,\n" +
					"\t\t\t\t\t\t\t\t\"periodSeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"successThreshold\": 1,\n" +
					"\t\t\t\t\t\t\t\t\"failureThreshold\": 3\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"restartPolicy\": {\n" +
					"\t\t\t\t\t\t\t\t\"condition\": \"any\",\n" +
					"\t\t\t\t\t\t\t\t\"maxAttempts\": 5\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"container\": {\n" +
					"\t\t\t\t\t\t\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\t\t\t\t\t\t\"workingDir\": \"\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"voluming\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"custom-mongo-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/data/db/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\"kubernetes\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"custom-mongo-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"hostPath\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\t\"path\": \"/data/custom/db/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volumeMount\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"mountPath\": \"/data/db/\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"custom-mongo-volume\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 27017,\n" +
					"\t\t\t\t\t\t\t\t\t\"isPublished\": true,\n" +
					"\t\t\t\t\t\t\t\t\t\"published\": 2017,\n" +
					"\t\t\t\t\t\t\t\t\t\"preserveClientIP\": true\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"certificates\": \"optional\"\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"buildOptions\": {\n" +
					"\t\t\t\t\t\t\t\"env\": {},\n" +
					"\t\t\t\t\t\t\t\"cmd\": {\n" +
					"\t\t\t\t\t\t\t\t\"deploy\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"command\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"mongod\"\n" +
					"\t\t\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\t\t\"args\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"--smallfiles\"\n" +
					"\t\t\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"inputmaskData\": {\n" +
					"\t\t\t\t\t\"env\": \"BLOOOOM\",\n" +
					"\t\t\t\t\t\"recipe\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\"deployConfig\": {\n" +
					"\t\t\t\t\t\t\"type\": \"container\",\n" +
					"\t\t\t\t\t\t\"memoryLimit\": 581959680,\n" +
					"\t\t\t\t\t\t\"replication\": {\n" +
					"\t\t\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"replicas\": 1\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"custom\": {\n" +
					"\t\t\t\t\t\t\"name\": \"mongotest\",\n" +
					"\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\t\"target\": 27017,\n" +
					"\t\t\t\t\t\t\t\t\"isPublished\": true,\n" +
					"\t\t\t\t\t\t\t\t\"published\": 270\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"loadBalancer\": false,\n" +
					"\t\t\t\t\t\t\"secrets\": [{\n" +
					"\t\t\t\t\t\t\t\"id\": \"!231\",\n" +
					"\t\t\t\t\t\t\t\"name\": \"test-secret-1\",\n" +
					"\t\t\t\t\t\t\t\"mountPath\": \"secretPath\"\n" +
					"\t\t\t\t\t\t}],\n" +
					"\t\t\t\t\t\t\"type\": \"resource\",\n" +
					"\t\t\t\t\t\t\"sourceCode\": {},\n" +
					"\t\t\t\t\t\t\"resourceId\": \"5b0801ec88d1aa55c1f84a0f\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"action\": \"deploy\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"infra\": infra\n" +
					"\t\t},\n" +
					"\t\t'mongoReDeploy': {\n" +
					"\t\t\t\"strategy\": \"docker\",\n" +
					"\t\t\t\"driver\": \"docker.remote\",\n" +
					"\t\t\t\"env\": \"bloooom\",\n" +
					"\t\t\t\"deployerConfig\": {\n" +
					"\t\t\t\t\"apiPort\": 443,\n" +
					"\t\t\t\t\"nodes\": \"192.168.61.51\",\n" +
					"\t\t\t\t\"apiProtocol\": \"https\",\n" +
					"\t\t\t\t\"auth\": {\n" +
					"\t\t\t\t\t\"token\": \"\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"soajs\": soajs,\n" +
					"\t\t\t\"params\": {\n" +
					"\t\t\t\t\"data\": {\n" +
					"\t\t\t\t\t\"variables\": {\n" +
					"\t\t\t\t\t\t\"$SOAJS_EXTKEY\": \"\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_NB\": 1,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_IP_1\": \"192.168.61.51\",\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PORT_1\": 27017,\n" +
					"\t\t\t\t\t\t\"$SOAJS_MONGO_PREFIX\": \"local_\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"catalog\": {\n" +
					"\t\t\t\t\t\"_id\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\"name\": \"Mongo Recipe\",\n" +
					"\t\t\t\t\t\"type\": \"cluster\",\n" +
					"\t\t\t\t\t\"subtype\": \"mongo\",\n" +
					"\t\t\t\t\t\"description\": \"This recipe allows you to deploy a mongo server\",\n" +
					"\t\t\t\t\t\"locked\": true,\n" +
					"\t\t\t\t\t\"recipe\": {\n" +
					"\t\t\t\t\t\t\"deployOptions\": {\n" +
					"\t\t\t\t\t\t\t\"image\": {\n" +
					"\t\t\t\t\t\t\t\t\"prefix\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\"name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\t\"tag\": \"3.4.10\",\n" +
					"\t\t\t\t\t\t\t\t\"pullPolicy\": \"IfNotPresent\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"sourceCode\": {\n" +
					"\t\t\t\t\t\t\t\t\"configuration\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"label\": \"Attach Custom Configuration\",\n" +
					"\t\t\t\t\t\t\t\t\t\"repo\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\t\"branch\": \"\",\n" +
					"\t\t\t\t\t\t\t\t\t\"required\": false\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"readinessProbe\": {\n" +
					"\t\t\t\t\t\t\t\t\"httpGet\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"path\": \"/\",\n" +
					"\t\t\t\t\t\t\t\t\t\"port\": 27017\n" +
					"\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\"initialDelaySeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"timeoutSeconds\": 2,\n" +
					"\t\t\t\t\t\t\t\t\"periodSeconds\": 5,\n" +
					"\t\t\t\t\t\t\t\t\"successThreshold\": 1,\n" +
					"\t\t\t\t\t\t\t\t\"failureThreshold\": 3\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"restartPolicy\": {\n" +
					"\t\t\t\t\t\t\t\t\"condition\": \"any\",\n" +
					"\t\t\t\t\t\t\t\t\"maxAttempts\": 5\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"container\": {\n" +
					"\t\t\t\t\t\t\t\t\"network\": \"soajsnet\",\n" +
					"\t\t\t\t\t\t\t\t\"workingDir\": \"\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\"voluming\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"docker\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Source\": \"custom-mongo-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"Target\": \"/data/db/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\"kubernetes\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volume\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"custom-mongo-volume\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"hostPath\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\t\"path\": \"/data/custom/db/\"\n" +
					"\t\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t\t\t\t\"volumeMount\": {\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"mountPath\": \"/data/db/\",\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\"name\": \"custom-mongo-volume\"\n" +
					"\t\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"ports\": [\n" +
					"\t\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\t\"name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\t\t\"target\": 27017,\n" +
					"\t\t\t\t\t\t\t\t\t\"isPublished\": true,\n" +
					"\t\t\t\t\t\t\t\t\t\"published\": 2017\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\"certificates\": \"optional\"\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"buildOptions\": {\n" +
					"\t\t\t\t\t\t\t\"env\": {},\n" +
					"\t\t\t\t\t\t\t\"cmd\": {\n" +
					"\t\t\t\t\t\t\t\t\"deploy\": {\n" +
					"\t\t\t\t\t\t\t\t\t\"command\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"mongod\"\n" +
					"\t\t\t\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\t\t\t\"args\": [\n" +
					"\t\t\t\t\t\t\t\t\t\t\"--smallfiles\"\n" +
					"\t\t\t\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"inputmaskData\": {\n" +
					"\t\t\t\t\t\"env\": \"BLOOOOM\",\n" +
					"\t\t\t\t\t\"serviceId\": \"9xabk0pf9wdfdul8vh913jvqs\",\n" +
					"\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\"action\": \"rebuild\",\n" +
					"\t\t\t\t\t\"custom\": {\n" +
					"\t\t\t\t\t\t\"image\": {},\n" +
					"\t\t\t\t\t\t\"sourceCode\": {},\n" +
					"\t\t\t\t\t\t\"ports\": [{\n" +
					"\t\t\t\t\t\t\tname: 'mongo',\n" +
					"\t\t\t\t\t\t\ttarget: 27017,\n" +
					"\t\t\t\t\t\t\tisPublished: true,\n" +
					"\t\t\t\t\t\t\tpublished: 270,\n" +
					"\t\t\t\t\t\t\tpreserveClientIP: true\n" +
					"\t\t\t\t\t\t}],\n" +
					"\t\t\t\t\t\t\"secrets\": [{\n" +
					"\t\t\t\t\t\t\t\"id\": \"!231\",\n" +
					"\t\t\t\t\t\t\t\"name\": \"test-secret-1\",\n" +
					"\t\t\t\t\t\t\t\"mountPath\": \"secretPath\"\n" +
					"\t\t\t\t\t\t}],\n" +
					"\t\t\t\t\t\t\"name\": \"mongotest\",\n" +
					"\t\t\t\t\t\t\"resourceId\": \"5b0801ec88d1aa55c1f84a0f\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"namespace\": \"\",\n" +
					"\t\t\t\t\t\"recipe\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\"imageLastTs\": \"1515128013261\",\n" +
					"\t\t\t\t\t\"deployConfig\": {\n" +
					"\t\t\t\t\t\t\"replication\": {\n" +
					"\t\t\t\t\t\t\t\"mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"replicas\": 1\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"memoryLimit\": 524288000\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"action\": \"rebuild\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"infra\": infra\n" +
					"\t\t},\n" +
					"\t\t\"inspectService\": {\n" +
					"\t\t\t\"ID\": \"9xabk0pf9wdfdul8vh913jvqs\",\n" +
					"\t\t\t\"Version\": {\n" +
					"\t\t\t\t\"Index\": 355\n" +
					"\t\t\t},\n" +
					"\t\t\t\"CreatedAt\": \"2018-05-25T12:51:30.413401783Z\",\n" +
					"\t\t\t\"UpdatedAt\": \"2018-05-25T15:34:03.765167021Z\",\n" +
					"\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\"Name\": \"mongotest\",\n" +
					"\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\"service.image.name\": \"mongo\",\n" +
					"\t\t\t\t\t\"service.image.tag\": \"3.4.10\",\n" +
					"\t\t\t\t\t\"service.image.ts\": \"1515128013261\",\n" +
					"\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\"soajs.resource.id\": \"5b0801ec88d1aa55c1f84a0f\",\n" +
					"\t\t\t\t\t\"soajs.service.group\": \"Other\",\n" +
					"\t\t\t\t\t\"soajs.service.label\": \"mongotest\",\n" +
					"\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\"soajs.service.name\": \"mongotest\",\n" +
					"\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\"soajs.service.subtype\": \"mongo\",\n" +
					"\t\t\t\t\t\"soajs.service.type\": \"cluster\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"TaskTemplate\": {\n" +
					"\t\t\t\t\t\"ContainerSpec\": {\n" +
					"\t\t\t\t\t\t\"Image\": \"mongo:3.4.10\",\n" +
					"\t\t\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\t\t\"service.image.name\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\"service.image.tag\": \"3.4.10\",\n" +
					"\t\t\t\t\t\t\t\"service.image.ts\": \"1515128013261\",\n" +
					"\t\t\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b871065c\",\n" +
					"\t\t\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\t\t\"soajs.resource.id\": \"5b0801ec88d1aa55c1f84a0f\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.group\": \"Other\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.label\": \"mongotest\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.name\": \"mongotest\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.subtype\": \"mongo\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.type\": \"cluster\"\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Command\": [\n" +
					"\t\t\t\t\t\t\t\"mongod\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Args\": [\n" +
					"\t\t\t\t\t\t\t\"--smallfiles\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Mounts\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"custom-mongo-volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/data/db/\"\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Isolation\": \"default\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\"Limits\": {\n" +
					"\t\t\t\t\t\t\t\"MemoryBytes\": 524288000\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"RestartPolicy\": {\n" +
					"\t\t\t\t\t\t\"Condition\": \"any\",\n" +
					"\t\t\t\t\t\t\"MaxAttempts\": 5\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"ForceUpdate\": 0,\n" +
					"\t\t\t\t\t\"Runtime\": \"container\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Mode\": {\n" +
					"\t\t\t\t\t\"Replicated\": {\n" +
					"\t\t\t\t\t\t\"Replicas\": 1\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"UpdateConfig\": {\n" +
					"\t\t\t\t\t\"Parallelism\": 2,\n" +
					"\t\t\t\t\t\"Delay\": 500,\n" +
					"\t\t\t\t\t\"FailureAction\": \"pause\",\n" +
					"\t\t\t\t\t\"MaxFailureRatio\": 0,\n" +
					"\t\t\t\t\t\"Order\": \"stop-first\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Networks\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"Target\": \"ifaxhwl3dy2ymt3cebxbufnaq\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"EndpointSpec\": {\n" +
					"\t\t\t\t\t\"Mode\": \"vip\",\n" +
					"\t\t\t\t\t\"Ports\": [\n" +
					"\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\"Protocol\": \"tcp\",\n" +
					"\t\t\t\t\t\t\t\"TargetPort\": 27017,\n" +
					"\t\t\t\t\t\t\t\"PublishedPort\": 32017,\n" +
					"\t\t\t\t\t\t\t\"PublishMode\": \"host\"\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t]\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"Endpoint\": {\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"Mode\": \"vip\",\n" +
					"\t\t\t\t\t\"Ports\": [\n" +
					"\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\"Protocol\": \"tcp\",\n" +
					"\t\t\t\t\t\t\t\"TargetPort\": 27017,\n" +
					"\t\t\t\t\t\t\t\"PublishedPort\": 32017,\n" +
					"\t\t\t\t\t\t\t\"PublishMode\": \"host\"\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t]\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Ports\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"Protocol\": \"tcp\",\n" +
					"\t\t\t\t\t\t\"TargetPort\": 27017,\n" +
					"\t\t\t\t\t\t\"PublishedPort\": 32017,\n" +
					"\t\t\t\t\t\t\"PublishMode\": \"host\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"VirtualIPs\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"NetworkID\": \"uc19ia2f6u4ng4qbiz07h9jx2\",\n" +
					"\t\t\t\t\t\t\"Addr\": \"10.255.0.5/16\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"NetworkID\": \"ifaxhwl3dy2ymt3cebxbufnaq\",\n" +
					"\t\t\t\t\t\t\"Addr\": \"10.0.0.8/24\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t]\n" +
					"\t\t\t}\n" +
					"\t\t},\n" +
					"\t\t\"inspectController\": {\n" +
					"\t\t\t\"ID\": \"5aornksipp1ulqs0ojcebamcd\",\n" +
					"\t\t\t\"Version\": {\n" +
					"\t\t\t\t\"Index\": 783\n" +
					"\t\t\t},\n" +
					"\t\t\t\"CreatedAt\": \"2018-05-29T14:50:32.65380385Z\",\n" +
					"\t\t\t\"UpdatedAt\": \"2018-05-30T10:32:20.583172614Z\",\n" +
					"\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\"Name\": \"bloooom-controller\",\n" +
					"\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\"service.branch\": \"master\",\n" +
					"\t\t\t\t\t\"service.commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\",\n" +
					"\t\t\t\t\t\"service.image.name\": \"soajs\",\n" +
					"\t\t\t\t\t\"service.image.prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\"service.image.tag\": \"latest\",\n" +
					"\t\t\t\t\t\"service.image.ts\": \"1522243952636\",\n" +
					"\t\t\t\t\t\"service.owner\": \"soajs\",\n" +
					"\t\t\t\t\t\"service.repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"soajs.content\": \"true\",\n" +
					"\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\"soajs.service.group\": \"soajs-core-services\",\n" +
					"\t\t\t\t\t\"soajs.service.label\": \"bloooom-controller\",\n" +
					"\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\"soajs.service.name\": \"controller\",\n" +
					"\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\"soajs.service.repo.name\": \"soajs-controller\",\n" +
					"\t\t\t\t\t\"soajs.service.subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\"soajs.service.type\": \"service\",\n" +
					"\t\t\t\t\t\"soajs.service.version\": \"1\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"TaskTemplate\": {\n" +
					"\t\t\t\t\t\"ContainerSpec\": {\n" +
					"\t\t\t\t\t\t\"Image\": \"soajsorg/soajs:latest\",\n" +
					"\t\t\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\t\t\"service.branch\": \"master\",\n" +
					"\t\t\t\t\t\t\t\"service.commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\",\n" +
					"\t\t\t\t\t\t\t\"service.image.name\": \"soajs\",\n" +
					"\t\t\t\t\t\t\t\"service.image.prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\t\t\"service.image.tag\": \"latest\",\n" +
					"\t\t\t\t\t\t\t\"service.image.ts\": \"1522243952636\",\n" +
					"\t\t\t\t\t\t\t\"service.owner\": \"soajs\",\n" +
					"\t\t\t\t\t\t\t\"service.repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\t\t\"soajs.content\": \"true\",\n" +
					"\t\t\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.group\": \"soajs-core-services\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.label\": \"bloooom-controller\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.name\": \"controller\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.repo.name\": \"soajs-controller\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.type\": \"service\",\n" +
					"\t\t\t\t\t\t\t\"soajs.service.version\": \"1\"\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Command\": [\n" +
					"\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Args\": [\n" +
					"\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Env\": [\n" +
					"\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED=0\",\n" +
					"\t\t\t\t\t\t\t\"NODE_ENV=production\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_ENV=bloooom\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST=true\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY=500\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA=swarm\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_HA_NAME={{.Task.Name}}\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_NB=1\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX=local_\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_IP_1=192.168.61.51\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT_1=27017\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER=github\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN=github.com\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER=soajs\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_REPO=soajs.controller\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH=master\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Dir\": \"/opt/soajs/deployer/\",\n" +
					"\t\t\t\t\t\t\"Mounts\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"ReadOnly\": true\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"StopGracePeriod\": 10000000000,\n" +
					"\t\t\t\t\t\t\"DNSConfig\": {},\n" +
					"\t\t\t\t\t\t\"Isolation\": \"default\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\"Limits\": {\n" +
					"\t\t\t\t\t\t\t\"MemoryBytes\": 524288000\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"RestartPolicy\": {\n" +
					"\t\t\t\t\t\t\"Condition\": \"any\",\n" +
					"\t\t\t\t\t\t\"Delay\": 5000000000,\n" +
					"\t\t\t\t\t\t\"MaxAttempts\": 5\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Placement\": {},\n" +
					"\t\t\t\t\t\"ForceUpdate\": 0,\n" +
					"\t\t\t\t\t\"Runtime\": \"container\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Mode\": {\n" +
					"\t\t\t\t\t\"Replicated\": {\n" +
					"\t\t\t\t\t\t\"Replicas\": 1\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"UpdateConfig\": {\n" +
					"\t\t\t\t\t\"Parallelism\": 2,\n" +
					"\t\t\t\t\t\"Delay\": 500,\n" +
					"\t\t\t\t\t\"FailureAction\": \"pause\",\n" +
					"\t\t\t\t\t\"Monitor\": 5000000000,\n" +
					"\t\t\t\t\t\"MaxFailureRatio\": 0,\n" +
					"\t\t\t\t\t\"Order\": \"stop-first\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"RollbackConfig\": {\n" +
					"\t\t\t\t\t\"Parallelism\": 1,\n" +
					"\t\t\t\t\t\"FailureAction\": \"pause\",\n" +
					"\t\t\t\t\t\"Monitor\": 5000000000,\n" +
					"\t\t\t\t\t\"MaxFailureRatio\": 0,\n" +
					"\t\t\t\t\t\"Order\": \"stop-first\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Networks\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"Target\": \"ifaxhwl3dy2ymt3cebxbufnaq\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"EndpointSpec\": {\n" +
					"\t\t\t\t\t\"Mode\": \"vip\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"PreviousSpec\": {\n" +
					"\t\t\t\t\"Name\": \"bloooom-controller\",\n" +
					"\t\t\t\t\"Labels\": {\n" +
					"\t\t\t\t\t\"memoryLimit\": \"500\",\n" +
					"\t\t\t\t\t\"service.branch\": \"master\",\n" +
					"\t\t\t\t\t\"service.commit\": \"468588b0a89e55020f26b805be0ff02e0f31a7d8\",\n" +
					"\t\t\t\t\t\"service.image.name\": \"soajs\",\n" +
					"\t\t\t\t\t\"service.image.prefix\": \"soajsorg\",\n" +
					"\t\t\t\t\t\"service.image.tag\": \"latest\",\n" +
					"\t\t\t\t\t\"service.image.ts\": \"1522243952636\",\n" +
					"\t\t\t\t\t\"service.owner\": \"soajs\",\n" +
					"\t\t\t\t\t\"service.repo\": \"soajs.controller\",\n" +
					"\t\t\t\t\t\"soajs.catalog.id\": \"5ad9cab35c967d35b8710658\",\n" +
					"\t\t\t\t\t\"soajs.content\": \"true\",\n" +
					"\t\t\t\t\t\"soajs.env.code\": \"bloooom\",\n" +
					"\t\t\t\t\t\"soajs.service.group\": \"soajs-core-services\",\n" +
					"\t\t\t\t\t\"soajs.service.label\": \"bloooom-controller\",\n" +
					"\t\t\t\t\t\"soajs.service.mode\": \"replicated\",\n" +
					"\t\t\t\t\t\"soajs.service.name\": \"controller\",\n" +
					"\t\t\t\t\t\"soajs.service.replicas\": \"1\",\n" +
					"\t\t\t\t\t\"soajs.service.repo.name\": \"soajs-controller\",\n" +
					"\t\t\t\t\t\"soajs.service.subtype\": \"soajs\",\n" +
					"\t\t\t\t\t\"soajs.service.type\": \"service\",\n" +
					"\t\t\t\t\t\"soajs.service.version\": \"1\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"TaskTemplate\": {\n" +
					"\t\t\t\t\t\"ContainerSpec\": {\n" +
					"\t\t\t\t\t\t\"Image\": \"soajsorg/soajs:latest\",\n" +
					"\t\t\t\t\t\t\"Command\": [\n" +
					"\t\t\t\t\t\t\t\"bash\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Args\": [\n" +
					"\t\t\t\t\t\t\t\"-c\",\n" +
					"\t\t\t\t\t\t\t\"node index.js -T service\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Env\": [\n" +
					"\t\t\t\t\t\t\t\"NODE_TLS_REJECT_UNAUTHORIZED=0\",\n" +
					"\t\t\t\t\t\t\t\"NODE_ENV=production\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_ENV=bloooom\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_AUTOREGISTERHOST=true\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_SRV_MEMORY=500\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_DEPLOY_HA=swarm\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_HA_NAME={{.Task.Name}}\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_NB=1\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PREFIX=local_\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_IP_1=192.168.61.51\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_MONGO_PORT_1=27017\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_PROVIDER=github\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_DOMAIN=github.com\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_OWNER=soajs\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_REPO=soajs.controller\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_BRANCH=master\",\n" +
					"\t\t\t\t\t\t\t\"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8\"\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Dir\": \"/opt/soajs/deployer/\",\n" +
					"\t\t\t\t\t\t\"Mounts\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_log_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/log/soajs/\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"bind\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/run/docker.sock\",\n" +
					"\t\t\t\t\t\t\t\t\"ReadOnly\": true\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Source\": \"soajs_certs_volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Target\": \"/var/certs/soajs/\"\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t],\n" +
					"\t\t\t\t\t\t\"Isolation\": \"default\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\"Limits\": {\n" +
					"\t\t\t\t\t\t\t\"MemoryBytes\": 524288000\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"RestartPolicy\": {\n" +
					"\t\t\t\t\t\t\"Condition\": \"any\",\n" +
					"\t\t\t\t\t\t\"MaxAttempts\": 5\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"ForceUpdate\": 0,\n" +
					"\t\t\t\t\t\"Runtime\": \"container\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Mode\": {\n" +
					"\t\t\t\t\t\"Replicated\": {\n" +
					"\t\t\t\t\t\t\"Replicas\": 1\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"UpdateConfig\": {\n" +
					"\t\t\t\t\t\"Parallelism\": 2,\n" +
					"\t\t\t\t\t\"Delay\": 500,\n" +
					"\t\t\t\t\t\"FailureAction\": \"pause\",\n" +
					"\t\t\t\t\t\"MaxFailureRatio\": 0,\n" +
					"\t\t\t\t\t\"Order\": \"stop-first\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Networks\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"Target\": \"ifaxhwl3dy2ymt3cebxbufnaq\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"EndpointSpec\": {\n" +
					"\t\t\t\t\t\"Mode\": \"vip\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"Endpoint\": {\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"Mode\": \"vip\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"VirtualIPs\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"NetworkID\": \"ifaxhwl3dy2ymt3cebxbufnaq\",\n" +
					"\t\t\t\t\t\t\"Addr\": \"10.0.0.15/24\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t]\n" +
					"\t\t\t},\n" +
					"\t\t\t\"UpdateStatus\": {\n" +
					"\t\t\t\t\"State\": \"completed\",\n" +
					"\t\t\t\t\"StartedAt\": \"2018-05-30T10:31:58.658661159Z\",\n" +
					"\t\t\t\t\"CompletedAt\": \"2018-05-30T10:32:20.583145375Z\",\n" +
					"\t\t\t\t\"Message\": \"update completed\"\n" +
					"\t\t\t}\n" +
					"\t\t},\n" +
					"\t\t'secretList': [\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"ID\": \"f6xlz2x8ysma2vu5qft8v3cp1\",\n" +
					"\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\"Index\": 336\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"CreatedAt\": \"2018-05-25T14:54:21.995660612Z\",\n" +
					"\t\t\t\t\"UpdatedAt\": \"2018-05-25T14:54:21.995660612Z\",\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"Name\": \"test-secret-1\",\n" +
					"\t\t\t\t\t\"Labels\": {}\n" +
					"\t\t\t\t}\n" +
					"\t\t\t}\n" +
					"\t\t],\n" +
					"\t\t'swarmInspect': {\n" +
					"\t\t\t\"ID\": \"7uj3u0ahc78lfjkzaxr9253e6\",\n" +
					"\t\t\t\"Version\": {\n" +
					"\t\t\t\t\"Index\": 10\n" +
					"\t\t\t},\n" +
					"\t\t\t\"CreatedAt\": \"2018-05-22T15:19:53.799465313Z\",\n" +
					"\t\t\t\"UpdatedAt\": \"2018-05-22T15:19:54.32380318Z\",\n" +
					"\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\"Name\": \"default\",\n" +
					"\t\t\t\t\"Labels\": {},\n" +
					"\t\t\t\t\"Orchestration\": {\n" +
					"\t\t\t\t\t\"TaskHistoryRetentionLimit\": 5\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Raft\": {\n" +
					"\t\t\t\t\t\"SnapshotInterval\": 10000,\n" +
					"\t\t\t\t\t\"KeepOldSnapshots\": 0,\n" +
					"\t\t\t\t\t\"LogEntriesForSlowFollowers\": 500,\n" +
					"\t\t\t\t\t\"ElectionTick\": 10,\n" +
					"\t\t\t\t\t\"HeartbeatTick\": 1\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Dispatcher\": {\n" +
					"\t\t\t\t\t\"HeartbeatPeriod\": 5000000000\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"CAConfig\": {\n" +
					"\t\t\t\t\t\"NodeCertExpiry\": 7776000000000000\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"TaskDefaults\": {},\n" +
					"\t\t\t\t\"EncryptionConfig\": {\n" +
					"\t\t\t\t\t\"AutoLockManagers\": false\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"TLSInfo\": {\n" +
					"\t\t\t\t\"TrustRoot\": \"\",\n" +
					"\t\t\t\t\"CertIssuerSubject\": \"\",\n" +
					"\t\t\t\t\"CertIssuerPublicKey\": \"\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"RootRotationInProgress\": false,\n" +
					"\t\t\t\"JoinTokens\": {\n" +
					"\t\t\t\t\"Worker\": \"\",\n" +
					"\t\t\t\t\"Manager\": \"\"\n" +
					"\t\t\t}\n" +
					"\t\t},\n" +
					"\t\t'dockerInfo': {\n" +
					"\t\t\t\"ID\": \"2ITV:ZV7F:VCKC:TGD5:O4G7:W57I:AYZC:4ETB:N3D5:BKLD:URR6:BQX5\",\n" +
					"\t\t\t\"Containers\": 13,\n" +
					"\t\t\t\"ContainersRunning\": 7,\n" +
					"\t\t\t\"ContainersPaused\": 0,\n" +
					"\t\t\t\"ContainersStopped\": 6,\n" +
					"\t\t\t\"Images\": 24,\n" +
					"\t\t\t\"Driver\": \"overlay2\",\n" +
					"\t\t\t\"DriverStatus\": [\n" +
					"\t\t\t\t[\n" +
					"\t\t\t\t\t\"Backing Filesystem\",\n" +
					"\t\t\t\t\t\"extfs\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t[\n" +
					"\t\t\t\t\t\"Supports d_type\",\n" +
					"\t\t\t\t\t\"true\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t[\n" +
					"\t\t\t\t\t\"Native Overlay Diff\",\n" +
					"\t\t\t\t\t\"true\"\n" +
					"\t\t\t\t]\n" +
					"\t\t\t],\n" +
					"\t\t\t\"SystemStatus\": null,\n" +
					"\t\t\t\"Plugins\": {\n" +
					"\t\t\t\t\"Volume\": [\n" +
					"\t\t\t\t\t\"local\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"Network\": [\n" +
					"\t\t\t\t\t\"bridge\",\n" +
					"\t\t\t\t\t\"host\",\n" +
					"\t\t\t\t\t\"ipvlan\",\n" +
					"\t\t\t\t\t\"macvlan\",\n" +
					"\t\t\t\t\t\"null\",\n" +
					"\t\t\t\t\t\"overlay\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"Authorization\": null,\n" +
					"\t\t\t\t\"Log\": [\n" +
					"\t\t\t\t\t\"awslogs\",\n" +
					"\t\t\t\t\t\"fluentd\",\n" +
					"\t\t\t\t\t\"gcplogs\",\n" +
					"\t\t\t\t\t\"gelf\",\n" +
					"\t\t\t\t\t\"journald\",\n" +
					"\t\t\t\t\t\"json-file\",\n" +
					"\t\t\t\t\t\"logentries\",\n" +
					"\t\t\t\t\t\"splunk\",\n" +
					"\t\t\t\t\t\"syslog\"\n" +
					"\t\t\t\t]\n" +
					"\t\t\t},\n" +
					"\t\t\t\"MemoryLimit\": true,\n" +
					"\t\t\t\"SwapLimit\": true,\n" +
					"\t\t\t\"KernelMemory\": true,\n" +
					"\t\t\t\"CpuCfsPeriod\": true,\n" +
					"\t\t\t\"CpuCfsQuota\": true,\n" +
					"\t\t\t\"CPUShares\": true,\n" +
					"\t\t\t\"CPUSet\": true,\n" +
					"\t\t\t\"IPv4Forwarding\": true,\n" +
					"\t\t\t\"BridgeNfIptables\": true,\n" +
					"\t\t\t\"BridgeNfIp6tables\": true,\n" +
					"\t\t\t\"Debug\": true,\n" +
					"\t\t\t\"NFd\": 71,\n" +
					"\t\t\t\"OomKillDisable\": true,\n" +
					"\t\t\t\"NGoroutines\": 212,\n" +
					"\t\t\t\"SystemTime\": \"2018-05-28T14:30:35.820838079Z\",\n" +
					"\t\t\t\"LoggingDriver\": \"json-file\",\n" +
					"\t\t\t\"CgroupDriver\": \"cgroupfs\",\n" +
					"\t\t\t\"NEventsListener\": 5,\n" +
					"\t\t\t\"KernelVersion\": \"4.9.87-linuxkit-aufs\",\n" +
					"\t\t\t\"OperatingSystem\": \"Docker for Mac\",\n" +
					"\t\t\t\"OSType\": \"linux\",\n" +
					"\t\t\t\"Architecture\": \"x86_64\",\n" +
					"\t\t\t\"IndexServerAddress\": \"https://index.docker.io/v1/\",\n" +
					"\t\t\t\"RegistryConfig\": {\n" +
					"\t\t\t\t\"AllowNondistributableArtifactsCIDRs\": [],\n" +
					"\t\t\t\t\"AllowNondistributableArtifactsHostnames\": [],\n" +
					"\t\t\t\t\"InsecureRegistryCIDRs\": [\n" +
					"\t\t\t\t\t\"127.0.0.0/8\"\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"IndexConfigs\": {\n" +
					"\t\t\t\t\t\"docker.io\": {\n" +
					"\t\t\t\t\t\t\"Name\": \"docker.io\",\n" +
					"\t\t\t\t\t\t\"Mirrors\": [],\n" +
					"\t\t\t\t\t\t\"Secure\": true,\n" +
					"\t\t\t\t\t\t\"Official\": true\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Mirrors\": []\n" +
					"\t\t\t},\n" +
					"\t\t\t\"NCPU\": 6,\n" +
					"\t\t\t\"MemTotal\": 8360284160,\n" +
					"\t\t\t\"GenericResources\": null,\n" +
					"\t\t\t\"DockerRootDir\": \"/var/lib/docker\",\n" +
					"\t\t\t\"HttpProxy\": \"gateway.docker.internal:3128\",\n" +
					"\t\t\t\"HttpsProxy\": \"gateway.docker.internal:3129\",\n" +
					"\t\t\t\"NoProxy\": \"\",\n" +
					"\t\t\t\"Name\": \"linuxkit-025000000001\",\n" +
					"\t\t\t\"Labels\": [],\n" +
					"\t\t\t\"ExperimentalBuild\": true,\n" +
					"\t\t\t\"ServerVersion\": \"18.05.0-ce\",\n" +
					"\t\t\t\"ClusterStore\": \"\",\n" +
					"\t\t\t\"ClusterAdvertise\": \"\",\n" +
					"\t\t\t\"Runtimes\": {\n" +
					"\t\t\t\t\"runc\": {\n" +
					"\t\t\t\t\t\"path\": \"docker-runc\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"DefaultRuntime\": \"runc\",\n" +
					"\t\t\t\"Swarm\": {\n" +
					"\t\t\t\t\"NodeID\": \"mwdhuz0wfj6e9d40175g8kpge\",\n" +
					"\t\t\t\t\"NodeAddr\": \"192.168.65.3\",\n" +
					"\t\t\t\t\"LocalNodeState\": \"active\",\n" +
					"\t\t\t\t\"ControlAvailable\": true,\n" +
					"\t\t\t\t\"Error\": \"\",\n" +
					"\t\t\t\t\"RemoteManagers\": [\n" +
					"\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\"NodeID\": \"mwdhuz0wfj6e9d40175g8kpge\",\n" +
					"\t\t\t\t\t\t\"Addr\": \"192.168.65.3:2377\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t],\n" +
					"\t\t\t\t\"Nodes\": 1,\n" +
					"\t\t\t\t\"Managers\": 1,\n" +
					"\t\t\t\t\"Cluster\": {\n" +
					"\t\t\t\t\t\"ID\": \"7uj3u0ahc78lfjkzaxr9253e6\",\n" +
					"\t\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\t\"Index\": 10\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"CreatedAt\": \"2018-05-22T15:19:53.799465313Z\",\n" +
					"\t\t\t\t\t\"UpdatedAt\": \"2018-05-22T15:19:54.32380318Z\",\n" +
					"\t\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\t\"Name\": \"default\",\n" +
					"\t\t\t\t\t\t\"Labels\": {},\n" +
					"\t\t\t\t\t\t\"Orchestration\": {\n" +
					"\t\t\t\t\t\t\t\"TaskHistoryRetentionLimit\": 5\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Raft\": {\n" +
					"\t\t\t\t\t\t\t\"SnapshotInterval\": 10000,\n" +
					"\t\t\t\t\t\t\t\"KeepOldSnapshots\": 0,\n" +
					"\t\t\t\t\t\t\t\"LogEntriesForSlowFollowers\": 500,\n" +
					"\t\t\t\t\t\t\t\"ElectionTick\": 10,\n" +
					"\t\t\t\t\t\t\t\"HeartbeatTick\": 1\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"Dispatcher\": {\n" +
					"\t\t\t\t\t\t\t\"HeartbeatPeriod\": 5000000000\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"CAConfig\": {\n" +
					"\t\t\t\t\t\t\t\"NodeCertExpiry\": 7776000000000000\n" +
					"\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\"TaskDefaults\": {},\n" +
					"\t\t\t\t\t\t\"EncryptionConfig\": {\n" +
					"\t\t\t\t\t\t\t\"AutoLockManagers\": false\n" +
					"\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"TLSInfo\": {\n" +
					"\t\t\t\t\t\t\"TrustRoot\": \"\",\n" +
					"\t\t\t\t\t\t\"CertIssuerSubject\": \"\",\n" +
					"\t\t\t\t\t\t\"CertIssuerPublicKey\": \"\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"RootRotationInProgress\": false\n" +
					"\t\t\t\t}\n" +
					"\t\t\t},\n" +
					"\t\t\t\"LiveRestoreEnabled\": false,\n" +
					"\t\t\t\"Isolation\": \"\",\n" +
					"\t\t\t\"InitBinary\": \"docker-init\",\n" +
					"\t\t\t\"ContainerdCommit\": {\n" +
					"\t\t\t\t\"ID\": \"773c489c9c1b21a6d78b5c538cd395416ec50f88\",\n" +
					"\t\t\t\t\"Expected\": \"773c489c9c1b21a6d78b5c538cd395416ec50f88\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"RuncCommit\": {\n" +
					"\t\t\t\t\"ID\": \"4fc53a81fb7c994640722ac585fa9ca548971871\",\n" +
					"\t\t\t\t\"Expected\": \"4fc53a81fb7c994640722ac585fa9ca548971871\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"InitCommit\": {\n" +
					"\t\t\t\t\"ID\": \"949e6fa\",\n" +
					"\t\t\t\t\"Expected\": \"949e6fa\"\n" +
					"\t\t\t},\n" +
					"\t\t\t\"SecurityOptions\": [\n" +
					"\t\t\t\t\"name=seccomp,profile=default\"\n" +
					"\t\t\t]\n" +
					"\t\t},\n" +
					"\t\t'nodes': [\n" +
					"\t\t\t{\n" +
					"\t\t\t\t\"ID\": \"mwdhuz0wfj6e9d40175g8kpge\",\n" +
					"\t\t\t\t\"Version\": {\n" +
					"\t\t\t\t\t\"Index\": 364\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"CreatedAt\": \"2018-05-22T15:19:53.799648998Z\",\n" +
					"\t\t\t\t\"UpdatedAt\": \"2018-05-28T09:44:00.517163845Z\",\n" +
					"\t\t\t\t\"Spec\": {\n" +
					"\t\t\t\t\t\"Labels\": {},\n" +
					"\t\t\t\t\t\"Role\": \"manager\",\n" +
					"\t\t\t\t\t\"Availability\": \"active\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Description\": {\n" +
					"\t\t\t\t\t\"Hostname\": \"linuxkit-025000000001\",\n" +
					"\t\t\t\t\t\"Platform\": {\n" +
					"\t\t\t\t\t\t\"Architecture\": \"x86_64\",\n" +
					"\t\t\t\t\t\t\"OS\": \"linux\"\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Resources\": {\n" +
					"\t\t\t\t\t\t\"NanoCPUs\": 6000000000,\n" +
					"\t\t\t\t\t\t\"MemoryBytes\": 8360284160\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"Engine\": {\n" +
					"\t\t\t\t\t\t\"EngineVersion\": \"18.05.0-ce\",\n" +
					"\t\t\t\t\t\t\"Plugins\": [\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"awslogs\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"fluentd\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"gcplogs\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"gelf\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"journald\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"json-file\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"logentries\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"splunk\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Log\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"syslog\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"bridge\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"host\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"ipvlan\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"macvlan\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"null\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Network\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"overlay\"\n" +
					"\t\t\t\t\t\t\t},\n" +
					"\t\t\t\t\t\t\t{\n" +
					"\t\t\t\t\t\t\t\t\"Type\": \"Volume\",\n" +
					"\t\t\t\t\t\t\t\t\"Name\": \"local\"\n" +
					"\t\t\t\t\t\t\t}\n" +
					"\t\t\t\t\t\t]\n" +
					"\t\t\t\t\t},\n" +
					"\t\t\t\t\t\"TLSInfo\": {\n" +
					"\t\t\t\t\t\t\"TrustRoot\": \"\",\n" +
					"\t\t\t\t\t\t\"CertIssuerSubject\": \"\",\n" +
					"\t\t\t\t\t\t\"CertIssuerPublicKey\": \"+8ulQI/+==\"\n" +
					"\t\t\t\t\t}\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"Status\": {\n" +
					"\t\t\t\t\t\"State\": \"ready\",\n" +
					"\t\t\t\t\t\"Addr\": \"192.168.65.3\"\n" +
					"\t\t\t\t},\n" +
					"\t\t\t\t\"ManagerStatus\": {\n" +
					"\t\t\t\t\t\"Leader\": true,\n" +
					"\t\t\t\t\t\"Reachability\": \"reachable\",\n" +
					"\t\t\t\t\t\"Addr\": \"192.168.65.3:2377\"\n" +
					"\t\t\t\t}\n" +
					"\t\t\t}\n" +
					"\t\t]\n" +
					"\t};\n" +
					"\treturn data;\n" +
					"};",
					"soajs.service.type": "service",
					"soajs.service.version": "1"
				},
				"TaskTemplate": {
					"ContainerSpec": {
						"Image": "soajsorg/soajs:latest",
						"Command": [
							"bash"
						],
						"Args": [
							"-c",
							"node index.js -T service"
						],
						"Env": [
							"NODE_TLS_REJECT_UNAUTHORIZED=0",
							"NODE_ENV=production",
							"SOAJS_ENV=bloooom",
							"SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js",
							"SOAJS_SRV_AUTOREGISTERHOST=true",
							"SOAJS_SRV_MEMORY=500",
							"SOAJS_DEPLOY_HA=swarm",
							"SOAJS_HA_NAME={{.Task.Name}}",
							"SOAJS_MONGO_NB=1",
							"SOAJS_MONGO_PREFIX=local_",
							"SOAJS_MONGO_IP_1=192.168.61.51",
							"SOAJS_MONGO_PORT_1=27017",
							"SOAJS_GIT_PROVIDER=github",
							"SOAJS_GIT_DOMAIN=github.com",
							"SOAJS_GIT_OWNER=soajs",
							"SOAJS_GIT_REPO=soajs.controller",
							"SOAJS_GIT_BRANCH=master",
							"SOAJS_GIT_COMMIT=468588b0a89e55020f26b805be0ff02e0f31a7d8"
						],
						"Dir": "/opt/soajs/deployer/",
						"Mounts": [
							{
								"Type": "volume",
								"Source": "soajs_log_volume",
								"Target": "/var/log/soajs/"
							},
							{
								"Type": "bind",
								"Source": "/var/run/docker.sock",
								"Target": "/var/run/docker.sock",
								"ReadOnly": true
							},
							{
								"Type": "volume",
								"Source": "soajs_certs_volume",
								"Target": "/var/certs/soajs/"
							}
						],
						"Isolation": "default"
					},
					"Resources": {
						"Limits": {
							"MemoryBytes": 524288000
						}
					},
					"RestartPolicy": {
						"Condition": "any",
						"MaxAttempts": 5
					},
					"ForceUpdate": 0,
					"Runtime": "container"
				},
				"Mode": {
					"Replicated": {
						"Replicas": 1
					}
				},
				"UpdateConfig": {
					"Parallelism": 2,
					"Delay": 500,
					"FailureAction": "pause",
					"MaxFailureRatio": 0,
					"Order": "stop-first"
				},
				"Networks": [
					{
						"Target": "ifaxhwl3dy2ymt3cebxbufnaq"
					}
				],
				"EndpointSpec": {
					"Mode": "vip"
				}
			},
			"Endpoint": {
				"Spec": {
					"Mode": "vip"
				},
				"VirtualIPs": [
					{
						"NetworkID": "ifaxhwl3dy2ymt3cebxbufnaq",
						"Addr": "10.0.0.15/24"
					}
				]
			},
			"UpdateStatus": {
				"State": "completed",
				"StartedAt": "2018-05-30T10:31:58.658661159Z",
				"CompletedAt": "2018-05-30T10:32:20.583145375Z",
				"Message": "update completed"
			}
		},
		'secretList': [
			{
				"ID": "f6xlz2x8ysma2vu5qft8v3cp1",
				"Version": {
					"Index": 336
				},
				"CreatedAt": "2018-05-25T14:54:21.995660612Z",
				"UpdatedAt": "2018-05-25T14:54:21.995660612Z",
				"Spec": {
					"Name": "test-secret-1",
					"Labels": {}
				}
			}
		],
		'swarmInspect': {
			"ID": "7uj3u0ahc78lfjkzaxr9253e6",
			"Version": {
				"Index": 10
			},
			"CreatedAt": "2018-05-22T15:19:53.799465313Z",
			"UpdatedAt": "2018-05-22T15:19:54.32380318Z",
			"Spec": {
				"Name": "default",
				"Labels": {},
				"Orchestration": {
					"TaskHistoryRetentionLimit": 5
				},
				"Raft": {
					"SnapshotInterval": 10000,
					"KeepOldSnapshots": 0,
					"LogEntriesForSlowFollowers": 500,
					"ElectionTick": 10,
					"HeartbeatTick": 1
				},
				"Dispatcher": {
					"HeartbeatPeriod": 5000000000
				},
				"CAConfig": {
					"NodeCertExpiry": 7776000000000000
				},
				"TaskDefaults": {},
				"EncryptionConfig": {
					"AutoLockManagers": false
				}
			},
			"TLSInfo": {
				"TrustRoot": "",
				"CertIssuerSubject": "",
				"CertIssuerPublicKey": ""
			},
			"RootRotationInProgress": false,
			"JoinTokens": {
				"Worker": "",
				"Manager": ""
			}
		},
		'dockerInfo': {
			"ID": "2ITV:ZV7F:VCKC:TGD5:O4G7:W57I:AYZC:4ETB:N3D5:BKLD:URR6:BQX5",
			"Containers": 13,
			"ContainersRunning": 7,
			"ContainersPaused": 0,
			"ContainersStopped": 6,
			"Images": 24,
			"Driver": "overlay2",
			"DriverStatus": [
				[
					"Backing Filesystem",
					"extfs"
				],
				[
					"Supports d_type",
					"true"
				],
				[
					"Native Overlay Diff",
					"true"
				]
			],
			"SystemStatus": null,
			"Plugins": {
				"Volume": [
					"local"
				],
				"Network": [
					"bridge",
					"host",
					"ipvlan",
					"macvlan",
					"null",
					"overlay"
				],
				"Authorization": null,
				"Log": [
					"awslogs",
					"fluentd",
					"gcplogs",
					"gelf",
					"journald",
					"json-file",
					"logentries",
					"splunk",
					"syslog"
				]
			},
			"MemoryLimit": true,
			"SwapLimit": true,
			"KernelMemory": true,
			"CpuCfsPeriod": true,
			"CpuCfsQuota": true,
			"CPUShares": true,
			"CPUSet": true,
			"IPv4Forwarding": true,
			"BridgeNfIptables": true,
			"BridgeNfIp6tables": true,
			"Debug": true,
			"NFd": 71,
			"OomKillDisable": true,
			"NGoroutines": 212,
			"SystemTime": "2018-05-28T14:30:35.820838079Z",
			"LoggingDriver": "json-file",
			"CgroupDriver": "cgroupfs",
			"NEventsListener": 5,
			"KernelVersion": "4.9.87-linuxkit-aufs",
			"OperatingSystem": "Docker for Mac",
			"OSType": "linux",
			"Architecture": "x86_64",
			"IndexServerAddress": "https://index.docker.io/v1/",
			"RegistryConfig": {
				"AllowNondistributableArtifactsCIDRs": [],
				"AllowNondistributableArtifactsHostnames": [],
				"InsecureRegistryCIDRs": [
					"127.0.0.0/8"
				],
				"IndexConfigs": {
					"docker.io": {
						"Name": "docker.io",
						"Mirrors": [],
						"Secure": true,
						"Official": true
					}
				},
				"Mirrors": []
			},
			"NCPU": 6,
			"MemTotal": 8360284160,
			"GenericResources": null,
			"DockerRootDir": "/var/lib/docker",
			"HttpProxy": "gateway.docker.internal:3128",
			"HttpsProxy": "gateway.docker.internal:3129",
			"NoProxy": "",
			"Name": "linuxkit-025000000001",
			"Labels": [],
			"ExperimentalBuild": true,
			"ServerVersion": "18.05.0-ce",
			"ClusterStore": "",
			"ClusterAdvertise": "",
			"Runtimes": {
				"runc": {
					"path": "docker-runc"
				}
			},
			"DefaultRuntime": "runc",
			"Swarm": {
				"NodeID": "mwdhuz0wfj6e9d40175g8kpge",
				"NodeAddr": "192.168.65.3",
				"LocalNodeState": "active",
				"ControlAvailable": true,
				"Error": "",
				"RemoteManagers": [
					{
						"NodeID": "mwdhuz0wfj6e9d40175g8kpge",
						"Addr": "192.168.65.3:2377"
					}
				],
				"Nodes": 1,
				"Managers": 1,
				"Cluster": {
					"ID": "7uj3u0ahc78lfjkzaxr9253e6",
					"Version": {
						"Index": 10
					},
					"CreatedAt": "2018-05-22T15:19:53.799465313Z",
					"UpdatedAt": "2018-05-22T15:19:54.32380318Z",
					"Spec": {
						"Name": "default",
						"Labels": {},
						"Orchestration": {
							"TaskHistoryRetentionLimit": 5
						},
						"Raft": {
							"SnapshotInterval": 10000,
							"KeepOldSnapshots": 0,
							"LogEntriesForSlowFollowers": 500,
							"ElectionTick": 10,
							"HeartbeatTick": 1
						},
						"Dispatcher": {
							"HeartbeatPeriod": 5000000000
						},
						"CAConfig": {
							"NodeCertExpiry": 7776000000000000
						},
						"TaskDefaults": {},
						"EncryptionConfig": {
							"AutoLockManagers": false
						}
					},
					"TLSInfo": {
						"TrustRoot": "",
						"CertIssuerSubject": "",
						"CertIssuerPublicKey": ""
					},
					"RootRotationInProgress": false
				}
			},
			"LiveRestoreEnabled": false,
			"Isolation": "",
			"InitBinary": "docker-init",
			"ContainerdCommit": {
				"ID": "773c489c9c1b21a6d78b5c538cd395416ec50f88",
				"Expected": "773c489c9c1b21a6d78b5c538cd395416ec50f88"
			},
			"RuncCommit": {
				"ID": "4fc53a81fb7c994640722ac585fa9ca548971871",
				"Expected": "4fc53a81fb7c994640722ac585fa9ca548971871"
			},
			"InitCommit": {
				"ID": "949e6fa",
				"Expected": "949e6fa"
			},
			"SecurityOptions": [
				"name=seccomp,profile=default"
			]
		},
		'nodes': [
			{
				"ID": "mwdhuz0wfj6e9d40175g8kpge",
				"Version": {
					"Index": 364
				},
				"CreatedAt": "2018-05-22T15:19:53.799648998Z",
				"UpdatedAt": "2018-05-28T09:44:00.517163845Z",
				"Spec": {
					"Labels": {},
					"Role": "manager",
					"Availability": "active"
				},
				"Description": {
					"Hostname": "linuxkit-025000000001",
					"Platform": {
						"Architecture": "x86_64",
						"OS": "linux"
					},
					"Resources": {
						"NanoCPUs": 6000000000,
						"MemoryBytes": 8360284160
					},
					"Engine": {
						"EngineVersion": "18.05.0-ce",
						"Plugins": [
							{
								"Type": "Log",
								"Name": "awslogs"
							},
							{
								"Type": "Log",
								"Name": "fluentd"
							},
							{
								"Type": "Log",
								"Name": "gcplogs"
							},
							{
								"Type": "Log",
								"Name": "gelf"
							},
							{
								"Type": "Log",
								"Name": "journald"
							},
							{
								"Type": "Log",
								"Name": "json-file"
							},
							{
								"Type": "Log",
								"Name": "logentries"
							},
							{
								"Type": "Log",
								"Name": "splunk"
							},
							{
								"Type": "Log",
								"Name": "syslog"
							},
							{
								"Type": "Network",
								"Name": "bridge"
							},
							{
								"Type": "Network",
								"Name": "host"
							},
							{
								"Type": "Network",
								"Name": "ipvlan"
							},
							{
								"Type": "Network",
								"Name": "macvlan"
							},
							{
								"Type": "Network",
								"Name": "null"
							},
							{
								"Type": "Network",
								"Name": "overlay"
							},
							{
								"Type": "Volume",
								"Name": "local"
							}
						]
					},
					"TLSInfo": {
						"TrustRoot": "",
						"CertIssuerSubject": "",
						"CertIssuerPublicKey": "+8ulQI/+=="
					}
				},
				"Status": {
					"State": "ready",
					"Addr": "192.168.65.3"
				},
				"ManagerStatus": {
					"Leader": true,
					"Reachability": "reachable",
					"Addr": "192.168.65.3:2377"
				}
			}
		]
	};
	return data;
};