"use strict";

var config = {
	"templateUrl": "https://s3.amazonaws.com/soajs/",
	"api":{
		"region": "us-east-1"
	},
	aws: {
		ssmSupportedPolicy:["AmazonEC2RoleforSSM"]
	},
	ipProtocolNumbers: Array.apply(null, {length: 141}).map(Function.call, Number),
	ipProtocols: ["tcp", "udp", "icmp"]
	
};
module.exports = config;