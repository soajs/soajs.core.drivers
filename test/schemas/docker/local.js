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
		]
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
	"coreDB": {
		"provision": {
			"name": "core_provision",
			"prefix": "local_",
			"servers": [
				{
					"host": "192.168.61.51",
					"port": 27017
				}
			],
			"credentials": {},
			"URLParam": {
				"bufferMaxEntries": 0,
				"native_parser": true
			},
			"streaming": {},
			"registryLocation": {
				"l1": "coreDB",
				"l2": "provision",
				"env": "dashboard"
			},
			"timeConnected": 1527605395615
		},
		"session": {
			"name": "core_session",
			"prefix": "local_",
			"store": {},
			"collection": "sessions",
			"stringify": false,
			"expireAfter": 1209600000,
			"registryLocation": {
				"l1": "coreDB",
				"l2": "session",
				"env": "dashboard"
			},
			"cluster": "dash_cluster",
			"servers": [
				{
					"host": "192.168.61.51",
					"port": 27017
				}
			],
			"credentials": {},
			"URLParam": {
				"bufferMaxEntries": 0,
				"maxPoolSize": 5
			},
			"extraParam": {
				"db": {
					"native_parser": true,
					"bufferMaxEntries": 0
				},
				"server": {}
			},
			"streaming": {}
		}
	},
	"serviceConfig": {
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
	validator: require('soajs').core.validator,
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
					"PortStatus": {}
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
							"mountPath": "secretPath"
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
							"PublishMode": "ingress"
						}
					]
				}
			},
			"PreviousSpec": {
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
							"PublishMode": "ingress"
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
							"PublishMode": "ingress"
						}
					]
				},
				"Ports": [
					{
						"Protocol": "tcp",
						"TargetPort": 27017,
						"PublishedPort": 32017,
						"PublishMode": "ingress"
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