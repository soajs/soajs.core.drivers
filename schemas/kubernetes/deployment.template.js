'use strict';

module.exports = {
    "apiVersion": "extensions/v1beta1",
    "kind": "Deployment",
    "metadata": {
        "name": "",
        "labels": ""
    },
    "spec": {
        "replicas": 0,
	    "revisionHistoryLimit": 2,
        "selector": {
            "matchLabels": ""
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
                        "imagePullPolicy": "",
                        "workingDir": "",
                        "command": [],
                        "args": [],
                        "ports": [],
                        "env": [],
                        "volumeMounts": []
                    }
                ],
                "volumes": []
            }
        }
    }
};
