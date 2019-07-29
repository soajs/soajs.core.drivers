'use strict';

module.exports = {
	"apiVersion": "apps/v1beta1",
	"kind": "Deployment",
	"metadata": {
		"name": "metrics-server",
		"namespace": "kube-system",
		"labels": {
			"k8s-app": "metrics-server",
			"soajs.service.type": "system",
            "soajs.service.subtype": "other",
		}
	},
	"spec": {
		"selector": {
			"matchLabels": {
				"k8s-app": "metrics-server",
				"soajs.service.type": "system",
	            "soajs.service.subtype": "other",
			}
		},
		"template": {
			"metadata": {
				"name": "metrics-server",
				"labels": {
					"k8s-app": "metrics-server",
					"soajs.service.type": "system",
		            "soajs.service.subtype": "other",
				}
			},
			"spec": {
				"serviceAccountName": "metrics-server",
				"volumes": [
					{
						"name": "tmp-dir",
						"emptyDir": {}
					}
				],
				"containers": [
					{
						"name": "metrics-server",
						"image": "k8s.gcr.io/metrics-server-amd64:v0.3.3",
						"imagePullPolicy": "Always",
						"volumeMounts": [
							{
								"name": "tmp-dir",
								"mountPath": "/tmp"
							}
						]
					}
				],
				
				
			}
		}
	}
};
