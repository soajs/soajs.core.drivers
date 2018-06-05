'use strict';
let infra = {
	"_id": "5b044a4df920c675412f82e3",
	"name" : "aws",
	"label" : "Amazon Web Services",
	"api" : {
		"keyId" : "1234567890",
		"secretAccessKey" : "abcdefgh-1234567890"
	},
	"templates" : [
		"external"
	],
	"technologies" : [
		"docker"
	],
	"deployments" : [
		{
			"technology" : "docker",
			"options" : {
				"zone" : "us-east-1",
				"template" : "mydockerawstemplate.tmpl",
				"ElbName" : "htlocalau-External-1234ABCD",
				"ZonesAvailable" : [
					"subnet-c6f92ca1",
					"subnet-250bc20b",
					"subnet-2064f76a"
				],
				"ExternalLBSecurityGroupID" : "sg-123456abc"
			},
			"environments" : [
				"AWS"
			],
			"loadBalancers" : {
			
			},
			"name" : "htlocal1234abcdefgh",
			"id" : "arn:aws:cloudformation:us-east-1:1234567890:stack/htlocal1234abcdefgh/f801dd40-64da-11e8-bf66-50fae98a2435"
		}
	],
	"drivers" : [
		"Cloud Formation"
	],
	"info": [
		[
		
		],
		[
			{
				"code": "AWS"
			}
		],
		0
	],
};

infra.info[0] = infra.deployments[0];
infra.stack = infra.deployments[0];

let registry = {
	"_id": "5b05a55220957fbc7ac752cc",
	"code": "AWS",
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
					"nodes": "192.168.50.50",
					"apiProtocol": "https",
					"auth": {
						"token": "9b96ba56ce934ded56c3f21ac9bdaddc8ba4782b7753cf07576bfabcace8632eba1749ff1187239ef1f56dd74377aa1e5d0a1113de2ed18368af4b808ad245bc7da986e101caddb7b75992b14d6a866db884ea8aee5ab02786886ecf9f25e974"
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
				"infraCodeTemplate": "mydockerTemplate.tmpl",
				"region": "us-east-1",
				"EnableSystemPrune": "no",
				"EnableCloudWatchLogs": "no",
				"EnableCloudWatchDetailedMonitoring": "no",
				"EnableEbsOptimized": "no",
				"EnableCloudStorEfs": "no",
				"ManagerInstanceType": "t2.medium",
				"ManagerDiskType": "gp2",
				"InstanceType": "t2.medium",
				"WorkerDiskType": "standard",
				"KeyName": "soajs",
				"ManagerSize": 1,
				"ManagerDiskSize": 20,
				"ClusterSize": 1,
				"WorkerDiskSize": 20,
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
						"masternodes": {
							"label": "Master Node(s)",
							"fields": [
								{
									"name": "ManagerInstanceType",
									"label": "Flavor"
								},
								{
									"name": "ManagerSize",
									"label": "Number"
								},
								{
									"name": "ManagerDiskSize",
									"label": "Storage"
								},
								{
									"name": "ManagerDiskType",
									"label": "Storage Type"
								}
							]
						},
						"workernodes": {
							"label": "Worker Node(s)",
							"fields": [
								{
									"name": "ClusterSize",
									"label": "Flavor"
								},
								{
									"name": "InstanceType",
									"label": "Number"
								},
								{
									"name": "WorkerDiskSize",
									"label": "Storage"
								},
								{
									"name": "WorkerDiskType",
									"label": "Storage Type"
								}
							]
						}
					}
				},
				"technology": "docker",
				"envCode": "AWS",
				"id": "5ae08023c29b8c0149bc1543",
				"driver": "aws",
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
				}
			}
		}
	};
	return data;
};