'use strict';
let infra = {
	"_id": "5b044a4df920c675412f82e3",
	"name": "aws",
	"label": "Amazon Web Services",
	"api": {
		"keyId": "1234567890",
		"secretAccessKey": "abcdefgh-1234567890"
	},
	"templates": [
		"external"
	],
	"technologies": [
		"docker"
	],
	"deployments": [
		{
			"technology": "docker",
			"options": {
				"zone": "us-east-1",
				"template": "mydockerawstemplate.tmpl",
				"ElbName": "htlocalau-External-1234ABCD",
				"ZonesAvailable": [
					"subnet-c6f92ca1",
					"subnet-250bc20b",
					"subnet-2064f76a"
				],
				"ExternalLBSecurityGroupID": "sg-123456abc"
			},
			"environments": [
				"AWS"
			],
			"loadBalancers": {},
			"name": "htlocal1234abcdefgh",
			"id": "arn:aws:cloudformation:us-east-1:1234567890:stack/htlocal1234abcdefgh/f801dd40-64da-11e8-bf66-50fae98a2435"
		}
	],
	"drivers": [
		"Cloud Formation"
	],
	"info": [
		[],
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
					"key": "123"
				},
				"soajs_project": "local",
				"protocol": "http",
				"domain": "soajs.org",
				"apiPrefix": "dashboard-api",
				"resource": {
					"driver": "atlas"
				}
			}
		},
		"listNetworkRaw": {
			"Vpcs": [
				{
					"CidrBlock": "172.31.0.0/16",
					"DhcpOptionsId": "dopt-5ab4fc23",
					"State": "available",
					"VpcId": "vpc-a5e482dd",
					"InstanceTenancy": "dedicated",
					"Ipv6CidrBlockAssociationSet": [],
					"CidrBlockAssociationSet": [
						{
							"AssociationId": "vpc-cidr-assoc-ec3e5a86",
							"CidrBlock": "172.31.0.0/16",
							"CidrBlockState": {
								"State": "associated"
							}
						}
					],
					"IsDefault": true,
					"Tags": [
						{
							"Key": "Name",
							"Value": "networkName"
						}
					]
				}
			]
		},
		"listNetwork": [
			{
				"region": "us-east-1",
				"subnets": [
					{
						"id": "subnet-97c7abf3",
						"name": "subnetName",
						"address": "172.31.0.0/20",
						"state": "available",
						"availabilityZone": "us-east-1a"
					},
					{
						"id": "subnet-1336e83c",
						"name": "subnet-1336e83c",
						"address": "172.31.80.0/20",
						"state": "available",
						"availabilityZone": "us-east-1b"
					}
				],
				"name": "networkName",
				"id": "vpc-a5e482dd",
				"state": "available",
				"instanceTenancy": "dedicated",
				"attachInternetGateway": true,
				"primaryAddress": "172.31.0.0/16",
				"IsDefault": true,
				"address": [
					"172.31.0.0/16"
				]
			}
		],
        "getNetwork": {
                "region": "us-east-1",
                "subnets": [
                    {
                        "id": "subnet-97c7abf3",
                        "name": "subnetName",
                        "address": "172.31.0.0/20",
                        "state": "available",
                        "availabilityZone": "us-east-1a"
                    },
                    {
                        "id": "subnet-1336e83c",
                        "name": "subnet-1336e83c",
                        "address": "172.31.80.0/20",
                        "state": "available",
                        "availabilityZone": "us-east-1b"
                    }
                ],
                "name": "networkName",
                "id": "vpc-a5e482dd",
                "state": "available",
                "instanceTenancy": "dedicated",
                "attachInternetGateway": true,
                "primaryAddress": "172.31.0.0/16",
                "IsDefault": true,
                "address": [
                    "172.31.0.0/16"
                ]
            },
		"listSubnetRaw": {
			"Subnets": [
				{
					"AvailabilityZone": "us-east-1a",
					"AvailableIpAddressCount": 4091,
					"CidrBlock": "172.31.0.0/20",
					"DefaultForAz": true,
					"MapPublicIpOnLaunch": true,
					"State": "available",
					"SubnetId": "subnet-97c7abf3",
					"VpcId": "vpc-a5e482dd",
					"AssignIpv6AddressOnCreation": false,
					"Ipv6CidrBlockAssociationSet": [],
					"Tags": [{
						"Key": "Name",
						"Value": "subnetName"
					}]
				},
				{
					"AvailabilityZone": "us-east-1b",
					"AvailableIpAddressCount": 4090,
					"CidrBlock": "172.31.80.0/20",
					"DefaultForAz": true,
					"MapPublicIpOnLaunch": true,
					"State": "available",
					"SubnetId": "subnet-1336e83c",
					"VpcId": "vpc-a5e482dd",
					"AssignIpv6AddressOnCreation": false,
					"Ipv6CidrBlockAssociationSet": [],
					"Tags": []
				}

			]
		},
		"listSubnets": [
			{
				"id": "subnet-97c7abf3",
				"name": "subnetName",
				"address": "172.31.0.0/20",
				"state": "available",
				"availabilityZone": "us-east-1a"
			},
			{
				"id": "subnet-1336e83c",
				"name": "subnet-1336e83c",
				"address": "172.31.80.0/20",
				"state": "available",
				"availabilityZone": "us-east-1b"
			}
		],
		"listIpsRaw": {
			"Addresses": [
				{
					"PublicIp": "13.58.241.28",
					"AllocationId": "eipalloc-0bb2a617994518740",
					"Domain": "vpc",
					"Tags": []
				},
				{
					"InstanceId": "i-1234567890abcdef0",
					"NetworkInterfaceId": "eni-12345678",
					"PrivateIpAddress": "10.0.1.241",
					"Tags": []
				}
			],
		},
		"listIps": [
			{
				"id": "eipalloc-0bb2a617994518740",
				"region": "us-east-2",
				"address": "13.58.241.28",
				"type": "vpc"
			},
			{
				"region": "us-east-2",
				"instanceId": "i-1234567890abcdef0",
				"privateAddress": "10.0.1.241"
			}
		],
		"createPublicIpResponse": {
			"PublicIp": "18.216.147.194",
			"AllocationId": "eipalloc-0da3553f242237241",
			"Domain": "vpc"
		},
		"listKeyPairsRaw": {
			"KeyPairs": [
				{
					"KeyFingerprint": "1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f",
					"KeyName": "my-key-pair"
				}
			]
		},
		"listKeyPairsRaw2": {
			"KeyPairs": []
		},
		"listKeyPairs": [
			{
				"fingerprint": "1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f",
				"name": "my-key-pair",
				"region": "us-east-2"
			}
		],
		"createKeyPairRaw": {
			"KeyFingerprint": "1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f",
			"KeyName": "my-key-pair",
			"KeyMaterial": "RSA PRIVATE KEY"
		},
		"createKeyPair": {
			"fingerprint": "1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f",
			"name": "my-key-pair",
			"region": "us-east-2",
			"privateKey": "RSA PRIVATE KEY"
		},
		"listCertificatesRaw": {
			"CertificateSummaryList": [
				{
					"DomainName": "www.test.com",
					"CertificateArn": "1234567890"
				}
			]
		},
		"listCertificatesRaw2": {
			"CertificateSummaryList": []
		},
		"describeCertificateRaw": {
			"Certificate":
				{
					"CertificateArn": "1234567890",
					"DomainName": "www.test.com",
					"SubjectAlternativeNames": [ "www.test.org", "www.test.net" ],
					"Issuer": "Let's Encrypt",
					"ImportedAt": "2018-02-23T11:58:38.000Z",
					"Status": "EXPIRED",
					"NotBefore": "2017-12-19T11:18:20.000Z",
					"NotAfter": "2018-03-19T11:18:20.000Z",
					"Type": "IMPORTED"
				}
		},
		"describeCertificateRaw2": {
			"Certificate":
				{}
		},
		"listCertificates": [
			{
				"region": "us-east-2",
				"id": "1234567890",
				"domain": "www.test.com",
				"alternativeDomains": ["www.test.org", "www.test.net"],
				"type": "imported",
				"details": {
					"issuer": "Let's Encrypt",
					"importDate": "2018-02-23T11:58:38.000Z",
					"status": "expired",
					"validFrom": "2017-12-19T11:18:20.000Z",
					"validTo": "2018-03-19T11:18:20.000Z"
				},
				"dnsConfig": []
			}
		],
		"listRawLb": {
			"LoadBalancerDescriptions": [
				{
					"LoadBalancerName": "elb-internal-ragheb",
					"DNSName": "internal-elb-internal-ragheb-408965366.us-east-2.elb.amazonaws.com",
					"CanonicalHostedZoneNameID": "Z3AADJGX6KTTL2",
					"ListenerDescriptions": [
						{
							"Listener": {
								"Protocol": "HTTP",
								"LoadBalancerPort": 80,
								"InstanceProtocol": "HTTP",
								"InstancePort": 80
							},
							"PolicyNames": []
						},
						{
							"Listener": {
								"Protocol": "HTTPS",
								"LoadBalancerPort": 443,
								"InstanceProtocol": "HTTPS",
								"InstancePort": 443,
								"SSLCertificateId": "arn:"
							},
							"PolicyNames": []
						}
					],
					"Policies": {
						"AppCookieStickinessPolicies": [],
						"LBCookieStickinessPolicies": [],
						"OtherPolicies": []
					},
					"BackendServerDescriptions": [],
					"AvailabilityZones": [
						"us-east-1a",
						"us-east-1b",
					],
					"Subnets": [
						"subnet-97c7abf3",
						"subnet-1336e83c"
					],
					"VPCId": "vpc-a5e482dd",
					"Instances": [],
					"HealthCheck": {
						"Target": "HTTP:80/index.html",
						"Interval": 30,
						"Timeout": 5,
						"UnhealthyThreshold": 2,
						"HealthyThreshold": 10
					},
					"SourceSecurityGroup": {
						"OwnerAlias": "019397354664",
						"GroupName": "default"
					},
					"SecurityGroups": [
						"sg-ca3421a3"
					],
					"CreatedTime": "2018-08-14T16:35:19.220Z",
					"Scheme": "internal"
				},
				{
					"LoadBalancerName": "test-lb-ragheb",
					"DNSName": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
					"CanonicalHostedZoneName": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
					"CanonicalHostedZoneNameID": "Z3AADJGX6KTTL2",
					"ListenerDescriptions": [
						{
							"Listener": {
								"Protocol": "HTTP",
								"LoadBalancerPort": 80,
								"InstanceProtocol": "HTTP",
								"InstancePort": 80
							},
							"PolicyNames": []
						}
					],
					"Policies": {
						"AppCookieStickinessPolicies": [],
						"LBCookieStickinessPolicies": [],
						"OtherPolicies": []
					},
					"BackendServerDescriptions": [],
					"AvailabilityZones": [
						"us-east-1a",
						"us-east-1b",
					],
					"Subnets": [
						"subnet-97c7abf3",
						"subnet-1336e83c"
					],
					"VPCId": "vpc-957300fc",
					"Instances": [
						{
							"InstanceId": "i-0bb24a3de714f9fba"
						}
					],
					"HealthCheck": {
						"Target": "HTTP:80/index.html",
						"Interval": 30,
						"Timeout": 5,
						"UnhealthyThreshold": 2,
						"HealthyThreshold": 10
					},
					"SourceSecurityGroup": {
						"OwnerAlias": "019397354664",
						"GroupName": "default"
					},
					"SecurityGroups": [
						"sg-ca3421a3"
					],
					"CreatedTime": "2018-08-14T16:25:32.560Z",
					"Scheme": "internet-facing"
				}]
		},
		"listlbIstances": {
			"InstanceStates": [{
				"InstanceId": "i-0bb24a3de714f9fba",
				"State": "OutOfService",
				"ReasonCode": "Instance",
				"Description": "Instance has failed at least the UnhealthyThreshold number of health checks consecutively."
			}]
		},
		"listlb": [
			{
				"region": 'us-east-1',
				"type": "classic",
				"id": "elb-internal-ragheb",
				"name": "elb-internal-ragheb",
				"mode": "private",
				"networkId": "vpc-a5e482dd",
				"domain": "internal-elb-internal-ragheb-408965366.us-east-2.elb.amazonaws.com",
				"securityGroupIds": [
					"sg-ca3421a3"
				],
				"createdTime": "2018-08-14T16:35:19.220Z",
				"healthProbe": {
					"healthProbePath": "/index.html",
					"healthProbeProtocol": "HTTP",
					"healthProbePort": "80",
					"healthProbeInterval": 30,
					"healthProbeTimeout": 5,
					"maxFailureAttempts": 2,
					"maxSuccessAttempts": 10
				},
				"rules": [
					{
						"backendProtocol": "http",
						"backendPort": 80,
						"frontendProtocol": "http",
						"frontendPort": 80
					},
					{
						"backendProtocol": "https",
						"backendPort": 443,
						"frontendProtocol": "https",
						"frontendPort": 443,
						"certificate": "arn:"
					}
				],
				"zones": [
					{
						"name": "us-east-1a",
						"subnetId": "subnet-97c7abf3"
					},
					{
						"name": "us-east-1b",
						"subnetId": "subnet-1336e83c"
					}
				],
				"instances": [
					{
						"id": "i-0bb24a3de714f9fba",
						"state": "OutOfService"
					}
				]
			},
			{
				"type": "classic",
				"region": 'us-east-1',
				"id": "test-lb-ragheb",
				"name": "test-lb-ragheb",
				"mode": "public",
				"networkId": "vpc-957300fc",
				"domain": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
				"securityGroupIds": [
					"sg-ca3421a3"
				],
				"createdTime": "2018-08-14T16:25:32.560Z",
				"healthProbe": {
					"healthProbePath": "/index.html",
					"healthProbeProtocol": "HTTP",
					"healthProbePort": "80",
					"healthProbeInterval": 30,
					"healthProbeTimeout": 5,
					"maxFailureAttempts": 2,
					"maxSuccessAttempts": 10
				},
				"rules": [
					{
						"backendProtocol": "http",
						"backendPort": 80,
						"frontendProtocol": "http",
						"frontendPort": 80
					}
				],
				"zones": [
					{
						"name": "us-east-1a",
						"subnetId": "subnet-97c7abf3"
					},
					{
						"name": "us-east-1b",
						"subnetId": "subnet-1336e83c"
					}
				],
				"instances": [
					{
						"id": "i-0bb24a3de714f9fba",
						"state": "OutOfService"
					}
				]
			}
		],
		"listVmInstances": {
			"Reservations": [
				{
					"Groups": [],
					"Instances": [
						{
							"AmiLaunchIndex": 0,
							"ImageId": "ami-5e8bb23b",
							"InstanceId": "i-0bb24a3de714f9fba",
							"InstanceType": "t2.micro",
							"KeyName": "ragheb",
							"LaunchTime": "2018-08-23T12:05:08.000Z",
							"Monitoring": {
								"State": "disabled"
							},
							"Placement": {
								"AvailabilityZone": "us-east-2c",
								"GroupName": "",
								"Tenancy": "default"
							},
							"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
							"PrivateIpAddress": "172.31.43.192",
							"ProductCodes": [],
							"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
							"PublicIpAddress": "18.218.148.78",
							"State": {
								"Code": 16,
								"Name": "running"
							},
							"StateTransitionReason": "",
							"SubnetId": "subnet-110ad95c",
							"VpcId": "vpc-957300fc",
							"Architecture": "x86_64",
							"BlockDeviceMappings": [
								{
									"DeviceName": "/dev/sda1",
									"Ebs": {
										"AttachTime": "2018-08-23T12:05:08.000Z",
										"DeleteOnTermination": true,
										"Status": "attached",
										"VolumeId": "vol-07cd719b38c1b2b32"
									}
								}
							],
							"ClientToken": "",
							"EbsOptimized": false,
							"EnaSupport": true,
							"Hypervisor": "xen",
							"IamInstanceProfile": {
								"Arn": "arn:aws:iam::019397354664:instance-profile/ssm-role-ec2",
								"Id": "AIPAJFEAU5GHX7L5IRDKW"
							},
							"ElasticGpuAssociations": [],
							"NetworkInterfaces": [
								{
									"Association": {
										"IpOwnerId": "amazon",
										"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
										"PublicIp": "18.218.148.78"
									},
									"Attachment": {
										"AttachTime": "2018-08-23T12:05:08.000Z",
										"AttachmentId": "eni-attach-0a4b76d42a1039d18",
										"DeleteOnTermination": true,
										"DeviceIndex": 0,
										"Status": "attached"
									},
									"Description": "",
									"Groups": [
										{
											"GroupName": "launch-wizard-4",
											"GroupId": "sg-04031e85cc930b578"
										}
									],
									"Ipv6Addresses": [],
									"MacAddress": "0a:be:23:ef:cc:68",
									"NetworkInterfaceId": "eni-072868ea5a0fb76fd",
									"OwnerId": "019397354664",
									"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
									"PrivateIpAddress": "172.31.43.192",
									"PrivateIpAddresses": [
										{
											"Association": {
												"IpOwnerId": "amazon",
												"PublicDnsName": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
												"PublicIp": "18.218.148.78"
											},
											"Primary": true,
											"PrivateDnsName": "ip-172-31-43-192.us-east-2.compute.internal",
											"PrivateIpAddress": "172.31.43.192"
										}
									],
									"SourceDestCheck": true,
									"Status": "in-use",
									"SubnetId": "subnet-110ad95c",
									"VpcId": "vpc-957300fc"
								}
							],
							"RootDeviceName": "/dev/sda1",
							"RootDeviceType": "ebs",
							"SecurityGroups": [
								{
									"GroupName": "launch-wizard-4",
									"GroupId": "sg-04031e85cc930b578"
								}
							],
							"SourceDestCheck": true,
							"Tags": [
								{
									"Key": "Name",
									"Value": "command"
								}
							],
							"VirtualizationType": "hvm"
						}
					],
					"OwnerId": "019397354664",
					"ReservationId": "r-0158d70fee24517b7"
				}
			]
		},
		"listImages": {
			"Images": [{
				"Architecture": "x86_64",
				"CreationDate": "2018-06-27T13:44:22.000Z",
				"ImageId": "ami-5e8bb23b",
				"ImageLocation": "099720109477/ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-20180627",
				"ImageType": "machine",
				"Public": true,
				"OwnerId": "099720109477",
				"ProductCodes": [],
				"State": "available",
				"BlockDeviceMappings": [
					{
						"DeviceName": "/dev/sda1",
						"Ebs": {
							"Encrypted": false,
							"DeleteOnTermination": true,
							"SnapshotId": "snap-015e0c9bfb72bf22e",
							"VolumeSize": 8,
							"VolumeType": "gp2"
						}
					},
					{
						"DeviceName": "/dev/sdb",
						"VirtualName": "ephemeral0"
					},
					{
						"DeviceName": "/dev/sdc",
						"VirtualName": "ephemeral1"
					}
				],
				"Description": "Canonical, Ubuntu, 16.04 LTS, amd64 xenial image build on 2018-06-27",
				"EnaSupport": true,
				"Hypervisor": "xen",
				"Name": "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-20180627",
				"RootDeviceName": "/dev/sda1",
				"RootDeviceType": "ebs",
				"SriovNetSupport": "simple",
				"Tags": [],
				"VirtualizationType": "hvm"
			}]
		},
		"listDisks": {
			"Volumes": [{
				"Attachments": [
					{
						"AttachTime": "2018-08-23T12:05:08.000Z",
						"Device": "/dev/sda1",
						"InstanceId": "i-0d494775f3fade6a4",
						"State": "attached",
						"VolumeId": "vol-07cd719b38c1b2b32",
						"DeleteOnTermination": true
					}
				],
				"AvailabilityZone": "us-east-2c",
				"CreateTime": "2018-08-23T12:05:08.670Z",
				"Encrypted": false,
				"Size": 8,
				"SnapshotId": "snap-015e0c9bfb72bf22e",
				"State": "in-use",
				"VolumeId": "vol-07cd719b38c1b2b32",
				"Iops": 100,
				"Tags": [],
				"VolumeType": "gp2"
			}]
		},
		"listSecurityGroups": {
			"SecurityGroups": [{
				"Description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
				"GroupName": "launch-wizard-4",
				"IpPermissions": [
					{
						"FromPort": 22,
						"IpProtocol": "tcp",
						"IpRanges": [
							{
								"CidrIp": "0.0.0.0/0"
							}
						],
						"Ipv6Ranges": [
							{
								"CidrIpv6": "ip6address"
							}
						],
						"PrefixListIds": [],
						"ToPort": 22,
						"UserIdGroupPairs": []
					},
					{
						"FromPort": 33,
						"IpProtocol": "tcp",
						"Ipv6Ranges": [],
						"PrefixListIds": [],
						"ToPort": 33,
						"UserIdGroupPairs": [
							{
								"GroupId": "group"
							}
						]
					}
				],
				"OwnerId": "019397354664",
				"GroupId": "sg-04031e85cc930b578",
				"IpPermissionsEgress": [
					{
						"IpProtocol": "-1",
						"IpRanges": [
							{
								"CidrIp": "0.0.0.0/0"
							}
						],
						"Ipv6Ranges": [],
						"PrefixListIds": [],
						"UserIdGroupPairs": []
					}
				],
				"Tags": [
					{
						"Key": "Name",
						"Value": "securityGroupNAme"
					}
				],
				"VpcId": "vpc-957300fc"
			}]
		},
		"vmExpected": [
			{
				"ip": [
					{
						"type": "private",
						"allocatedTo": "instance",
						"address": "172.31.43.192",
						"dns": "ip-172-31-43-192.us-east-2.compute.internal"
					},
					{
						"type": "public",
						"allocatedTo": "instance",
						"dns": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
						"address": "18.218.148.78"
					}
				],
				"region": "us-east-1",
				"executeCommand": false,
				"id": "i-0bb24a3de714f9fba",
				"name": "command",
				"type": "t2.micro",
				"keyPair": "ragheb",
				"labels": {
					"Name": "command",
					"soajs.service.vm.location": "us-east-1",
					"soajs.service.vm.size": "t2.micro"
				},
				"layer": "subnet-110ad95c",
				"network": "vpc-957300fc",
				"volumes": [
					{
						"zone": "us-east-2c",
						"id": "vol-07cd719b38c1b2b32",
						"diskSizeGB": 8,
						"state": "failed",
						"iops": 100,
						"type": "gp2",
						"encrypted": false,
						"region": "us-east-1"
					}
				],
				"tasks": [
					{
						"id": "i-0bb24a3de714f9fba",
						"name": "command",
						"status": {
							"state": "succeeded",
							"ts": 1535025908000
						},
						"ref": {
							"os": {
								"architecture": "x86_64",
								"id": "ami-5e8bb23b",
								"description": "Canonical, Ubuntu, 16.04 LTS, amd64 xenial image build on 2018-06-27",
								"name": "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-20180627"
							}
						}
					}
				],
				"ports": [
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "22",
						"access": "allow",
						"isPublished": true,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": [
							"ip6address"
						]
					},
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "33",
						"access": "allow",
						"isPublished": false,
						"source": [
							"group"
						],
						"ipv6": []
					},
					{
						"direction": "outbound",
						"protocol": "*",
						"published": "0 - 65535",
						"access": "allow",
						"isPublished": false,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": []
					}
				],
				"securityGroup": [
					"sg-04031e85cc930b578"
				]
			}
		],
		"vmExpected2": [
			{
				"ip": [
					{
						"type": "private",
						"allocatedTo": "instance",
						"address": "172.31.43.192",
						"dns": "ip-172-31-43-192.us-east-2.compute.internal"
					},
					{
						"type": "public",
						"allocatedTo": "instance",
						"dns": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
						"address": "18.218.148.78"
					},
					{
						"type": "public",
						"allocatedTo": "loadBalancer",
						"address": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
						"dns": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com"
					}
				],
				"region": "ca-central-1",
				"executeCommand": false,
				"id": "i-0bb24a3de714f9fba",
				"name": "test1",
				"type": "t2.micro",
				"keyPair": "ragheb",
				"labels": {
					"soajs.service.vm.location": "ca-central-1",
					"soajs.service.vm.size": "t2.micro",
					"soajs.vm.name": "test1"
				},
				"layer": "subnetId",
				"network": "vpc-957300fc",
				"volumes": [
					{
						"zone": "us-east-2c",
						"id": "vol-07cd719b38c1b2b32",
						"diskSizeGB": 8,
						"state": "failed",
						"iops": 100,
						"type": "gp2",
						"encrypted": false,
						"region": "ca-central-1"
					}
				],
				"tasks": [
					{
						"name": "test1",
						"id": "i-0bb24a3de714f9fba",
						"status": {
							"state": "succeeded",
							"ts": 1535025908000
						},
						"ref": {
							"os": {
								"architecture": "x86_64",
								"id": "ami-5e8bb23b",
								"description": "Canonical, Ubuntu, 16.04 LTS, amd64 xenial image build on 2018-06-27",
								"name": "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-20180627"
							}
						}
					}
				],
				"ports": [
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "22",
						"access": "allow",
						"isPublished": true,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": [
							"ip6address"
						]
					},
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "33",
						"access": "allow",
						"isPublished": false,
						"source": [
							"group"
						],
						"ipv6": []
					},
					{
						"direction": "outbound",
						"protocol": "*",
						"published": "0 - 65535",
						"access": "allow",
						"isPublished": false,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": []
					}
				],
				"securityGroup": [
					"sg-04031e85cc930b578"
				]
			},
			{
				"ip": [
					{
						"type": "private",
						"allocatedTo": "instance",
						"address": "172.31.43.192",
						"dns": "ip-172-31-43-192.us-east-2.compute.internal"
					},
					{
						"type": "public",
						"allocatedTo": "instance",
						"dns": "ec2-18-218-148-78.us-east-2.compute.amazonaws.com",
						"address": "18.218.148.78"
					},
					{
						"type": "public",
						"allocatedTo": "loadBalancer",
						"address": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com",
						"dns": "test-lb-ragheb-69863322.us-east-2.elb.amazonaws.com"
					}
				],
				"region": "ca-central-1",
				"executeCommand": false,
				"id": "i-0bb24a3de714f9fba",
				"name": "command",
				"type": "t2.micro",
				"keyPair": "ragheb",
				"labels": {
					"Name": "command",
					"soajs.service.vm.location": "ca-central-1",
					"soajs.service.vm.size": "t2.micro"
				},
				"layer": "subnetId",
				"network": "vpc-957300fc",
				"volumes": [
					{
						"zone": "us-east-2c",
						"id": "vol-07cd719b38c1b2b32",
						"diskSizeGB": 8,
						"state": "failed",
						"iops": 100,
						"type": "gp2",
						"encrypted": false,
						"region": "ca-central-1"
					}
				],
				"tasks": [
					{
						"id": "i-0bb24a3de714f9fba",
						"name": "command",
						"status": {
							"state": "succeeded",
							"ts": 1535025908000
						},
						"ref": {
							"os": {
								"architecture": "x86_64",
								"id": "ami-5e8bb23b",
								"description": "Canonical, Ubuntu, 16.04 LTS, amd64 xenial image build on 2018-06-27",
								"name": "ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-20180627"
							}
						}
					}
				],
				"ports": [
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "22",
						"access": "allow",
						"isPublished": true,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": [
							"ip6address"
						]
					},
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "33",
						"access": "allow",
						"isPublished": false,
						"source": [
							"group"
						],
						"ipv6": []
					},
					{
						"direction": "outbound",
						"protocol": "*",
						"published": "0 - 65535",
						"access": "allow",
						"isPublished": false,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": []
					}
				],
				"securityGroup": [
					"sg-04031e85cc930b578"
				]
			}
		],
		"securityGroupsExpected" : [
			{
				"ports": [
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "22",
						"access": "allow",
						"isPublished": true,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": ["ip6address"]
					},
					{
						"direction": "inbound",
						"protocol": "tcp",
						"published": "33",
						"access": "allow",
						"isPublished": false,
						"source": [
							"group"
						],
						"ipv6": []
					},
					{
						"direction": "outbound",
						"protocol": "*",
						"published": "0 - 65535",
						"access": "allow",
						"isPublished": false,
						"source": [
							"0.0.0.0/0"
						],
						"ipv6": []
					}
				],
				"region": "us-east-1",
				"id": "sg-04031e85cc930b578",
				"name": "securityGroupNAme",
				"groupName": "launch-wizard-4",
				"description": "launch-wizard-4 created 2018-08-14T19:50:39.085+03:00",
				"networkId": "vpc-957300fc"
			}
		],
		"gateway": {
			"InternetGateways": [
				{
					"Attachments": [
						{
							"State": "available",
							"VpcId": "vpc-0e76ddf9c5915672e"
						}
					],
					"InternetGatewayId": "igw-0d1f93acd9d874950",
					"Tags": [
						{
							"Key": "Name",
							"Value": "ragheb"
						}
					]
				}
			]
		},
		"describeRouteTables": {
		  "RouteTables": [
		    {
		      "Associations": [
		        {
		          "Main": true,
		          "RouteTableAssociationId": "rtbassoc-0ccf56e05231b3232",
		          "RouteTableId": "rtb-068119a1ac8d846a9"
		        }
		      ],
		      "PropagatingVgws": [],
		      "RouteTableId": "rtb-068119a1acmg8aca9",
		      "Routes": [
		        {
		          "DestinationCidrBlock": "10.0.0.0/16",
		          "GatewayId": "local",
		          "Origin": "CreateRouteTable",
		          "State": "active"
		        }
		      ],
		      "Tags": [],
		      "VpcId": "vpc-071112c936l11d639"
		    }
		  ]
		},
		"listPolicies": {
			"ResponseMetadata": {
				"RequestId": "43c"
			},
			"AttachedPolicies": [
				{
					"PolicyName": "AmazonEC2RoleforSSM",
					"PolicyArn": "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM"
				}
			],
			"IsTruncated": false
		},
		"listRoles": {
			"ResponseMetadata": {
				"RequestId": "9e1f719d-ba79-11e8-8d6d-2d5dd18438b8"
			},
			"Roles": [
				{
					"Path": "/service-role/",
					"RoleName": "aws-codestar-service-role",
					"RoleId": "10",
					"Arn": "arn:aws:iam::019397354664:role/service-role/aws-codestar-service-role",
					"CreateDate": "2017-10-06T10:37:46.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22codestar.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D"
				},
				{
					"Path": "/",
					"RoleName": "aws-elasticbeanstalk-ec2-role",
					"RoleId": "9",
					"Arn": "arn:aws:iam::019397354664:role/aws-elasticbeanstalk-ec2-role",
					"CreateDate": "2017-10-06T16:04:51.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222008-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22ec2.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D"
				},
				{
					"Path": "/",
					"RoleName": "aws-elasticbeanstalk-service-role",
					"RoleId": "AROAJUTVLASOX5WK72CFK",
					"Arn": "8",
					"CreateDate": "2017-10-06T16:04:52.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22elasticbeanstalk.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%2C%22Condition%22%3A%7B%22StringEquals%22%3A%7B%22sts%3AExternalId%22%3A%22elasticbeanstalk%22%7D%7D%7D%5D%7D"
				},
				{
					"Path": "/aws-service-role/autoscaling.amazonaws.com/",
					"RoleName": "AWSServiceRoleForAutoScaling",
					"RoleId": "7",
					"Arn": "arn:aws:iam::019397354664:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling",
					"CreateDate": "2018-03-03T06:05:16.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22autoscaling.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
					"Description": "Default Service-Linked Role enables access to AWS Services and Resources used or managed by Auto Scaling"
				},
				{
					"Path": "/aws-service-role/elasticloadbalancing.amazonaws.com/",
					"RoleName": "AWSServiceRoleForElasticLoadBalancing",
					"RoleId": "6",
					"Arn": "arn:aws:iam::019397354664:role/aws-service-role/elasticloadbalancing.amazonaws.com/AWSServiceRoleForElasticLoadBalancing",
					"CreateDate": "2018-01-18T12:39:11.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22elasticloadbalancing.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
					"Description": "Allows ELB to call AWS services on your behalf."
				},
				{
					"Path": "/aws-service-role/organizations.amazonaws.com/",
					"RoleName": "AWSServiceRoleForOrganizations",
					"RoleId": "5",
					"Arn": "arn:aws:iam::019397354664:role/aws-service-role/organizations.amazonaws.com/AWSServiceRoleForOrganizations",
					"CreateDate": "2017-11-28T12:18:14.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22organizations.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
					"Description": "Service-linked role used by AWS Organizations to enable integration of other AWS services with Organizations."
				},
				{
					"Path": "/aws-service-role/support.amazonaws.com/",
					"RoleName": "AWSServiceRoleForSupport",
					"RoleId": "4",
					"Arn": "arn:aws:iam::019397354664:role/aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport",
					"CreateDate": "2018-07-12T09:06:26.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22support.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
					"Description": "Enables resource access for AWS to provide billing, administrative and support services"
				},
				{
				
				},
				{
					"Path": "/",
					"RoleName": "eks-role",
					"RoleId": "1",
					"Arn": "arn:aws:iam::019397354664:role/eks-role",
					"CreateDate": "2018-07-27T10:17:37.000Z",
					"Description": "Allows EKS to manage clusters on your behalf."
				},
				{
					"Path": "/",
					"RoleName": "ssm-role-ec2",
					"RoleId": "2",
					"Arn": "arn:aws:iam::019397354664:role/ssm-role-ec2",
					"CreateDate": "2018-08-23T12:02:48.000Z",
					"AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Sid%22%3A%22%22%2C%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22ec2.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D",
					"Description": "Allows EC2 instances to call AWS services like CloudWatch and SSM on your behalf."
				}
			],
			"IsTruncated": false
		}
	};
	return data;
};
