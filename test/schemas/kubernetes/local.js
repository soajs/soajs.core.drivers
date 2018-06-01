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
			"name": "htlocalndwdqhrhe78tw",
			"id": "htlocalndwdqhrhe78tw"
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
		"name": "htlocalndwdqhrhe78tw",
		"id": "htlocalndwdqhrhe78tw"
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
	validator: require('soajs').core.validator,
};
let deployer = {
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
};
module.exports = function () {
	let data = {
		"deployer": deployer,
		"listSecrets": Object.assign({
			"params": {}, deployer
		}),
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
		"createSecret": Object.assign({
			"params": {
				"name": "test-secret-1",
				"data": {
					"test-secret-1": "123456"
				},
				"type": "Opaque"
			}
		}, deployer),
		"deleteSecret": Object.assign({
			"params": {
				"name": "test-secret-1"
			}
		}, deployer),
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
		"listServices": Object.assign({
			"params": {
				"env": "testenv"
			}
		}, deployer),
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
											"limits": {
												"memory": "170Mi"
											},
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
											"requests": {
												"cpu": "150m",
												"memory": "20Mi"
											}
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
											"requests": {
												"cpu": "10m",
												"memory": "20Mi"
											}
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
		}
	};
	return data;
};