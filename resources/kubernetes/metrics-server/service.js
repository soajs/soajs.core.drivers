'use strict';

module.exports = {
	"apiVersion": "v1",
	"kind": "Service",
	"metadata": {
		"name": "metrics-server",
		"namespace": "kube-system",
		"labels": {
			"kubernetes.io/name": "Metrics-server"
		}
	},
	"spec": {
		"selector": {
			"k8s-app": "metrics-server"
		},
		"ports": [
			{
				"port": 443,
				"protocol": "TCP",
				"targetPort": 443
			}
		]
	}
};
