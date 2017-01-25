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
                        "workingDir": "",
                        "command": [],
                        "args": [],
                        "env": [],
                        "volumeMounts": [
                            {
                                "mountPath": "/var/log/soajs/",
                                "name": "soajs_log_volume"
                            }
                        ]
                    }
                ],
                "volumes": [
                    {
                        "name": "soajs_log_volume",
                        "hostPath": {
                            "path": "/var/log/soajs/"
                        }
                    }
                ]
            }
        }
    }
};
