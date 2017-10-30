'use strict';

module.exports = {
	"apiVersion": "extensions/v1beta1",
	"kind": "Deployment",
	"metadata": {
		"name": "metrics-server",
		"namespace": "kube-system",
		"labels": {
			"k8s-app": "metrics-server"
		}
	},
	"spec": {
		"selector": {
			"matchLabels": {
				"k8s-app": "metrics-server"
			}
		},
		"template": {
			"metadata": {
				"name": "metrics-server",
				"labels": {
					"k8s-app": "metrics-server"
				}
			},
			"spec": {
				"serviceAccountName": "metrics-server",
				"containers": [
					{
						"name": "metrics-server",
						"image": "gcr.io/google_containers/metrics-server-amd64:dev",
						"imagePullPolicy": "Always",
						"command": [
							"/metrics-server",
							"--source=kubernetes.summary_api:''"
						]
					}
				]
			}
		}
	}
};