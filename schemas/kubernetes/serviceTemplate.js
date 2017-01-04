'use strict';

module.exports = {
    "service" : {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": null,
            "labels": {
                "type": "soajs-service"
            }
        },
        "spec": {
            "selector": null,
            "ports": [
                {
                    "protocol": "TCP",
                    "port": null,
                    "targetPort": null,
                }
            ]
        }
    },

    "deployment": {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": null,
            "labels": null
        },
        "spec": {
            "replicas": null,
            "selector": {
                "matchLabels": null
            },
            "template": {
                "metadata": {
                    "name": null,
                    "labels": null
                },
                "spec": {
                    "containers": [
                        {
                            "name": null,
                            "image": null,
                            "workingDir": null,
                            "command": null,
                            "args": null,
                            "env": null
                        }
                    ]
                }
            }
        }
    }
};
