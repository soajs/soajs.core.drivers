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
		"elbType": {
			"required": false,
            "type": "string",
			"default": "classic"
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
					"frontendProtocol": { "type": "string", "required": true },
					"certificate": { "type": "string", "required": false }
				}
			}
		},
		"healthProbe": {
			"required": false,
			"type": "object",
			"properties": {
				"maxSuccessAttempts": { "type": "number", "required": true },
				"healthProbeInterval": { "type": "number", "required": true },
				"healthProbeProtocol": { "type": "string", "required": true, "enum": [ "http", "https", "tcp", "ssl" ] },
				"healthProbePort": { "type": "number", "required": true },
				"healthProbePath": { "type": "string", "required": true },
				"healthProbeTimeout": { "type": "number", "required": true },
				"maxFailureAttempts": { "type": "number", "required": true }
			}
		}
	}
};

const update = {
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
		"elbType": {
			"required": false,
            "type": "string",
			"default": "classic"
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
					"frontendProtocol": { "type": "string", "required": true },
					"certificate": { "type": "string", "required": false }
				}
			}
		},
		"healthProbe": {
			"required": false,
			"type": "object",
			"properties": {
				"maxSuccessAttempts": { "type": "number", "required": true },
				"healthProbeInterval": { "type": "number", "required": true },
				"healthProbeProtocol": { "type": "string", "required": true, "enum": [ "http", "https", "tcp", "ssl" ] },
				"healthProbePort": { "type": "number", "required": true },
				"healthProbePath": { "type": "string", "required": true },
				"healthProbeTimeout": { "type": "number", "required": true },
				"maxFailureAttempts": { "type": "number", "required": true }
			}
		}
	}
};

const list = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        },
		"elbType": {
			"type": "string",
            "required": false,
			"default": "classic"
		}
    }
};

const remove = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        },
        "name": {
            "type": "string",
            "required": true
        },
		"elbType": {
			"type": "string",
            "required": false,
			"default": "classic"
		}
    }
};

module.exports = { add, update, list, remove };
