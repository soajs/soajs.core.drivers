'use strict';

module.exports = {
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
        "labels": {
            "kubernetes.io/cluster-service": "true",
            "kubernetes.io/name": "Heapster",
            "k8s-app": "heapster",
            "soajs.service.type": "system",
            "soajs.service.subtype": "other"
        },
        "name": "heapster",
        "namespace": "kube-system"
    },
    "spec": {
        "selector": {
            "k8s-app": "heapster",
            "soajs.service.type": "system",
            "soajs.service.subtype": "other"
        },
        "ports": [
            {
                "port": 80,
                "targetPort": 8082
            }
        ]
    }
}
