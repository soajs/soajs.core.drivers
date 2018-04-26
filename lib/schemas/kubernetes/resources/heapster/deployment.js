'use strict';

module.exports = {
    "apiVersion": "extensions/v1beta1",
    "kind": "Deployment",
    "metadata": {
        "name": "heapster",
        "namespace": "kube-system",
        "labels": {
            "k8s-app": "heapster",
            "soajs.service.type": "system",
            "soajs.service.subtype": "other"
        }
    },
    "spec": {
        "replicas": 1,
        "selector": {
            "matchLabels": {
                "k8s-app": "heapster",
                "soajs.service.type": "system",
                "soajs.service.subtype": "other"
            }
        },
        "template": {
            "metadata": {
                "labels": {
                    "k8s-app": "heapster",
                    "soajs.service.type": "system",
    	            "soajs.service.subtype": "other"
                }
            },
            "spec": {
                "serviceAccountName": "heapster",
                "containers": [
                    {
                        "name": "heapster",
                        "image": "gcr.io/google_containers/heapster-amd64:v1.3.0",
                        "imagePullPolicy": "IfNotPresent",
                        "command": [
                            "/heapster",
                            "--source=kubernetes:https://kubernetes.default"
                        ]
                    }
                ]
            }
        }
    }
}
