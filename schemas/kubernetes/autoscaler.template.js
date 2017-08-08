'use strict';

module.exports = {
    "apiVersion": "autoscaling/v2alpha1",
    "kind": "HorizontalPodAutoscaler",
    "metadata": {
        "name": ""
    },
    "spec": {
        "minReplicas": 0,
        "maxReplicas": 0,
        "scaleTargetRef": {
            "apiVersion": "extensions/v1beta1",
            "kind": "Deployment",
            "name": ""
        },
        "metrics": [
            {
                "type": "Resource",
                "resource": {
                    "name": "cpu",
                    "targetAverageUtilization": 0
                }
            }
        ]
    }
};
