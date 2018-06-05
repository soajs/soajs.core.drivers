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
	validator: require('jsonschema'),
};
module.exports = function () {
	let data = {
		'deployer': {
			"soajs": soajs,
			"env": "dashboard",
			"model": {},
			"infra": {
				"name": "google",
				"api": {
					"project": "test-project",
					"token": {
						"type": "service_account",
						"project_id": "test-project",
						"private_key_id": "1",
						"private_key": "1233",
						"client_email": "test@test.com",
						"client_id": "123",
						"auth_uri": "https://accounts.google.com/o/oauth2/auth",
						"token_uri": "https://accounts.google.com/o/oauth2/token",
						"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
						"client_x509_cert_url": "123"
					}
				},
				"stack": {
					"technology": "cluster"
				}
			}
		}
	};
	return data;
};