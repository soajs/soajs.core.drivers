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
            "Mounts": [],
	        "Healthcheck":{
		        "Test": [] // soajs is just the name of the health - possible types :
		        // [] inherit healthcheck from image or parent image
		        // ["NONE"] disable healthcheck
		        // ["CMD", args...] exec arguments directly
		        // ["CMD-SHELL", command] run command with system's default shel
		        // Interval: 0 - 0 means inherit. nanoseconds units
		        // Timeout: 0 - 0 means inherit. nanoseconds units
		        // Retries: 0
		        // StartPeriod: 0 - 0 means inherit. nanoseconds units
	        }
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
