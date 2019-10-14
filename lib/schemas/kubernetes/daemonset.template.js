'use strict';

module.exports = {
    "apiVersion": "apps/v1",
    "kind": "DaemonSet",
    "metadata": {
        "name": "",
        "labels": ""
    },
    "spec": {
	    "revisionHistoryLimit": 2,
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
