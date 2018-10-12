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
	regionsCashedTime: 1.8e+6 //30min
};
