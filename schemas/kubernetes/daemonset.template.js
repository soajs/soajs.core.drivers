'use strict';

module.exports = {
    "apiVersion": "extensions/v1beta1",
    "kind": "DaemonSet",
    "metadata": {
        "name": "",
        "labels": ""
    },
    "spec": {
        "selector": {
            "matchLabels": ""
        },
        "template": {
            "metadata": {
                "name": "",
                "labels": {}
            },
            "spec": {
                "nodeSelector": "",
                "containers": [
                    {
                        "name": "",
                        "image": "",
                        "imagePullPolicy": "IfNotPresent",
                        "workingDir": "",
                        "command": [],
                        "args": [],
                        "env": [],
                        "volumeMounts": [
                            {
                                "mountPath": "/var/log/soajs/",
                                "name": "soajs-log-volume"
                            }
                        ]
                    }
                ],
                "volumes": [
                    {
                        "name": "soajs-log-volume",
                        "hostPath": {
                            "path": "/var/log/soajs/"
                        }
                    }
                ]
            }
        }
    }
};
