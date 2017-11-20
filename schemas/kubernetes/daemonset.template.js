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
        "updateStrategy": {
            "type": "RollingUpdate" //NOTE: this is required to ensure that redeploy service restarts pods
        },
        "template": {
            "metadata": {
                "name": "",
                "labels": {}
            },
            "spec": {
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
