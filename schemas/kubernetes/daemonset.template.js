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
                "updateStrategy": {
                    "type": "RollingUpdate" //NOTE: this is required to ensure that redeploy service restarts all pods
                },
                "containers": [
                    {
                        "name": "",
                        "image": "",
                        "imagePullPolicy": "IfNotPresent",
                        "workingDir": "",
                        "command": [],
                        "args": [],
                        "env": [],
                        "volumeMounts": []
                    }
                ],
                "volumes": []
            }
        }
    }
};
