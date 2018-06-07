'use strict';
let infra = {
	"_id": '5b18008acf544bca9b55cd79',
	"api": {
		"clientId": "1",
		"secret": "2",
		"domain": "3",
		"subscriptionId": "4"
	},
	"name": "azure",
	"technologies": [
		"vm"
	],
	"templates": null,
	"drivers": [
		"Native"
	],
	"label": "Azure Driver",
	"deployments": [],
	"info": [
		[
		
		],
		[
			{
				"code": "AZURE"
			}
		],
		0
	],
};

infra.info[0] = infra.deployments[0] ? infra.deployments[0] : [];
infra.stack = infra.deployments[0];

let registry = {
	"_id": '55128442e603d7e01ab1688c',
	"code": "DASHBOARD",
	"domain": "soajs.org",
	"sitePrefix": "dashboard",
	"apiPrefix": "dashboard-api",
	"locked": true,
	"port": 80,
	"protocol": "http",
	"profile": "/opt/soajs/FILES/profiles/profile.js",
	"deployer": {
		"type": "manual",
		"selected": "manual",
		"manual": {
			"nodes": "127.0.0.1"
		},
		"container": {
			"docker": {
				"local": {
					"nodes": "127.0.0.1",
					"socketPath": "/var/run/docker.sock"
				},
				"remote": {
					"nodes": "127.0.0.1",
					"apiProtocol": "https",
					"auth": {
						"token": "%dockertoken%"
					}
				}
			},
			"kubernetes": {
				"local": {
					"nodes": "127.0.0.1",
					"namespace": "%namespace%",
					"auth": {
						"token": "%kubetoken%"
					}
				},
				"remote": {
					"nodes": "127.0.0.1",
					"namespace": "%namespace%",
					"auth": {
						"token": "%kubetoken%"
					}
				}
			}
		}
	},
	"description": "this is the Dashboard environment",
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
				"password": "soajs key lal massa"
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
				"secret": "this is a secret sentence"
			},
			"session": {
				"name": "soajsID",
				"secret": "this is antoine hage app server",
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
			"params": {}
		}
	};
	return data;
};