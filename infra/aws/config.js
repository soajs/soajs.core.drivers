"use strict";

var config = {
	"templateUrl": "https://s3.amazonaws.com/soajs/",
	"api":{
		"region": "us-east-1"
	},
	aws: {
		ssmSupportedPolicy:["AmazonEC2RoleforSSM"]
	}
};

module.exports = config;