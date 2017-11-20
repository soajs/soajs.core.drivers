'use strict';

module.exports = {
	"apiVersion": "v1",
	"kind": "Service",
	"metadata": {
		"name": "metrics-server",
		"namespace": "kube-system",
		"labels": {
			"kubernetes.io/name": "Metrics-server",
			"k8s-app": "metrics-server",
			"soajs.service.type": "system",
            "soajs.service.subtype": "other"
		}
	},
	"spec": {
		"selector": {
			"k8s-app": "metrics-server",
			"soajs.service.type": "system",
            "soajs.service.subtype": "other"
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
