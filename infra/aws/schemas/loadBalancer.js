'use strict';

const add = {
	"type": "object",
    "additionalProperties": false,
    "properties": {
		"section": {
            "type": "string",
            "required": true,
            "enum": ["loadBalancer"],
        },
        "name": {
            "required": true,
            "type": "string",
        },
        "region": {
            "required": true,
            "type": "string",
        },
        "labels": {
            "required": false,
            "type": "object",
        },
		"type": {
			"required": true,
            "type": "string",
			"enum": [ "private", "public" ]
		},
		"securityGroups": {
			"required": false,
            "type": "array",
			"items": { "type": "string", "required": false }
		},
		"subnets": {
			"required": false,
            "type": "array",
			"items": { "type": "string", "required": false }
		},
		"rules": {
			"required": true,
			"type": "array",
			"items": {
				"type": "object",
				"required": true,
				"properties": {
					"backendPort": { "type": "number", "required": true },
					"backendProtocol": { "type": "string", "required": true },
					"frontendPort": { "type": "number", "required": true },
					"frontendProtocol": { "type": "string", "required": true }
				}
			}
		},
		"healthProbe": {
			"required": false,
			"type": "object",
			"properties": {
				"maxSuccessAttempts": { "type": "number", "required": true },
				"healthProbeInterval": { "type": "number", "required": true },
				"healthProbePath": { "type": "string", "required": true },
				"healthProbeTimeout": { "type": "number", "required": true },
				"maxFailureAttempts": { "type": "number", "required": true }
			}
		}
	}
};

const update = {};

const list = {};

const remove = {};

module.exports = { add, update, list, remove };
