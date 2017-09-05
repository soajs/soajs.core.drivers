'use strict';

module.exports = {
    "apiVersion": "extensions/v1beta1",
    "kind": "Deployment",
    "metadata": {
        "name": "heapster",
        "namespace": "kube-system",
        "labels": {
            "soajs.service.type": "system",
            "soajs.service.subtype": "heapster",
        }
    },
    "spec": {
        "replicas": 1,
        "template": {
            "metadata": {
                "labels": {
                    "soajs.service.type": "system",
    	            "soajs.service.subtype": "heapster",
                    "task": "monitoring",
                    "k8s-app": "heapster"
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
