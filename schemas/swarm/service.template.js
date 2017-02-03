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
            "Mounts": [
                {
				    "Type": "volume",
				    "Source": "soajs_log_volume",
				    "Target": "/var/log/soajs/",
                }
            ]
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
        "Delay": 500.0,
        "Parallelism": 2,
        "FailureAction": "pause"
    },
    "Networks": [{Target: ''}],
    "Labels": {}
};
