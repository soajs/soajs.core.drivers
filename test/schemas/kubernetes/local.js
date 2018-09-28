'use strict';
let infra = {
	"_id": "5b0ffd02ed15433ff59dc84f",
	"api": {
		"ipaddress": "192.168.61.51",
		"port": "6443",
		"token": "1",
		"namespace": {
			"default": "soajs",
			"perService": false
		}
	},
	"name": "local",
	"technologies": [
		"kubernetes"
	],
	"templates": null,
	"drivers": [
		"Native"
	],
	"label": "Local Test Kube",
	"deployments": [
		{
			"technology": "kubernetes",
			"options": {
				"zone": "local"
			},
			"environments": [
				"TESTENV"
			],
			"loadBalancers": {},
			"name": "Htlocal2yaapwyth4wf5",
			"id": "Htlocal2yaapwyth4wf5"
		}
	],
	"stack": {
		"technology": "kubernetes",
		"options": {
			"zone": "local"
		},
		"environments": [
			"TESTENV"
		],
		"loadBalancers": {},
		"name": "Htlocal2yaapwyth4wf5",
		"id": "Htlocal2yaapwyth4wf5"
	}
};
let registry = {
	"_id": "5b0ffd41ed15433ff59dc850",
	"code": "TESTENV",
	"description": "kube test env",
	"sensitive": false,
	"domain": "",
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
					"apiProtocol": "https",
					"apiPort": 2376,
					"auth": {
						"token": ""
					},
					"nodes": ""
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
				"remote": "~deployerConfig"
			}
		},
		"type": "container",
		"selected": "container.kubernetes.remote"
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
				"password": null
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
				"secret": "Bkcra-6k7"
			},
			"session": {
				"name": "H1xcHadpJX",
				"secret": "B1Wcr6uaym",
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
			"timeConnected": 1527769995793
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
			"password": null
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
			"secret": "Bkcra-6k7"
		},
		"session": {
			"name": "H1xcHadpJX",
			"secret": "B1Wcr6uaym",
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
};
let soajs = {
	log: {
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
		"deployer": {
			"strategy": "kubernetes",
			"driver": "kubernetes.remote",
			"env": "testenv",
			"deployerConfig": {
				"nodes": "192.168.61.51",
				"apiPort": "6443",
				"namespace": {
					"default": "soajs",
					"perService": false
				},
				"auth": {
					"token": "1"
				},
				"apiProtocol": null
			},
			"soajs": soajs,
			"infra": infra
		},
		"deployServiceParams": {
			"data": {
				"variables": {
					"$SOAJS_NX_DOMAIN": "",
					"$SOAJS_NX_SITE_DOMAIN": "site.",
					"$SOAJS_NX_API_DOMAIN": "api.",
					"$SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",
					"$SOAJS_EXTKEY": "9b96ba56ce934ded56c3f21ac9bdaddc8ba4782b7753cf07576bfabcace8632eba1749ff1187239ef1f56dd74377aa1e5d0a1113de2ed18368af4b808ad245bc7da986e101caddb7b75992b14d6a866db884ea8aee5ab02786886ecf9f25e974",
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
				"custom": {
					"name": "mongo",
					"ports": [
						{
							"name": "mongo",
							"target": 27017,
							"isPublished": true,
							"published": 2017
						}
					],
					"loadBalancer": false,
					"secrets": [
						{
							"name": "test-secret-1",
							"namespace": "soajs",
							"uid": "0f8ae5ed-67dd-11e8-9dde-025000000001",
							"data": {
								"test-secret-1": "MQ=="
							},
							"type": "Opaque",
							"mountPath": "defaultPath"
						}
					],
					"type": "resource",
					"sourceCode": {},
					"resourceId": "5b150c52e5efc7143ed4ace2"
				},
				"recipe": "5ad9cab35c967d35b871065c",
				"deployConfig": {
					"region": "",
					"memoryLimit": 581959680,
					"cpuLimit": "500m",
					"replication": {
						"mode": "deployment"
					}
				},
				"autoScale": {
					"metrics": {
						"cpu": {
							"percent": 80
						}
					},
					"replicas": {
						"min": 1,
						"max": 3
					}
				},
				"env": "TESTENV"
			},
			"action": "deploy"
		},
		"redepolyServiceParams": {
			"data": {
				"variables": {
					"$SOAJS_NX_DOMAIN": "",
					"$SOAJS_NX_SITE_DOMAIN": "site.",
					"$SOAJS_NX_API_DOMAIN": "api.",
					"$SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",
					"$SOAJS_EXTKEY": "9b96ba56ce934ded56c3f21ac9bdaddc8ba4782b7753cf07576bfabcace8632eba1749ff1187239ef1f56dd74377aa1e5d0a1113de2ed18368af4b808ad245bc7da986e101caddb7b75992b14d6a866db884ea8aee5ab02786886ecf9f25e974",
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
				"env": "TESTENV",
				"serviceId": "mongo",
				"mode": "deployment",
				"action": "rebuild",
				"custom": {
					"image": {},
					"sourceCode": {},
					"ports": [
						{
							"name": "mongo",
							"target": 27017,
							"isPublished": true,
							"published": 2017
						}
					],
					"name": "mongo",
					"resourceId": "5b150c52e5efc7143ed4ace2"
				},
				"namespace": "soajs",
				"recipe": "5ad9cab35c967d35b871065c",
				"imageLastTs": "1515128013261",
				"deployConfig": {
					"replication": {
						"mode": "deployment",
						"replicas": 1
					},
					"cpuLimit": 20,
					"memoryLimit": 524288000
				}
			},
			"action": "rebuild"
		},
		"namespaces": {
			"kind": "NamespaceList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/namespaces",
				"resourceVersion": "80945"
			},
			"items": [
				{
					"metadata": {
						"name": "default",
						"selfLink": "/api/v1/namespaces/default",
						"uid": "f4782881-5d97-11e8-9af0-025000000001",
						"resourceVersion": "4",
						"creationTimestamp": "2018-05-22T08:13:05Z"
					},
					"spec": {
						"finalizers": [
							"kubernetes"
						]
					},
					"status": {
						"phase": "Active"
					}
				},
				{
					"metadata": {
						"name": "docker",
						"selfLink": "/api/v1/namespaces/docker",
						"uid": "3400441c-5d98-11e8-9af0-025000000001",
						"resourceVersion": "466",
						"creationTimestamp": "2018-05-22T08:14:52Z"
					},
					"spec": {
						"finalizers": [
							"kubernetes"
						]
					},
					"status": {
						"phase": "Active"
					}
				},
				{
					"metadata": {
						"name": "kube-public",
						"selfLink": "/api/v1/namespaces/kube-public",
						"uid": "f6de3847-5d97-11e8-9af0-025000000001",
						"resourceVersion": "53",
						"creationTimestamp": "2018-05-22T08:13:09Z"
					},
					"spec": {
						"finalizers": [
							"kubernetes"
						]
					},
					"status": {
						"phase": "Active"
					}
				},
				{
					"metadata": {
						"name": "kube-system",
						"selfLink": "/api/v1/namespaces/kube-system",
						"uid": "f50827d1-5d97-11e8-9af0-025000000001",
						"resourceVersion": "10",
						"creationTimestamp": "2018-05-22T08:13:06Z"
					},
					"spec": {
						"finalizers": [
							"kubernetes"
						]
					},
					"status": {
						"phase": "Active"
					}
				},
				{
					"metadata": {
						"name": "soajs",
						"selfLink": "/api/v1/namespaces/soajs",
						"uid": "3381f118-64d9-11e8-937c-025000000001",
						"resourceVersion": "62841",
						"creationTimestamp": "2018-05-31T13:47:46Z",
						"labels": {
							"soajs.content": "true"
						}
					},
					"spec": {
						"finalizers": [
							"kubernetes"
						]
					},
					"status": {
						"phase": "Active"
					}
				}
			]
		},
		"secrets": {
			"kind": "SecretList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/secrets",
				"resourceVersion": "71785"
			},
			"items": [
				{
					"metadata": {
						"name": "default-token-mh6vv",
						"namespace": "default",
						"selfLink": "/api/v1/namespaces/default/secrets/default-token-mh6vv",
						"uid": "fc65ae98-5d97-11e8-9af0-025000000001",
						"resourceVersion": "304",
						"creationTimestamp": "2018-05-22T08:13:19Z",
						"annotations": {
							"kubernetes.io/service-account.name": "default",
							"kubernetes.io/service-account.uid": "fc6411bc-5d97-11e8-9af0-025000000001"
						}
					},
					"data": {
						"ca.crt": "=",
						"namespace": "==",
						"token": ""
					},
					"type": "kubernetes.io/service-account-token"
				},
				{
					"metadata": {
						"name": "test-secret-1",
						"namespace": "soajs",
						"selfLink": "/api/v1/namespaces/soajs/secrets/test-secret-1",
						"uid": "da89d4f3-64f0-11e8-937c-025000000001",
						"resourceVersion": "74030",
						"creationTimestamp": "2018-05-31T16:37:05Z",
						"labels": {
							"soajs.secret.name": "test-secret-1",
							"soajs.secret.type": "Opaque"
						}
					}

				}
			]
		},
		"secret": {
			"kind": "Secret",
			"apiVersion": "v1",
			"metadata": {
				"name": "test-secret-1",
				"namespace": "soajs",
				"selfLink": "/api/v1/namespaces/soajs/secrets/test-secret-1",
				"uid": "da89d4f3-64f0-11e8-937c-025000000001",
				"resourceVersion": "74030",
				"creationTimestamp": "2018-05-31T16:37:05Z",
				"labels": {
					"soajs.secret.name": "test-secret-1",
					"soajs.secret.type": "Opaque"
				}
			},
			"data": {
				"test-secret-1": "MTIzNDU2"
			},
			"type": "Opaque"
		},
		"nodeList": {
			"kind": "NodeList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/nodes",
				"resourceVersion": "70496"
			},
			"items": [
				{
					"metadata": {
						"name": "docker-for-desktop",
						"selfLink": "/api/v1/nodes/docker-for-desktop",
						"uid": "f6307a28-5d97-11e8-9af0-025000000001",
						"resourceVersion": "70492",
						"creationTimestamp": "2018-05-22T08:13:08Z",
						"labels": {
							"beta.kubernetes.io/arch": "amd64",
							"beta.kubernetes.io/os": "linux",
							"kubernetes.io/hostname": "docker-for-desktop",
							"node-role.kubernetes.io/master": ""
						},
						"annotations": {
							"node.alpha.kubernetes.io/ttl": "0",
							"volumes.kubernetes.io/controller-managed-attach-detach": "true"
						}
					},
					"spec": {
						"externalID": "docker-for-desktop"
					},
					"status": {
						"capacity": {
							"cpu": "6",
							"memory": "8164340Ki",
							"pods": "110"
						},
						"allocatable": {
							"cpu": "6",
							"memory": "8061940Ki",
							"pods": "110"
						},
						"conditions": [
							{
								"type": "OutOfDisk",
								"status": "False",
								"lastHeartbeatTime": "2018-05-31T15:43:35Z",
								"lastTransitionTime": "2018-05-22T08:13:04Z",
								"reason": "KubeletHasSufficientDisk",
								"message": "kubelet has sufficient disk space available"
							},
							{
								"type": "MemoryPressure",
								"status": "False",
								"lastHeartbeatTime": "2018-05-31T15:43:35Z",
								"lastTransitionTime": "2018-05-22T08:13:04Z",
								"reason": "KubeletHasSufficientMemory",
								"message": "kubelet has sufficient memory available"
							},
							{
								"type": "DiskPressure",
								"status": "False",
								"lastHeartbeatTime": "2018-05-31T15:43:35Z",
								"lastTransitionTime": "2018-05-22T08:13:04Z",
								"reason": "KubeletHasNoDiskPressure",
								"message": "kubelet has no disk pressure"
							},
							{
								"type": "Ready",
								"status": "True",
								"lastHeartbeatTime": "2018-05-31T15:43:35Z",
								"lastTransitionTime": "2018-05-22T08:13:04Z",
								"reason": "KubeletReady",
								"message": "kubelet is posting ready status"
							}
						],
						"addresses": [
							{
								"type": "InternalIP",
								"address": "192.168.65.3"
							},
							{
								"type": "Hostname",
								"address": "docker-for-desktop"
							}
						],
						"daemonEndpoints": {
							"kubeletEndpoint": {
								"Port": 10250
							}
						},
						"nodeInfo": {
							"machineID": "",
							"systemUUID": "B2CE4E18-0000-0000-BA9F-D054BDA7C8D7",
							"bootID": "3b95ee9d-a315-4e45-8086-b97dc4ce36c1",
							"kernelVersion": "4.9.87-linuxkit-aufs",
							"osImage": "Docker for Mac",
							"containerRuntimeVersion": "docker://18.5.0",
							"kubeletVersion": "v1.9.6",
							"kubeProxyVersion": "v1.9.6",
							"operatingSystem": "linux",
							"architecture": "amd64"
						},
						"images": [
							{
								"names": [
									"soajsorg/soajs@sha256:04c124b1ba99db04605fbb361284ec0e6494031bd0d8456c4f46851fce3caed4",
									"soajsorg/soajs:latest"
								],
								"sizeBytes": 627238304
							},
							{
								"names": [
									"soajstest/docker-api:latest"
								],
								"sizeBytes": 569844766
							},
							{
								"names": [
									"soajsorg/baseservice@sha256:eea211dc5b985b7053401079108082f054a70795bbcfcc72d927f5aa52f5a7a9",
									"soajsorg/baseservice:latest"
								],
								"sizeBytes": 546018311
							},
							{
								"names": [
									"soajsorg/nginx@sha256:8aba458e7fcc8173cc24935122960378a455338df189bbe905b934cab8ce6436",
									"soajsorg/nginx:latest"
								],
								"sizeBytes": 412675023
							},
							{
								"names": [
									"mongo@sha256:b84baeffd0f14bebaf057b36de9414ee41584a897351795f4a3889257cf19b6d",
									"mongo:3.4.10"
								],
								"sizeBytes": 359643531
							},
							{
								"names": [
									"gcr.io/google_containers/kube-apiserver-amd64@sha256:1bb16ddef9edd8142125ac2443e36986c051b0df808db907648ac9d68e0d5f23",
									"gcr.io/google_containers/kube-apiserver-amd64:v1.9.6"
								],
								"sizeBytes": 211851228
							},
							{
								"names": [
									"gcr.io/google_containers/etcd-amd64@sha256:54889c08665d241e321ca5ce976b2df0f766794b698d53faf6b7dacb95316680",
									"gcr.io/google_containers/etcd-amd64:3.1.11"
								],
								"sizeBytes": 193862870
							},
							{
								"names": [
									"gcr.io/google_containers/kube-controller-manager-amd64@sha256:c90d1f38999b96405a997e52392b4db2ac68b6d4ea376e2e99ab528c51b88d22",
									"gcr.io/google_containers/kube-controller-manager-amd64:v1.9.6"
								],
								"sizeBytes": 139182611
							},
							{
								"names": [
									"gcr.io/google_containers/kube-proxy-amd64@sha256:dd647b619b75882f217a21a6e2c473deb77cba1cfb20461da0084ed78d951af1",
									"gcr.io/google_containers/kube-proxy-amd64:v1.9.6"
								],
								"sizeBytes": 109303643
							},
							{
								"names": [
									"gcr.io/google_containers/metrics-server-amd64@sha256:59ab453ad7400e37be461bcc6ba8f4ae621905b6d6fb9d6012323f7893250efb",
									"gcr.io/google_containers/metrics-server-amd64:dev"
								],
								"sizeBytes": 95226829
							},
							{
								"names": [
									"gcr.io/google_containers/heapster-amd64@sha256:3dff9b2425a196aa51df0cebde0f8b427388425ba84568721acf416fa003cd5c",
									"gcr.io/google_containers/heapster-amd64:v1.3.0"
								],
								"sizeBytes": 68105973
							},
							{
								"names": [
									"gcr.io/google_containers/kube-scheduler-amd64@sha256:0bc20f6ee28be19c4c45f2a5d0282e7ae3e89d61789e7a89182f818b37b67e28",
									"gcr.io/google_containers/kube-scheduler-amd64:v1.9.6"
								],
								"sizeBytes": 62861932
							},
							{
								"names": [
									"gcr.io/google_containers/k8s-dns-kube-dns-amd64@sha256:f5bddc71efe905f4e4b96f3ca346414be6d733610c1525b98fff808f93966680",
									"gcr.io/google_containers/k8s-dns-kube-dns-amd64:1.14.7"
								],
								"sizeBytes": 50274864
							},
							{
								"names": [
									"docker/kube-compose-api-server@sha256:c7535ce82da8da04cb1e9e333adf76695c43dfc8127fef0cf4595ce9dfb1ba06",
									"docker/kube-compose-api-server:v0.3.0-rc4"
								],
								"sizeBytes": 43781893
							},
							{
								"names": [
									"gcr.io/google_containers/k8s-dns-sidecar-amd64@sha256:f80f5f9328107dc516d67f7b70054354b9367d31d4946a3bffd3383d83d7efe8",
									"gcr.io/google_containers/k8s-dns-sidecar-amd64:1.14.7"
								],
								"sizeBytes": 42033070
							},
							{
								"names": [
									"gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64@sha256:6cfb9f9c2756979013dbd3074e852c2d8ac99652570c5d17d152e0c0eb3321d6",
									"gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64:1.14.7"
								],
								"sizeBytes": 40951808
							},
							{
								"names": [
									"docker/kube-compose-controller@sha256:144066d84addbf9de06a47911939c094f4e769476968d00feae17367011ba729",
									"docker/kube-compose-controller:v0.3.0-rc4"
								],
								"sizeBytes": 30575461
							},
							{
								"names": [
									"gcr.io/google_containers/pause-amd64@sha256:163ac025575b775d1c0f9bf0bdd0f086883171eb475b5068e7defa4ca9e76516",
									"gcr.io/google_containers/pause-amd64:3.0"
								],
								"sizeBytes": 746888
							}
						]
					}
				}
			]
		},
		"deploymentListSys": {
			"kind": "DeploymentList",
			"apiVersion": "extensions/v1beta1",
			"metadata": {
				"selfLink": "/apis/extensions/v1beta1/deployments",
				"resourceVersion": "70496"
			},
			"items": [
				{
					"metadata": {
						"name": "heapster",
						"namespace": "kube-system",
						"selfLink": "/apis/extensions/v1beta1/namespaces/kube-system/deployments/heapster",
						"uid": "3b63cccd-5dcf-11e8-bd9f-025000000001",
						"resourceVersion": "27280",
						"generation": 1,
						"creationTimestamp": "2018-05-22T14:48:47Z",
						"labels": {
							"k8s-app": "heapster",
							"soajs.service.subtype": "other",
							"soajs.service.type": "system"
						},
						"annotations": {
							"deployment.kubernetes.io/revision": "1"
						}
					},
					"spec": {
						"replicas": 1,
						"selector": {
							"matchLabels": {
								"k8s-app": "heapster",
								"soajs.service.subtype": "other",
								"soajs.service.type": "system"
							}
						},
						"template": {
							"metadata": {
								"creationTimestamp": null,
								"labels": {
									"k8s-app": "heapster",
									"soajs.service.subtype": "other",
									"soajs.service.type": "system"
								}
							},
							"spec": {
								"containers": [
									{
										"name": "heapster",
										"image": "gcr.io/google_containers/heapster-amd64:v1.3.0",
										"command": [
											"/heapster",
											"--source=kubernetes:https://kubernetes.default"
										],
										"resources": {},
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "IfNotPresent"
									}
								],
								"restartPolicy": "Always",
								"terminationGracePeriodSeconds": 30,
								"dnsPolicy": "ClusterFirst",
								"serviceAccountName": "heapster",
								"serviceAccount": "heapster",
								"securityContext": {},
								"schedulerName": "default-scheduler"
							}
						},
						"strategy": {
							"type": "RollingUpdate",
							"rollingUpdate": {
								"maxUnavailable": 1,
								"maxSurge": 1
							}
						}
					},
					"status": {
						"observedGeneration": 1,
						"replicas": 1,
						"updatedReplicas": 1,
						"readyReplicas": 1,
						"availableReplicas": 1,
						"conditions": [
							{
								"type": "Available",
								"status": "True",
								"lastUpdateTime": "2018-05-22T14:48:47Z",
								"lastTransitionTime": "2018-05-22T14:48:47Z",
								"reason": "MinimumReplicasAvailable",
								"message": "Deployment has minimum availability."
							}
						]
					}
				},
				{
					"metadata": {
						"name": "kube-dns",
						"namespace": "kube-system",
						"selfLink": "/apis/extensions/v1beta1/namespaces/kube-system/deployments/kube-dns",
						"uid": "f91ddf53-5d97-11e8-9af0-025000000001",
						"resourceVersion": "53896",
						"generation": 1,
						"creationTimestamp": "2018-05-22T08:13:13Z",
						"labels": {
							"k8s-app": "kube-dns"
						},
						"annotations": {
							"deployment.kubernetes.io/revision": "1"
						}
					},
					"spec": {
						"replicas": 1,
						"selector": {
							"matchLabels": {
								"k8s-app": "kube-dns"
							}
						},
						"template": {
							"metadata": {
								"creationTimestamp": null,
								"labels": {
									"k8s-app": "kube-dns"
								}
							},
							"spec": {
								"volumes": [
									{
										"name": "kube-dns-config",
										"configMap": {
											"name": "kube-dns",
											"defaultMode": 420,
											"optional": true
										}
									}
								],
								"containers": [
									{
										"name": "kubedns",
										"image": "gcr.io/google_containers/k8s-dns-kube-dns-amd64:1.14.7",
										"args": [
											"--domain=cluster.local.",
											"--dns-port=10053",
											"--config-dir=/kube-dns-config",
											"--v=2"
										],
										"ports": [
											{
												"name": "dns-local",
												"containerPort": 10053,
												"protocol": "UDP"
											},
											{
												"name": "dns-tcp-local",
												"containerPort": 10053,
												"protocol": "TCP"
											},
											{
												"name": "metrics",
												"containerPort": 10055,
												"protocol": "TCP"
											}
										],
										"env": [
											{
												"name": "PROMETHEUS_PORT",
												"value": "10055"
											}
										],
										"resources": {

											"requests": {
												"cpu": "100m",
												"memory": "70Mi"
											}
										},
										"volumeMounts": [
											{
												"name": "kube-dns-config",
												"mountPath": "/kube-dns-config"
											}
										],
										"livenessProbe": {
											"httpGet": {
												"path": "/healthcheck/kubedns",
												"port": 10054,
												"scheme": "HTTP"
											},
											"initialDelaySeconds": 60,
											"timeoutSeconds": 5,
											"periodSeconds": 10,
											"successThreshold": 1,
											"failureThreshold": 5
										},
										"readinessProbe": {
											"httpGet": {
												"path": "/readiness",
												"port": 8081,
												"scheme": "HTTP"
											},
											"initialDelaySeconds": 3,
											"timeoutSeconds": 5,
											"periodSeconds": 10,
											"successThreshold": 1,
											"failureThreshold": 3
										},
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "IfNotPresent"
									},
									{
										"name": "dnsmasq",
										"image": "gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64:1.14.7",
										"args": [
											"-v=2",
											"-logtostderr",
											"-configDir=/etc/k8s/dns/dnsmasq-nanny",
											"-restartDnsmasq=true",
											"--",
											"-k",
											"--cache-size=1000",
											"--no-negcache",
											"--log-facility=-",
											"--server=/cluster.local/127.0.0.1#10053",
											"--server=/in-addr.arpa/127.0.0.1#10053",
											"--server=/ip6.arpa/127.0.0.1#10053"
										],
										"ports": [
											{
												"name": "dns",
												"containerPort": 53,
												"protocol": "UDP"
											},
											{
												"name": "dns-tcp",
												"containerPort": 53,
												"protocol": "TCP"
											}
										],
										"resources": {

										},
										"volumeMounts": [
											{
												"name": "kube-dns-config",
												"mountPath": "/etc/k8s/dns/dnsmasq-nanny"
											}
										],
										"livenessProbe": {
											"httpGet": {
												"path": "/healthcheck/dnsmasq",
												"port": 10054,
												"scheme": "HTTP"
											},
											"initialDelaySeconds": 60,
											"timeoutSeconds": 5,
											"periodSeconds": 10,
											"successThreshold": 1,
											"failureThreshold": 5
										},
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "IfNotPresent"
									},
									{
										"name": "sidecar",
										"image": "gcr.io/google_containers/k8s-dns-sidecar-amd64:1.14.7",
										"args": [
											"--v=2",
											"--logtostderr",
											"--probe=kubedns,127.0.0.1:10053,kubernetes.default.svc.cluster.local,5,SRV",
											"--probe=dnsmasq,127.0.0.1:53,kubernetes.default.svc.cluster.local,5,SRV"
										],
										"ports": [
											{
												"name": "metrics",
												"containerPort": 10054,
												"protocol": "TCP"
											}
										],
										"resources": {

										},
										"livenessProbe": {
											"httpGet": {
												"path": "/metrics",
												"port": 10054,
												"scheme": "HTTP"
											},
											"initialDelaySeconds": 60,
											"timeoutSeconds": 5,
											"periodSeconds": 10,
											"successThreshold": 1,
											"failureThreshold": 5
										},
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "IfNotPresent"
									}
								],
								"restartPolicy": "Always",
								"terminationGracePeriodSeconds": 30,
								"dnsPolicy": "Default",
								"serviceAccountName": "kube-dns",
								"serviceAccount": "kube-dns",
								"securityContext": {},
								"affinity": {
									"nodeAffinity": {
										"requiredDuringSchedulingIgnoredDuringExecution": {
											"nodeSelectorTerms": [
												{
													"matchExpressions": [
														{
															"key": "beta.kubernetes.io/arch",
															"operator": "In",
															"values": [
																"amd64"
															]
														}
													]
												}
											]
										}
									}
								},
								"schedulerName": "default-scheduler",
								"tolerations": [
									{
										"key": "CriticalAddonsOnly",
										"operator": "Exists"
									},
									{
										"key": "node-role.kubernetes.io/master",
										"effect": "NoSchedule"
									}
								]
							}
						},
						"strategy": {
							"type": "RollingUpdate",
							"rollingUpdate": {
								"maxUnavailable": 0,
								"maxSurge": "10%"
							}
						},
						"revisionHistoryLimit": 10,
						"progressDeadlineSeconds": 600
					},
					"status": {
						"observedGeneration": 1,
						"replicas": 1,
						"updatedReplicas": 1,
						"readyReplicas": 1,
						"availableReplicas": 1,
						"conditions": [
							{
								"type": "Progressing",
								"status": "True",
								"lastUpdateTime": "2018-05-22T08:14:58Z",
								"lastTransitionTime": "2018-05-22T08:13:19Z",
								"reason": "NewReplicaSetAvailable",
								"message": "ReplicaSet \"kube-dns-6f4fd4bdf\" has successfully progressed."
							},
							{
								"type": "Available",
								"status": "True",
								"lastUpdateTime": "2018-05-31T11:35:29Z",
								"lastTransitionTime": "2018-05-31T11:35:29Z",
								"reason": "MinimumReplicasAvailable",
								"message": "Deployment has minimum availability."
							}
						]
					}
				},
				{
					"metadata": {
						"name": "metrics-server",
						"namespace": "kube-system",
						"selfLink": "/apis/extensions/v1beta1/namespaces/kube-system/deployments/metrics-server",
						"uid": "1156afb9-5dd0-11e8-bd9f-025000000001",
						"resourceVersion": "27739",
						"generation": 1,
						"creationTimestamp": "2018-05-22T14:54:46Z",
						"labels": {
							"k8s-app": "metrics-server",
							"soajs.service.subtype": "other",
							"soajs.service.type": "system"
						},
						"annotations": {
							"deployment.kubernetes.io/revision": "1"
						}
					},
					"spec": {
						"replicas": 1,
						"selector": {
							"matchLabels": {
								"k8s-app": "metrics-server",
								"soajs.service.subtype": "other",
								"soajs.service.type": "system"
							}
						},
						"template": {
							"metadata": {
								"name": "metrics-server",
								"creationTimestamp": null,
								"labels": {
									"k8s-app": "metrics-server",
									"soajs.service.subtype": "other",
									"soajs.service.type": "system"
								}
							},
							"spec": {
								"containers": [
									{
										"name": "metrics-server",
										"image": "gcr.io/google_containers/metrics-server-amd64:dev",
										"command": [
											"/metrics-server",
											"--source=kubernetes.summary_api:''"
										],
										"resources": {},
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "Always"
									}
								],
								"restartPolicy": "Always",
								"terminationGracePeriodSeconds": 30,
								"dnsPolicy": "ClusterFirst",
								"serviceAccountName": "metrics-server",
								"serviceAccount": "metrics-server",
								"securityContext": {},
								"schedulerName": "default-scheduler"
							}
						},
						"strategy": {
							"type": "RollingUpdate",
							"rollingUpdate": {
								"maxUnavailable": 1,
								"maxSurge": 1
							}
						}
					},
					"status": {
						"observedGeneration": 1,
						"replicas": 1,
						"updatedReplicas": 1,
						"readyReplicas": 1,
						"availableReplicas": 1,
						"conditions": [
							{
								"type": "Available",
								"status": "True",
								"lastUpdateTime": "2018-05-22T14:54:46Z",
								"lastTransitionTime": "2018-05-22T14:54:46Z",
								"reason": "MinimumReplicasAvailable",
								"message": "Deployment has minimum availability."
							}
						]
					}
				}
			]
		},
		"deploymentListSysMetricServer": {
			"kind": "DeploymentList",
			"apiVersion": "extensions/v1beta1",
			"metadata": {
				"selfLink": "/apis/extensions/v1beta1/deployments",
				"resourceVersion": "234770"
			},
			"items": [
				{
					"metadata": {
						"name": "metrics-server",
						"namespace": "kube-system",
						"selfLink": "/apis/extensions/v1beta1/namespaces/kube-system/deployments/metrics-server",
						"uid": "4e95042e-7308-11e8-acce-025000000001",
						"resourceVersion": "152616",
						"generation": 1,
						"creationTimestamp": "2018-06-18T15:00:15Z",
						"labels": {
							"k8s-app": "metrics-server",
							"soajs.service.subtype": "other",
							"soajs.service.type": "system",
							"version": "v0.2.1"
						},
						"annotations": {
							"deployment.kubernetes.io/revision": "1"
						}
					}
				}
			]
		},
		"daemonsetListSys": {
			"kind": "DaemonSetList",
			"apiVersion": "extensions/v1beta1",
			"metadata": {
				"selfLink": "/apis/extensions/v1beta1/daemonsets",
				"resourceVersion": "70496"
			},
			"items": [
				{
					"metadata": {
						"name": "kube-proxy",
						"namespace": "kube-system",
						"selfLink": "/apis/extensions/v1beta1/namespaces/kube-system/daemonsets/kube-proxy",
						"uid": "f92210d9-5d97-11e8-9af0-025000000001",
						"resourceVersion": "411",
						"generation": 1,
						"creationTimestamp": "2018-05-22T08:13:13Z",
						"labels": {
							"k8s-app": "kube-proxy"
						}
					},
					"spec": {
						"selector": {
							"matchLabels": {
								"k8s-app": "kube-proxy"
							}
						},
						"template": {
							"metadata": {
								"creationTimestamp": null,
								"labels": {
									"k8s-app": "kube-proxy"
								}
							},
							"spec": {
								"volumes": [
									{
										"name": "kube-proxy",
										"configMap": {
											"name": "kube-proxy",
											"defaultMode": 420
										}
									},
									{
										"name": "xtables-lock",
										"hostPath": {
											"path": "/run/xtables.lock",
											"type": "FileOrCreate"
										}
									},
									{
										"name": "lib-modules",
										"hostPath": {
											"path": "/lib/modules",
											"type": ""
										}
									}
								],
								"containers": [
									{
										"name": "kube-proxy",
										"image": "gcr.io/google_containers/kube-proxy-amd64:v1.9.6",
										"command": [
											"/usr/local/bin/kube-proxy",
											"--config=/var/lib/kube-proxy/config.conf"
										],
										"resources": {},
										"volumeMounts": [
											{
												"name": "kube-proxy",
												"mountPath": "/var/lib/kube-proxy"
											},
											{
												"name": "xtables-lock",
												"mountPath": "/run/xtables.lock"
											},
											{
												"name": "lib-modules",
												"readOnly": true,
												"mountPath": "/lib/modules"
											}
										],
										"terminationMessagePath": "/dev/termination-log",
										"terminationMessagePolicy": "File",
										"imagePullPolicy": "IfNotPresent",
										"securityContext": {
											"privileged": true
										}
									}
								],
								"restartPolicy": "Always",
								"terminationGracePeriodSeconds": 30,
								"dnsPolicy": "ClusterFirst",
								"serviceAccountName": "kube-proxy",
								"serviceAccount": "kube-proxy",
								"hostNetwork": true,
								"securityContext": {},
								"schedulerName": "default-scheduler",
								"tolerations": [
									{
										"key": "node-role.kubernetes.io/master",
										"effect": "NoSchedule"
									},
									{
										"key": "node.cloudprovider.kubernetes.io/uninitialized",
										"value": "true",
										"effect": "NoSchedule"
									}
								]
							}
						},
						"updateStrategy": {
							"type": "RollingUpdate",
							"rollingUpdate": {
								"maxUnavailable": 1
							}
						},
						"templateGeneration": 1,
						"revisionHistoryLimit": 10
					},
					"status": {
						"currentNumberScheduled": 1,
						"numberMisscheduled": 0,
						"desiredNumberScheduled": 1,
						"numberReady": 1,
						"observedGeneration": 1,
						"updatedNumberScheduled": 1,
						"numberAvailable": 1
					}
				}
			]
		},
		"serviceMetrics": {
			"kind": "PodMetricsList",
			"apiVersion": "metrics/v1alpha1",
			"metadata": {
				"selfLink": "/apis/metrics/v1alpha1/pods"
			},
			"items": [
				{
					"metadata": {
						"name": "heapster-c6b78778d-ws9vw",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/heapster-c6b78778d-ws9vw",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "heapster",
							"usage": {
								"cpu": "0",
								"memory": "13964Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "kube-controller-manager-docker-for-desktop",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/kube-controller-manager-docker-for-desktop",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "kube-controller-manager",
							"usage": {
								"cpu": "46m",
								"memory": "41392Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "kube-dns-6f4fd4bdf-vb8f5",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/kube-dns-6f4fd4bdf-vb8f5",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "kubedns",
							"usage": {
								"cpu": "0",
								"memory": "8240Ki"
							}
						},
						{
							"name": "dnsmasq",
							"usage": {
								"cpu": "0",
								"memory": "6248Ki"
							}
						},
						{
							"name": "sidecar",
							"usage": {
								"cpu": "1m",
								"memory": "11836Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "compose-api-7bb7b5968f-tn75x",
						"namespace": "docker",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/docker/pods/compose-api-7bb7b5968f-tn75x",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "compose",
							"usage": {
								"cpu": "0",
								"memory": "11304Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "etcd-docker-for-desktop",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/etcd-docker-for-desktop",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "etcd",
							"usage": {
								"cpu": "14m",
								"memory": "42848Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "kube-apiserver-docker-for-desktop",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/kube-apiserver-docker-for-desktop",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "kube-apiserver",
							"usage": {
								"cpu": "43m",
								"memory": "383760Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "kube-proxy-tclrs",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/kube-proxy-tclrs",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "kube-proxy",
							"usage": {
								"cpu": "3m",
								"memory": "15584Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "metrics-server-6966bc44b5-b7rkn",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/metrics-server-6966bc44b5-b7rkn",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "metrics-server",
							"usage": {
								"cpu": "0",
								"memory": "12012Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "kube-scheduler-docker-for-desktop",
						"namespace": "kube-system",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/kube-system/pods/kube-scheduler-docker-for-desktop",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "kube-scheduler",
							"usage": {
								"cpu": "13m",
								"memory": "12924Ki"
							}
						}
					]
				},
				{
					"metadata": {
						"name": "compose-5d4f4d67b6-wb2vx",
						"namespace": "docker",
						"selfLink": "/apis/metrics/v1alpha1/namespaces/docker/pods/compose-5d4f4d67b6-wb2vx",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"containers": [
						{
							"name": "compose",
							"usage": {
								"cpu": "0",
								"memory": "5768Ki"
							}
						}
					]
				}
			]
		},
		"nodeMetrics": {
			"kind": "NodeMetricsList",
			"apiVersion": "metrics/v1alpha1",
			"metadata": {
				"selfLink": "/apis/metrics/v1alpha1/nodes"
			},
			"items": [
				{
					"metadata": {
						"name": "docker-for-desktop",
						"selfLink": "/apis/metrics/v1alpha1/nodes/docker-for-desktop",
						"creationTimestamp": "2018-06-01T15:32:19Z"
					},
					"timestamp": "2018-06-01T15:32:00Z",
					"window": "1m0s",
					"usage": {
						"cpu": "223m",
						"memory": "1292356Ki"
					}
				}
			]
		},
		"autoscale": {},
		"deploymentMongo": {
			"kind": "Deployment",
			"apiVersion": "extensions/v1beta1",
			"metadata": {
				"name": "mongo",
				"namespace": "soajs",
				"selfLink": "/apis/extensions/v1beta1/namespaces/soajs/deployments/mongo",
				"uid": "44d4cb01-67dd-11e8-9dde-025000000001",
				"resourceVersion": "129941",
				"generation": 1,
				"creationTimestamp": "2018-06-04T09:54:27Z",
				"labels": {
					"memoryLimit": "555",
					"service.image.name": "mongo",
					"service.image.tag": "3.4.10",
					"service.image.ts": "1515128013261",
					"soajs.catalog.id": "5ad9cab35c967d35b871065c",
					"soajs.env.code": "testenv",
					"soajs.resource.id": "5b150c52e5efc7143ed4ace2",
					"soajs.service.group": "Other",
					"soajs.service.label": "testenv-mongo",
					"soajs.service.mode": "deployment",
					"soajs.service.name": "mongo",
					"soajs.service.subtype": "mongo",
					"soajs.service.type": "cluster"
				}
			},
			"spec": {
				"replicas": 1,
				"selector": {
					"matchLabels": {
						"soajs.service.label": "testenv-mongo"
					}
				},
				"template": {
					"metadata": {
						"name": "mongo",
						"creationTimestamp": null,
						"labels": {
							"memoryLimit": "555",
							"service.image.name": "mongo",
							"service.image.tag": "3.4.10",
							"service.image.ts": "1515128013261",
							"soajs.catalog.id": "5ad9cab35c967d35b871065c",
							"soajs.env.code": "testenv",
							"soajs.resource.id": "5b150c52e5efc7143ed4ace2",
							"soajs.service.group": "Other",
							"soajs.service.label": "testenv-mongo",
							"soajs.service.mode": "deployment",
							"soajs.service.name": "mongo",
							"soajs.service.subtype": "mongo",
							"soajs.service.type": "cluster"
						}
					},
					"spec": {
						"volumes": [
							{
								"name": "custom-mongo-volume",
								"hostPath": {
									"path": "/data/custom/db/",
									"type": ""
								}
							},
							{
								"name": "test-secret-1",
								"secret": {
									"secretName": "test-secret-1",
									"defaultMode": 420
								}
							}
						],
						"containers": [
							{
								"name": "mongo",
								"image": "mongo:3.4.10",
								"command": [
									"mongod"
								],
								"args": [
									"--smallfiles"
								],
								"ports": [
									{
										"name": "mongo",
										"containerPort": 27017,
										"protocol": "TCP"
									}
								],
								"env": [
									{
										"name": "SOAJS_NX_API_HTTPS",
										"value": "true"
									},
									{
										"name": "SOAJS_NX_API_HTTP_REDIRECT",
										"value": "true"
									},
									{
										"name": "SOAJS_NX_SITE_HTTPS",
										"value": "true"
									},
									{
										"name": "SOAJS_NX_SITE_HTTP_REDIRECT",
										"value": "true"
									}
								],
								"resources": {
									"limits": {
										"cpu": "500m",
										"memory": "581959680"
									}
								},
								"volumeMounts": [
									{
										"name": "custom-mongo-volume",
										"mountPath": "/data/db/"
									},
									{
										"name": "test-secret-1",
										"readOnly": true,
										"mountPath": "defaultPath"
									}
								],
								"readinessProbe": {
									"httpGet": {
										"path": "/",
										"port": 27017,
										"scheme": "HTTP"
									},
									"initialDelaySeconds": 5,
									"timeoutSeconds": 2,
									"periodSeconds": 5,
									"successThreshold": 1,
									"failureThreshold": 3
								},
								"terminationMessagePath": "/dev/termination-log",
								"terminationMessagePolicy": "File",
								"imagePullPolicy": "IfNotPresent"
							}
						],
						"restartPolicy": "Always",
						"terminationGracePeriodSeconds": 30,
						"dnsPolicy": "ClusterFirst",
						"securityContext": {},
						"schedulerName": "default-scheduler"
					}
				},
				"strategy": {
					"type": "RollingUpdate",
					"rollingUpdate": {
						"maxUnavailable": 1,
						"maxSurge": 1
					}
				},
				"revisionHistoryLimit": 2
			},
			"status": {}
		},
		"serviceList": {
			"kind": "ServiceList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/namespaces/soajs/services",
				"resourceVersion": "133790"
			},
			"items": [
				{
					"metadata": {
						"name": "mongo-service",
						"namespace": "soajs",
						"selfLink": "/api/v1/namespaces/soajs/services/mongo-service",
						"uid": "44c838d8-67dd-11e8-9dde-025000000001",
						"resourceVersion": "129940",
						"creationTimestamp": "2018-06-04T09:54:27Z",
						"labels": {
							"memoryLimit": "555",
							"service.image.name": "mongo",
							"service.image.tag": "3.4.10",
							"service.image.ts": "1515128013261",
							"soajs.catalog.id": "5ad9cab35c967d35b871065c",
							"soajs.env.code": "testenv",
							"soajs.resource.id": "5b150c52e5efc7143ed4ace2",
							"soajs.service.group": "Other",
							"soajs.service.label": "testenv-mongo",
							"soajs.service.mode": "deployment",
							"soajs.service.name": "mongo",
							"soajs.service.subtype": "mongo",
							"soajs.service.type": "cluster",
							"soajs.content": "true"
						}
					},
					"spec": {
						"ports": [
							{
								"name": "mongo",
								"protocol": "TCP",
								"port": 27017,
								"targetPort": 27017,
								"nodePort": 32017
							}
						],
						"selector": {
							"soajs.service.label": "testenv-mongo"
						},
						"clusterIP": "10.111.114.115",
						"type": "NodePort",
						"sessionAffinity": "None",
						"externalTrafficPolicy": "Cluster"
					},
					"status": {
						"loadBalancer": {
							"ingress": [
								{
									"hostname": "localhost"
								}
							]
						}
					}
				}
			]
		},
		"autoscalerParams": {
			min: 1,
			max: 3,
			metrics: {cpu: {percent: 80}},
			id: 'mongo',
			type: 'deployment'
		},
		"daemonsetNginx": {
			"kind": "Daemonset"
		},
		"podList": [
			{
			"kind": "PodList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/pods",
				"resourceVersion": "144949"
			},
			"items": [
				{
					"metadata": {
						"name": "compose-5d4f4d67b6-wb2vx",
						"generateName": "compose-5d4f4d67b6-",
						"namespace": "docker",
						"selfLink": "/api/v1/namespaces/docker/pods/compose-5d4f4d67b6-wb2vx",
						"uid": "346c28d5-5d98-11e8-9af0-025000000001",
						"resourceVersion": "123022",
						"creationTimestamp": "2018-05-22T08:14:53Z",
						"labels": {
							"com.docker.deploy-namespace": "docker",
							"com.docker.fry": "compose",
							"com.docker.image-tag": "v0.3.0-rc4",
							"pod-template-hash": "1809082362"
						},
						"ownerReferences": [
							{
								"apiVersion": "extensions/v1beta1",
								"kind": "ReplicaSet",
								"name": "compose-5d4f4d67b6",
								"uid": "346bdff2-5d98-11e8-9af0-025000000001",
								"controller": true,
								"blockOwnerDeletion": true
							}
						]
					},
					"spec": {
						"volumes": [
							{
								"name": "compose-token-65hzj",
								"secret": {
									"secretName": "compose-token-65hzj",
									"defaultMode": 420
								}
							}
						],
						"containers": [
							{
								"name": "compose",
								"image": "docker/kube-compose-controller:v0.3.0-rc4",
								"args": [
									"--kubeconfig",
									"",
									"--reconciliation-interval",
									"30s"
								],
								"resources": {},
								"volumeMounts": [
									{
										"name": "compose-token-65hzj",
										"readOnly": true,
										"mountPath": "/var/run/secrets/kubernetes.io/serviceaccount"
									}
								],
								"terminationMessagePath": "/dev/termination-log",
								"terminationMessagePolicy": "File",
								"imagePullPolicy": "Always"
							}
						],
						"restartPolicy": "Always",
						"terminationGracePeriodSeconds": 30,
						"dnsPolicy": "ClusterFirst",
						"serviceAccountName": "compose",
						"serviceAccount": "compose",
						"nodeName": "docker-for-desktop",
						"securityContext": {},
						"schedulerName": "default-scheduler",
						"tolerations": [
							{
								"key": "node.kubernetes.io/not-ready",
								"operator": "Exists",
								"effect": "NoExecute",
								"tolerationSeconds": 300
							},
							{
								"key": "node.kubernetes.io/unreachable",
								"operator": "Exists",
								"effect": "NoExecute",
								"tolerationSeconds": 300
							}
						]
					},
					"status": {
						"phase": "Running",
						"conditions": [
							{
								"type": "Initialized",
								"status": "True",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-05-22T08:14:53Z"
							},
							{
								"type": "Ready",
								"status": "True",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-06-04T08:13:02Z"
							},
							{
								"type": "PodScheduled",
								"status": "True",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-05-22T08:14:53Z"
							}
						],
						"hostIP": "192.168.65.3",
						"podIP": "10.1.0.54",
						"startTime": "2018-05-22T08:14:53Z",
						"containerStatuses": [
							{
								"name": "compose",
								"state": {
									"running": {
										"startedAt": "2018-06-04T08:13:02Z"
									}
								},
								"lastState": {},
								"ready": true,
								"restartCount": 0,
								"image": "docker/kube-compose-controller:v0.3.0-rc4",
								"imageID": "docker-pullable://docker/kube-compose-controller@sha256:144066d84addbf9de06a47911939c094f4e769476968d00feae17367011ba729",
								"containerID": "docker://287a030369fb975bf2905635ab4703ad87f15837b4de433850b00f50d547d373"
							}
						],
						"qosClass": "BestEffort"
					}
				}
			]
		},
			{
				"kind": "PodList",
				"apiVersion": "v1",
				"metadata": {
					"selfLink": "/api/v1/pods",
					"resourceVersion": "144949"
				},
				"items": [
					{
						"metadata": {
							"name": "mongo-7548f86496-vt8rw",
							"generateName": "mongo-7548f86496-",
							"namespace": "soajs",
							"selfLink": "/api/v1/namespaces/soajs/pods/mongo-7548f86496-vt8rw",
							"uid": "47094eda-67e5-11e8-9dde-025000000001",
							"resourceVersion": "133832",
							"creationTimestamp": "2018-06-04T10:51:47Z",
							"labels": {
								"memoryLimit": "500",
								"pod-template-hash": "3104942052",
								"service.image.name": "mongo",
								"service.image.tag": "3.4.10",
								"service.image.ts": "1515128013261",
								"soajs.catalog.id": "5ad9cab35c967d35b871065c",
								"soajs.env.code": "testenv",
								"soajs.resource.id": "5b150c52e5efc7143ed4ace2",
								"soajs.service.group": "Other",
								"soajs.service.label": "testenv-mongo",
								"soajs.service.mode": "deployment",
								"soajs.service.name": "mongo",
								"soajs.service.replicas": "1",
								"soajs.service.subtype": "mongo",
								"soajs.service.type": "cluster"
							},
							"ownerReferences": [
								{
									"apiVersion": "extensions/v1beta1",
									"kind": "ReplicaSet",
									"name": "mongo-7548f86496",
									"uid": "47084c72-67e5-11e8-9dde-025000000001",
									"controller": true,
									"blockOwnerDeletion": true
								}
							]
						},
						"spec": {
							"volumes": [
								{
									"name": "custom-mongo-volume",
									"hostPath": {
										"path": "/data/custom/db/",
										"type": ""
									}
								},
								{
									"name": "default-token-xn8w2",
									"secret": {
										"secretName": "default-token-xn8w2",
										"defaultMode": 420
									}
								}
							],
							"containers": [
								{
									"name": "mongo",
									"image": "mongo:3.4.10",
									"command": [
										"mongod"
									],
									"args": [
										"--smallfiles"
									],
									"ports": [
										{
											"name": "mongo",
											"containerPort": 27017,
											"protocol": "TCP"
										}
									],
									"resources": {
										"limits": {
											"cpu": "500m",
											"memory": "524288k"
										},
										"requests": {
											"cpu": "500m",
											"memory": "524288k"
										}
									},
									"volumeMounts": [
										{
											"name": "custom-mongo-volume",
											"mountPath": "/data/db/"
										},
										{
											"name": "default-token-xn8w2",
											"readOnly": true,
											"mountPath": "/var/run/secrets/kubernetes.io/serviceaccount"
										}
									],
									"readinessProbe": {
										"httpGet": {
											"path": "/",
											"port": 27017,
											"scheme": "HTTP"
										},
										"initialDelaySeconds": 5,
										"timeoutSeconds": 2,
										"periodSeconds": 5,
										"successThreshold": 1,
										"failureThreshold": 3
									},
									"terminationMessagePath": "/dev/termination-log",
									"terminationMessagePolicy": "File",
									"imagePullPolicy": "IfNotPresent"
								}
							],
							"restartPolicy": "Always",
							"terminationGracePeriodSeconds": 30,
							"dnsPolicy": "ClusterFirst",
							"serviceAccountName": "default",
							"serviceAccount": "default",
							"nodeName": "docker-for-desktop",
							"securityContext": {},
							"schedulerName": "default-scheduler",
							"tolerations": [
								{
									"key": "node.kubernetes.io/not-ready",
									"operator": "Exists",
									"effect": "NoExecute",
									"tolerationSeconds": 300
								},
								{
									"key": "node.kubernetes.io/unreachable",
									"operator": "Exists",
									"effect": "NoExecute",
									"tolerationSeconds": 300
								}
							]
						},
						"status": {
							"phase": "Running",
							"conditions": [
								{
									"type": "Initialized",
									"status": "True",
									"lastProbeTime": null,
									"lastTransitionTime": "2018-06-04T10:51:47Z"
								},
								{
									"type": "Ready",
									"status": "True",
									"lastProbeTime": null,
									"lastTransitionTime": "2018-06-04T10:51:55Z"
								},
								{
									"type": "PodScheduled",
									"status": "True",
									"lastProbeTime": null,
									"lastTransitionTime": "2018-06-04T10:51:47Z"
								}
							],
							"hostIP": "192.168.65.3",
							"podIP": "10.1.0.59",
							"startTime": "2018-06-04T10:51:47Z",
							"containerStatuses": [
								{
									"name": "mongo",
									"state": {
										"running": {
											"startedAt": "2018-06-04T10:51:48Z"
										}
									},
									"lastState": {},
									"ready": true,
									"restartCount": 0,
									"image": "mongo:3.4.10",
									"imageID": "docker-pullable://mongo@sha256:b84baeffd0f14bebaf057b36de9414ee41584a897351795f4a3889257cf19b6d",
									"containerID": "docker://49ca3e923935fcbc8144997190fb4a5cfad8f519f090c66df7fc19ef5c10b5ec"
								}
							],
							"qosClass": "Guaranteed"
						}
					}
				]
			}],
		"hpa": {
			"kind": "HorizontalPodAutoscaler",
			"apiVersion": "autoscaling/v1",
			"metadata": {
				"name": "mongo",
				"namespace": "soajs",
				"selfLink": "/apis/autoscaling/v1/namespaces/soajs/horizontalpodautoscalers/mongo",
				"uid": "44d747e7-67dd-11e8-9dde-025000000001",
				"resourceVersion": "130000",
				"creationTimestamp": "2018-06-04T09:54:27Z",
				"annotations": {
					"autoscaling.alpha.kubernetes.io/conditions": "[{\"type\":\"AbleToScale\",\"status\":\"True\",\"lastTransitionTime\":\"2018-06-04T09:54:57Z\",\"reason\":\"SucceededGetScale\",\"message\":\"the HPA controller was able to get the target's current scale\"},{\"type\":\"ScalingActive\",\"status\":\"False\",\"lastTransitionTime\":\"2018-06-04T09:54:57Z\",\"reason\":\"FailedGetResourceMetric\",\"message\":\"the HPA was unable to compute the replica count: unable to get metrics for resource cpu: unable to fetch metrics from API: the server could not find the requested resource (get pods.metrics.k8s.io)\"}]"
				}
			},
			"spec": {
				"scaleTargetRef": {
					"kind": "Deployment",
					"name": "mongo",
					"apiVersion": "extensions/v1beta1"
				},
				"minReplicas": 1,
				"maxReplicas": 3,
				"targetCPUUtilizationPercentage": 80
			},
			"status": {
				"currentReplicas": 1,
				"desiredReplicas": 0
			}
		},
		"PodListController": {
			"kind": "PodList",
			"apiVersion": "v1",
			"metadata": {
				"selfLink": "/api/v1/namespaces/soajs/pods",
				"resourceVersion": "153833"
			},
			"items": [
				{
					"metadata": {
						"name": "testenv-controller-6f8d5cb99f-jvs2k",
						"generateName": "testenv-controller-6f8d5cb99f-",
						"namespace": "soajs",
						"selfLink": "/api/v1/namespaces/soajs/pods/testenv-controller-6f8d5cb99f-jvs2k",
						"uid": "81020837-680e-11e8-9dde-025000000001",
						"resourceVersion": "153831",
						"creationTimestamp": "2018-06-04T15:46:53Z",
						"labels": {
							"memoryLimit": "500",
							"pod-template-hash": "2948176559",
							"service.branch": "master",
							"service.commit": "468588b0a89e55020f26b805be0ff02e0f31a7d8",
							"service.image.name": "soajs",
							"service.image.prefix": "soajsorg",
							"service.image.tag": "latest",
							"service.image.ts": "1522243952636",
							"service.owner": "soajs",
							"service.repo": "soajs.controller",
							"soajs.catalog.id": "5ad9cab35c967d35b8710657",
							"soajs.content": "true",
							"soajs.env.code": "testenv",
							"soajs.service.group": "soajs-core-services",
							"soajs.service.label": "testenv-controller",
							"soajs.service.mode": "deployment",
							"soajs.service.name": "controller",
							"soajs.service.replicas": "1",
							"soajs.service.repo.name": "soajs-controller",
							"soajs.service.subtype": "soajs",
							"soajs.service.type": "service",
							"soajs.service.version": "1"
						},
						"ownerReferences": [
							{
								"apiVersion": "extensions/v1beta1",
								"kind": "ReplicaSet",
								"name": "testenv-controller-6f8d5cb99f",
								"uid": "8100f31d-680e-11e8-9dde-025000000001",
								"controller": true,
								"blockOwnerDeletion": true
							}
						]
					},
					"spec": {
						"volumes": [
							{
								"name": "soajs-log-volume",
								"hostPath": {
									"path": "/var/log/soajs/",
									"type": ""
								}
							},
							{
								"name": "default-token-xn8w2",
								"secret": {
									"secretName": "default-token-xn8w2",
									"defaultMode": 420
								}
							}
						],
						"containers": [
							{
								"name": "controller",
								"image": "soajsorg/soajs:latest",
								"command": [
									"bash"
								],
								"args": [
									"-c",
									"let registryPort=$(($SOAJS_NX_CONTROLLER_PORT+1000)) && export SOAJS_REGISTRY_API=\"${SOAJS_NX_CONTROLLER_IP_1}:$registryPort\" && node . -T service"
								],
								"workingDir": "/opt/soajs/deployer/",
								"env": [
									{
										"name": "NODE_TLS_REJECT_UNAUTHORIZED",
										"value": "0"
									},
									{
										"name": "NODE_ENV",
										"value": "production"
									},
									{
										"name": "SOAJS_ENV",
										"value": "testenv"
									},
									{
										"name": "SOAJS_PROFILE",
										"value": "/opt/soajs/FILES/profiles/profile.js"
									},
									{
										"name": "SOAJS_SRV_AUTOREGISTERHOST",
										"value": "true"
									},
									{
										"name": "SOAJS_SRV_MEMORY",
										"value": "500"
									},
									{
										"name": "SOAJS_DEPLOY_HA",
										"value": "kubernetes"
									},
									{
										"name": "SOAJS_HA_NAME",
										"valueFrom": {
											"fieldRef": {
												"apiVersion": "v1",
												"fieldPath": "metadata.name"
											}
										}
									},
									{
										"name": "SOAJS_NX_CONTROLLER_NB",
										"value": "1"
									},
									{
										"name": "SOAJS_NX_CONTROLLER_IP_1",
										"value": "undefined"
									},
									{
										"name": "SOAJS_NX_CONTROLLER_PORT",
										"value": "4000"
									},
									{
										"name": "SOAJS_GIT_PROVIDER",
										"value": "github"
									},
									{
										"name": "SOAJS_GIT_DOMAIN",
										"value": "github.com"
									},
									{
										"name": "SOAJS_GIT_OWNER",
										"value": "soajs"
									},
									{
										"name": "SOAJS_GIT_REPO",
										"value": "soajs.controller"
									},
									{
										"name": "SOAJS_GIT_BRANCH",
										"value": "master"
									},
									{
										"name": "SOAJS_GIT_COMMIT",
										"value": "468588b0a89e55020f26b805be0ff02e0f31a7d8"
									}
								],
								"resources": {
									"requests": {
										"memory": "524288k"
									}
								},
								"volumeMounts": [
									{
										"name": "soajs-log-volume",
										"mountPath": "/var/log/soajs/"
									},
									{
										"name": "default-token-xn8w2",
										"readOnly": true,
										"mountPath": "/var/run/secrets/kubernetes.io/serviceaccount"
									}
								],
								"readinessProbe": {
									"httpGet": {
										"path": "/heartbeat",
										"port": "maintenance",
										"scheme": "HTTP"
									},
									"initialDelaySeconds": 5,
									"timeoutSeconds": 2,
									"periodSeconds": 5,
									"successThreshold": 1,
									"failureThreshold": 3
								},
								"terminationMessagePath": "/dev/termination-log",
								"terminationMessagePolicy": "File",
								"imagePullPolicy": "IfNotPresent"
							}
						],
						"restartPolicy": "Always",
						"terminationGracePeriodSeconds": 30,
						"dnsPolicy": "ClusterFirst",
						"serviceAccountName": "default",
						"serviceAccount": "default",
						"nodeName": "docker-for-desktop",
						"securityContext": {},
						"schedulerName": "default-scheduler",
						"tolerations": [
							{
								"key": "node.kubernetes.io/not-ready",
								"operator": "Exists",
								"effect": "NoExecute",
								"tolerationSeconds": 300
							},
							{
								"key": "node.kubernetes.io/unreachable",
								"operator": "Exists",
								"effect": "NoExecute",
								"tolerationSeconds": 300
							}
						]
					},
					"status": {
						"phase": "Running",
						"conditions": [
							{
								"type": "Initialized",
								"status": "True",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-06-04T15:46:53Z"
							},
							{
								"type": "Ready",
								"status": "False",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-06-04T15:46:53Z",
								"reason": "ContainersNotReady",
								"message": "containers with unready status: [controller]"
							},
							{
								"type": "PodScheduled",
								"status": "True",
								"lastProbeTime": null,
								"lastTransitionTime": "2018-06-04T15:46:53Z"
							}
						],
						"hostIP": "192.168.65.3",
						"podIP": "10.1.0.63",
						"startTime": "2018-06-04T15:46:53Z",
						"containerStatuses": [
							{
								"name": "controller",
								"state": {
									"terminated": {
										"exitCode": 0,
										"reason": "Completed",
										"startedAt": "2018-06-04T15:48:42Z",
										"finishedAt": "2018-06-04T15:49:03Z",
										"containerID": "docker://87e4a0ac5d69aa0727e9ab3c9253bf30f07f4ff7961e4577d4c6b2cdb6f89d6b"
									}
								},
								"lastState": {
									"terminated": {
										"exitCode": 0,
										"reason": "Completed",
										"startedAt": "2018-06-04T15:47:53Z",
										"finishedAt": "2018-06-04T15:48:14Z",
										"containerID": "docker://32c111a6552f098d95b2ee02a35490241e02159cfa584a3450c369b8fdd5fdd7"
									}
								},
								"ready": false,
								"restartCount": 3,
								"image": "soajsorg/soajs:latest",
								"imageID": "docker-pullable://soajsorg/soajs@sha256:04c124b1ba99db04605fbb361284ec0e6494031bd0d8456c4f46851fce3caed4",
								"containerID": "docker://87e4a0ac5d69aa0727e9ab3c9253bf30f07f4ff7961e4577d4c6b2cdb6f89d6b"
							}
						],
						"qosClass": "Burstable"
					}
				}
			]
		}
	};
	return data;
};
