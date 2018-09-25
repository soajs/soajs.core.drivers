'use strict';

module.exports = {
    "Name": '',
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": '',
            "Env": [],
            "Dir": '',
            "Command": [],
            "Args": [],
            "Mounts": []
        },
        "Resources": {
            "Limits": {
                "MemoryBytes": ''
            }
        },
        "RestartPolicy": {
            "Condition": "any",
            "MaxAttempts": 5
        }
    },
    "Mode": {},
    "UpdateConfig": {
        "Delay": 500,
        "Parallelism": 2,
        "FailureAction": "rollback",
	    "UpdateOrder": "start-first"
    },
	"RollbackConfig": {
		"Delay": 500,
		"Parallelism": 2,
		"FailureAction": "pause"
	},
    "Networks": [{Target: ''}],
    "Labels": {}
};
