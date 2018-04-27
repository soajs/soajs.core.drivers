"use strict";

module.exports = {
	name: '',
	scopes: [
		'https://www.googleapis.com/auth/cloud-platform',
		'https://www.googleapis.com/auth/compute'
	],
	vpc : {
		"routingConfig": {
			"routingMode": "REGIONAL"
		},
		"autoCreateSubnetworks": true
	},
	minimumSupportedVersion: "1.7",
	template: {
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
			"name": "template-cluster", //Lowercase letters, numbers, and hyphens only. Must start with a letter. Must end with a number or a letter.
			"zone": "us-central1-a",
			"network": "template-cluster", //Lowercase letters, numbers, and hyphens only. Must start with a letter. Must end with a number or a letter.
			"nodePools": [
				{
					"name": "template-pool",
					// "version": "1.7.8-gke.0",
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
						"labels": {"name": "soajs"},
						"serviceAccount": "default",
					},
					"autoscaling": {
						"enabled": false
					},
					"management": {
						"autoUpgrade": false,
						"autoRepair": false,
						"upgradeOptions": {}
					},
					
				}
			],
			"loggingService": "logging.googleapis.com",
			"monitoringService": "monitoring.googleapis.com",
			// "zoneLocation": "us-central1-a",
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
			"description": "this is done manually", //optional
		}
	}
};
