'use strict';
let infra = {
	"_id": "5b044a4df920c675412f82e3",
	"name" : "google",
	"label" : "Google Cloud",
	"api" : {
		"project" : "my-project-on-gc",
		"token" : {
			"project_id" : "my-project-on-gc",
			"private_key" : "-----BEGIN PRIVATE KEY-----mytestingkeyforgooglecloud-----END PRIVATE KEY-----\n",
			"client_email" : "me@test.soajs.org",
			"client_id" : "123456789"
		}
	},
	"templates" : [
		"local"
	],
	"deployments" : [
		{
			"technology" : "kubernetes",
			"environments" : [
				"GOOGLE"
			],
			"options" : {
				"network" : "htlocalabcdefgh",
				"nodePoolId" : "template-pool",
				"zone" : "us-east1-b",
				"operationId" : "operation-1234567890-1234567890"
			},
			"id" : "htlocalabcdefgh",
			"name" : "htlocalabcdefgh"
		}
	],
	"technologies" : [
		"kubernetes"
	],
	"drivers" : [
		"GKE"
	],
	"info": [
		[
			{
				"technology" : "kubernetes",
				"environments" : [
					"GOOGLE"
				],
				"options" : {
					"network" : "htlocalabcdefgh",
					"nodePoolId" : "template-pool",
					"zone" : "us-east1-b",
					"operationId" : "operation-1234567890-1234567890"
				},
				"id" : "htlocalabcdefgh",
				"name" : "htlocalabcdefgh"
			}
		],
		[
			{
				"code": "GOOGLE"
			}
		],
		0
	],
	"stack":{
		"technology" : "kubernetes",
		"environments" : [
			"GOOGLE"
		],
		"options" : {
			"network" : "htlocalabcdefgh",
			"nodePoolId" : "template-pool",
			"zone" : "us-east1-b",
			"operationId" : "operation-1234567890-1234567890"
		},
		"id" : "htlocalabcdefgh",
		"name" : "htlocalabcdefgh"
	}
};
let registry = {
	"_id": "5b05a55220957fbc7ac752cc",
	"code": "GOOGLE",
	"description": "werwerw",
	"sensitive": false,
	"domain": "loolper.com",
	"profile": "/opt/soajs/FILES/profiles/profile.js",
	"sitePrefix": "site",
	"apiPrefix": "api",
	"restriction" : {
		"5b044a4df920c675412f82e3" : {
			'eastus' : {
				network : '',
				group : ''
			}
		}
	},
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
					"apiPort": 0,
					"nodes": "",
					"apiProtocol": "",
					"auth": {
						"token": ""
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
					"nodes": "192.168.50.50",
					"namespace": {
						"default": "soajs",
						"perService": false
					},
					"auth": {
						"token": "78954f458f5ec9aaafa45d4322e4302126570585b7ec997584005d8113cb4358b4f7c18a00dd5663727453d45dc7447473c4a9008ba2c1dfc8754df249e05bee41d063f091f283ec36714542fb97725117211fe99da2a81c365dba5290c112c06e4182f661bafe9ba1ff6f12d06110452887a72077f65f4a44431d34478387d48969e1a62da6642390e4c80b444ccbe530459b6f6115d1297de481884b0b7d462f18e70cf8109f75f07b842baa1ee1413c5d6adb2c10173d2d16cc69c525d73b2b9c354a8553d5c86d51bb0abe474458a3562aae8fc648ed4daafa577f72a37aa30a43656a0f1216ea06eeb020e8ba7965f13743bd51b5b415b7506621254ca33f509a5cb6203d6a95202efbd3c5ff2f995af0e428fcef5330e75ae26311b90cc20884145afcab1623713278b2d104541b18d552e2ee67c5b19fafbd8c4830a42e0b5c2abad381ddb0343c9eb70f0575527cfec01efd0baf5bf1d45dfbc99309cbe4923630323ef284ce8c0d94d611c55768209dca646c6f4128ee9d020c266b7fee37081e2a18bdda1dbf2bb16cf599ebaf5a9ad2518e1faf8f0221fa1386298e38390e46ff5d24ca7d49fdbc8dc7c0861d5a8ea57c524abadd2b7d20da8cf9f9ae29c1c70ca85a64f38cc7bee548e3a5d9cbce7d04c076a58849cbe4fb1f0d37270cffdcacd61fe617ed3369ebb995f11a54fc8b097de35ecdba834c2df5eb"
					}
				}
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
	}
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
		"deployCluster": {
			"infra": infra,
			"soajs": soajs,
			"registry": registry,
			"params": {
				"infraCodeTemplate": "HT Kube GC",
				"region": "us-east1-b",
				"workerflavor": "n1-standard-2",
				"workernumber": 1,
				"grid": {
					"columns": {
						"region": {
							"label": "Region",
							"fields": [
								{
									"name": "region",
									"label": "Region"
								},
								{
									"name": "infraCodeTemplate",
									"label": "Infra Code Template"
								}
							]
						},
						"workernodes": {
							"label": "Worker Node(s)",
							"fields": [
								{
									"name": "machineType",
									"label": "Flavor"
								},
								{
									"name": "initialNodeCount",
									"label": "Number"
								}
							]
						}
					}
				},
				"technology": "kubernetes",
				"envCode": "GOOGLE",
				"id": "5a37e81e4f2034185460d32f",
				"driver": "google",
				"resourceDriver": "atlas",
				"bypassInfoCheck": true,
				"headers": {
					"key": "cc9390e7b7bb0a360c899aa904382def1e7cbc8886fe43c89b5541fc6ad1ec9f0dff78e327f9007c718864d7ce71076ac07223a1c59c0d180a4520200917fe9c84917cf63f1579fb66fa60c661e62e293516d0ef95eb24095d366511d2335a8d"
				},
				"soajs_project": "local",
				"protocol": "http",
				"domain": "soajs.org",
				"apiPrefix": "dashboard-api",
				"resource": {
					"driver": "atlas"
				},
				"template": {
					"_id": "5ae5915f885ee42487b7bde4",
					"name": "HT Kube GC",
					"infra": "5a37e81e4f2034185460d32f",
					"description": "Kubernetes Google Cloud",
					"location": "local",
					"driver": "GKE",
					"content": {
						"cluster": {
							"addonsConfig": {
								"kubernetesDashboard": {
									"disabled": false
								},
								"httpLoadBalancing": {
									"disabled": false
								},
								"networkPolicyConfig": {
									"disabled": true
								}
							},
							"name": "template-cluster",
							"zone": "us-central1-a",
							"network": "template-cluster",
							"nodePools": [
								{
									"name": "template-pool",
									"initialNodeCount": 2,
									"config": {
										"machineType": "n1-standard-1",
										"imageType": "COS",
										"diskSizeGb": 100,
										"preemptible": false,
										"oauthScopes": [
											"https://www.googleapis.com/auth/compute",
											"https://www.googleapis.com/auth/devstorage.read_only",
											"https://www.googleapis.com/auth/logging.write",
											"https://www.googleapis.com/auth/monitoring",
											"https://www.googleapis.com/auth/servicecontrol",
											"https://www.googleapis.com/auth/service.management.readonly",
											"https://www.googleapis.com/auth/trace.append",
											"https://www.googleapis.com/auth/cloud-platform"
										],
										"labels": {
											"name": "soajs"
										},
										"serviceAccount": "default"
									},
									"autoscaling": {
										"enabled": false
									},
									"management": {
										"autoUpgrade": false,
										"autoRepair": false,
										"upgradeOptions": {}
									}
								}
							],
							"loggingService": "logging.googleapis.com",
							"monitoringService": "monitoring.googleapis.com",
							"initialClusterVersion": "1.7.12-gke.2",
							"masterAuth": {
								"username": "admin",
								"clientCertificateConfig": {
									"issueClientCertificate": true
								}
							},
							"subnetwork": "default",
							"legacyAbac": {
								"enabled": true
							},
							"masterAuthorizedNetworksConfig": {
								"enabled": false,
								"cidrBlocks": []
							},
							"networkPolicy": {
								"enabled": false,
								"provider": "CALICO"
							},
							"ipAllocationPolicy": {
								"useIpAliases": false
							},
							"description": "this is done manually"
						}
					},
					"type": "_infra",
					"deletable": true,
					"inputs": [
						{
							"name": "workernodes",
							"label": "Worker Nodes",
							"type": "group",
							"entries": [
								{
									"name": "workernumber",
									"label": "Number",
									"type": "number",
									"value": 1,
									"placeholder": "1",
									"tooltip": "Enter how many Worker node machine(s) you want to deploy",
									"required": true,
									"fieldMsg": "Specify how many Work node machine(s) you want your deployment to include upon creation."
								},
								{
									"name": "workerflavor",
									"label": "Machine Type",
									"type": "select",
									"value": [
										{
											"v": "n1-standard-2",
											"l": "N1 Standard 2 / 2 vCPUs x 7.5 GiB",
											"selected": true,
											"group": "General Purpose"
										},
										{
											"v": "n1-standard-4",
											"l": "N1 Standard 4 / 4 vCPUs x 15 GiB",
											"group": "General Purpose"
										},
										{
											"v": "n1-standard-8",
											"l": "N1 Standard 8 / 8 vCPUs x 30 GiB",
											"group": "General Purpose"
										},
										{
											"v": "n1-standard-16",
											"l": "N1 Standard 16 / 16 vCPUs x 60 GiB",
											"group": "General Purpose"
										},
										{
											"v": "n1-highcpu-4",
											"l": "N1 HighCPU 4 / 4 vCPUs x 3.6 GiB",
											"group": "Compute Optimized"
										},
										{
											"v": "n1-highcpu-8",
											"l": "N1 HighCPU 8 / 8 vCPUs x 7.2 GiB",
											"group": "Compute Optimized"
										},
										{
											"v": "n1-highcpu-16",
											"l": "N1 HighCPU 16 / 16 vCPUs x 14.4 GiB",
											"group": "Compute Optimized"
										},
										{
											"v": "n1-highmem-2",
											"l": "N1 HighMEM 2 / 2 vCPUs x 13 GiB",
											"group": "Memory Optimized"
										},
										{
											"v": "n1-highmem-4",
											"l": "N1 HighMEM 4 / 4 vCPUs x 26 GiB",
											"group": "Memory Optimized"
										},
										{
											"v": "n1-highmem-8",
											"l": "N1 HighMEM 8 / 8 vCPUs x 52 GiB",
											"group": "Memory Optimized"
										},
										{
											"v": "n1-highmem-16",
											"l": "N1 HighMEM 16 / 16 vCPUs x 104 GiB",
											"group": "Memory Optimized"
										}
									],
									"tooltip": "Pick the Flavor of your worker node machine(s)",
									"required": true,
									"fieldMsg": "Pick a Machine flavor from CPU & RAM to apply to all your worker node machine(s)."
								}
							]
						}
					],
					"display": {
						"region": {
							"label": "Region",
							"fields": [
								{
									"name": "region",
									"label": "Region"
								},
								{
									"name": "infraCodeTemplate",
									"label": "Infra Code Template"
								}
							]
						},
						"workernodes": {
							"label": "Worker Node(s)",
							"fields": [
								{
									"name": "machineType",
									"label": "Flavor"
								},
								{
									"name": "initialNodeCount",
									"label": "Number"
								}
							]
						}
					},
					"technology": null
				}
			}
		},
		"zones": { kind: 'compute#zoneList',
			id: 'projects/herrontech-rnd/zones/',
			items:
				[
					{ kind: 'compute#zone',
					id: '2231',
					creationTimestamp: '1969-12-31T16:00:00.000-08:00',
					name: 'us-east1-b',
					description: 'us-east1-b',
					status: 'UP',
					region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east1',
					selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east1-b',
					availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2233',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-east1-c',
						description: 'us-east1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2234',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-east1-d',
						description: 'us-east1-d',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east1-d',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2272',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-east4-c',
						description: 'us-east4-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east4-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2271',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-east4-b',
						description: 'us-east4-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east4-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2270',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-east4-a',
						description: 'us-east4-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-east4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-east4-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2002',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-central1-c',
						description: 'us-central1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-central1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-central1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2000',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-central1-a',
						description: 'us-central1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-central1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-central1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2004',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-central1-f',
						description: 'us-central1-f',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-central1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-central1-f',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2001',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-central1-b',
						description: 'us-central1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-central1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-central1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2211',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west1-b',
						description: 'us-west1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2212',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west1-c',
						description: 'us-west1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2210',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west1-a',
						description: 'us-west1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2342',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west4-a',
						description: 'europe-west4-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west4-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2341',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west4-b',
						description: 'europe-west4-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west4-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2340',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west4-c',
						description: 'europe-west4-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west4',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west4-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2101',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west1-b',
						description: 'europe-west1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2104',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west1-d',
						description: 'europe-west1-d',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west1-d',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2103',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west1-c',
						description: 'europe-west1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2302',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west3-b',
						description: 'europe-west3-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west3',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west3-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2300',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west3-c',
						description: 'europe-west3-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west3',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west3-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2301',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west3-a',
						description: 'europe-west3-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west3',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west3-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2292',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west2-c',
						description: 'europe-west2-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west2-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2291',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west2-b',
						description: 'europe-west2-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west2-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2290',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-west2-a',
						description: 'europe-west2-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-west2-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2221',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-east1-b',
						description: 'asia-east1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2220',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-east1-a',
						description: 'asia-east1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2222',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-east1-c',
						description: 'asia-east1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2261',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-southeast1-b',
						description: 'asia-southeast1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-southeast1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2260',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-southeast1-a',
						description: 'asia-southeast1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-southeast1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2262',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-southeast1-c',
						description: 'asia-southeast1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-southeast1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2251',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-northeast1-b',
						description: 'asia-northeast1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-northeast1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2252',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-northeast1-c',
						description: 'asia-northeast1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-northeast1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2250',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-northeast1-a',
						description: 'asia-northeast1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-northeast1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2322',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-south1-c',
						description: 'asia-south1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-south1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-south1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2320',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-south1-b',
						description: 'asia-south1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-south1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-south1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2321',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'asia-south1-a',
						description: 'asia-south1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-south1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-south1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2282',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'australia-southeast1-b',
						description: 'australia-southeast1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/australia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/australia-southeast1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2280',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'australia-southeast1-c',
						description: 'australia-southeast1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/australia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/australia-southeast1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2281',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'australia-southeast1-a',
						description: 'australia-southeast1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/australia-southeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/australia-southeast1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2311',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'southamerica-east1-b',
						description: 'southamerica-east1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/southamerica-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/southamerica-east1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2312',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'southamerica-east1-c',
						description: 'southamerica-east1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/southamerica-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/southamerica-east1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2310',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'southamerica-east1-a',
						description: 'southamerica-east1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/southamerica-east1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/southamerica-east1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2352',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-north1-a',
						description: 'europe-north1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-north1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-north1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2350',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-north1-b',
						description: 'europe-north1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-north1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-north1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2351',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'europe-north1-c',
						description: 'europe-north1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/europe-north1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/europe-north1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2330',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'northamerica-northeast1-a',
						description: 'northamerica-northeast1-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/northamerica-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/northamerica-northeast1-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2331',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'northamerica-northeast1-b',
						description: 'northamerica-northeast1-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/northamerica-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/northamerica-northeast1-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2332',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'northamerica-northeast1-c',
						description: 'northamerica-northeast1-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/northamerica-northeast1',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/northamerica-northeast1-c',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2362',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west2-a',
						description: 'us-west2-a',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west2-a',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2361',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west2-b',
						description: 'us-west2-b',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west2-b',
						availableCpuPlatforms: [Object] },
					{ kind: 'compute#zone',
						id: '2360',
						creationTimestamp: '1969-12-31T16:00:00.000-08:00',
						name: 'us-west2-c',
						description: 'us-west2-c',
						status: 'UP',
						region: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/us-west2',
						selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/us-west2-c',
						availableCpuPlatforms: [Object] } ],
			selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/'
		},
		"region": { kind: 'compute#region',
			id: '1220',
			creationTimestamp: '1969-12-31T16:00:00.000-08:00',
			name: 'asia-east1',
			description: 'asia-east1',
			status: 'UP',
			zones:
				[ 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-a',
					'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-b',
					'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/zones/asia-east1-c' ],
			quotas:
				[ { metric: 'CPUS', limit: 72, usage: 0 },
					{ metric: 'DISKS_TOTAL_GB', limit: 40960, usage: 0 },
					{ metric: 'STATIC_ADDRESSES', limit: 21, usage: 0 },
					{ metric: 'IN_USE_ADDRESSES', limit: 69, usage: 0 },
					{ metric: 'SSD_TOTAL_GB', limit: 20480, usage: 0 },
					{ metric: 'LOCAL_SSD_TOTAL_GB', limit: 20000, usage: 0 },
					{ metric: 'INSTANCE_GROUPS', limit: 300, usage: 0 },
					{ metric: 'INSTANCE_GROUP_MANAGERS', limit: 150, usage: 0 },
					{ metric: 'INSTANCES', limit: 720, usage: 0 },
					{ metric: 'AUTOSCALERS', limit: 150, usage: 0 },
					{ metric: 'REGIONAL_AUTOSCALERS', limit: 100, usage: 0 },
					{ metric: 'REGIONAL_INSTANCE_GROUP_MANAGERS',
						limit: 100,
						usage: 0 },
					{ metric: 'PREEMPTIBLE_CPUS', limit: 0, usage: 0 },
					{ metric: 'NVIDIA_K80_GPUS', limit: 8, usage: 0 },
					{ metric: 'COMMITMENTS', limit: 0, usage: 0 },
					{ metric: 'INTERNAL_ADDRESSES', limit: 200, usage: 0 },
					{ metric: 'NVIDIA_P100_GPUS', limit: 1, usage: 0 },
					{ metric: 'PREEMPTIBLE_LOCAL_SSD_GB', limit: 0, usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_K80_GPUS', limit: 1, usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_P100_GPUS', limit: 1, usage: 0 },
					{ metric: 'NVIDIA_P100_VWS_GPUS', limit: 1, usage: 0 },
					{ metric: 'NVIDIA_V100_GPUS', limit: 1, usage: 0 },
					{ metric: 'NVIDIA_P4_GPUS', limit: 1, usage: 0 },
					{ metric: 'NVIDIA_P4_VWS_GPUS', limit: 1, usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_V100_GPUS', limit: 1, usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_P4_GPUS', limit: 1, usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_P100_VWS_GPUS',
						limit: 1,
						usage: 0 },
					{ metric: 'PREEMPTIBLE_NVIDIA_P4_VWS_GPUS', limit: 1, usage: 0 },
					{ metric: 'INTERCONNECT_ATTACHMENTS_PER_REGION',
						limit: 16,
						usage: 0 },
					{ metric: 'INTERCONNECT_ATTACHMENTS_TOTAL_MBPS',
						limit: 80000,
						usage: 0 },
					{ metric: 'RESOURCE_POLICIES', limit: 10, usage: 0 },
					{ metric: 'IN_USE_BACKUP_SCHEDULES', limit: 50, usage: 0 } ],
			selfLink: 'https://www.googleapis.com/compute/v1/projects/herrontech-rnd/regions/asia-east1' }
	};
	return data;
};