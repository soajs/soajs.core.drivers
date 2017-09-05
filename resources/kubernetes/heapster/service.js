'use strict';

module.exports = {
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
        "labels": {
            "task": "monitoring",
            "kubernetes.io/cluster-service": "true",
            "kubernetes.io/name": "Heapster",
            "soajs.service.type": "system",
            "soajs.service.subtype": "heapster",
        },
        "name": "heapster",
        "namespace": "kube-system"
    },
    "spec": {
        "selector": {
            "k8s-app": "heapster"
        },
        "ports": [
            {
                "port": 80,
                "targetPort": 8082
            }
        ]
    }
}
