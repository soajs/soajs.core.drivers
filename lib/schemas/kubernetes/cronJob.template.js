'use strict';

module.exports = {
    "apiVersion": "batch/v1beta1",
    "kind": "CronJob",
    "metadata": {
        "name": "",
        "labels": ""
    },
    "spec": {
	    "schedule": '* * * * *', //minute - hour -- day of month - month (1-12) - day of week
	    "jobTemplate": {
		    "spec": {
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