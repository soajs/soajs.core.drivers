'use strict';

module.exports = {
    "apiVersion": "batch/v1beta1",
    "kind": "CronJob",
    "metadata": {
        "name": "",
        "labels": ""
    },
    "spec": {
	    "schedule": '*/1 * * * *',
	    "jobTemplate": {
		    "spec": {
			    "template": {
				    "spec": {
					    "containers": [
						    {
							    "name": "",
							    "image": "",
							    "imagePullPolicy": "IfNotPresent",
							    "workingDir": "",
							    "command": [],
							    "args": [],
							    "volumeMounts": []
						    }
					    ],
					    "volumes": [],
					    "restartPolicy": "OnFailure"
				    }
			    }
		    }
	    }
    }
};