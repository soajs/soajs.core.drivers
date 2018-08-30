const addressPools = {
	"name": {
		"required": true,
		"type": "string"
	}
};

const ipConfigs = {
	"privateIpAllocationMethod": {
		"required": false,
		"type": "string",
		"enum": ["static", "dynamic"]
	},
	"privateIpAddress": {
		"required": false,
		"type": "string"
	},
	"isPublic": {
		"required": true,
		"type": "boolean"
	},
	"publicIpAddress": {
		"required": false,
		"type": "object",
		"properties": {
			"id": {
				"required": true,
				"type": "string"
			}
		}
	},
	"subnet": {
		"required": false,
		"type": "object",
		"properties": {
			"id": {
				"required": true,
				"type": "string"
			}
		}
	}
};

const ports = {
	"name": {
		"required": true,
		"type": "string"
	},
	"protocol": {
		"required": false,
		"type": "string",
		"enum": ["tcp", "udp", "all"]
	},
	"target": {
		"required": true,
		"type": "number"
	},
	"published": {
		"required": false,
		"type": "number"
	},
	"idleTimeout": {
		"required": false,
		"type": "number",
		"min": 240,
		"max": 1800
	},
	"loadDistribution": {
		"required": false,
		"type": "string",
		"enum": ["default", "sourceIP", "sourceIPProtocol"]
	},
	"enableFloatingIP": {
		"required": false,
		"type": "boolean"
	},
	"disableOutboundSnat": {
		"required": false,
		"type": "boolean"
	},
	"addressPoolName": {
		"required": true,
		"type": "string"
	},
	"healthProbePort": {
		"required": false,
		"type": "number"
	},
	"healthProbeProtocol": {
		"required": true,
		"type": "string",
		"enum": ["http", "https", "tcp"]
	},
	"healthProbeRequestPath": {
		"required": true,
		"type": "string"
	},
	"maxFailureAttempts": {
		"required": false,
		"type": "number"
	},
	"healthProbeInterval": {
		"required": false,
		"type": "number"
	}
};

const natPools = {
	"name": {
		"required": true,
		"type": "string"
	},
	"backendPort": {
		"required": true,
		"type": "number"
	},
	"protocol": {
		"required": false,
		"type": "string",
		"enum": ["tcp", "udp", "all"]
	},
	"enableFloatingIP": {
		"required": false,
		"type": "boolean"
	},
	"frontendPortRangeStart": {
		"required": true,
		"type": "number"
	},
	"frontendPortRangeEnd": {
		"required": true,
		"type": "number"
	},
	"idleTimeout": {
		"required": false,
		"type": "number",
		"min": 240,
		"max": 1800
	},
	"ipConfigName": {
		"required": false,
		"type": "string"
	},
};

const natRules = {
	"name": {
		"required": true,
		"type": "string"
	},
	"backendPort": {
		"required": true,
		"type": "number"
	},
	"protocol": {
		"required": false,
		"type": "string",
		"enum": ["http", "https", "tcp"]
	},
	"enableFloatingIP": {
		"required": false,
		"type": "boolean"
	},
	"frontendPort": {
		"required": true,
		"type": "number"
	},
	"idleTimeout": {
		"required": false,
		"type": "number",
		"min": 240,
		"max": 1800
	},
	"ipConfigName": {
		"required": false,
		"type": "string"
	}
};

const rules = {
	"name": {
		"required": true,
		"type": "string"
	},
	"config": {
		"required": true,
		"type": "object",
		"properties": ipConfigs
	},
	"ports": {
		"required": false,
		"type": "array",
		"items": {
			"type": "object",
			"required": true,
			"properties": ports
		}
	},
	"natPools": {
		"required": false,
		"type": "array",
		"items": {
			"type": "object",
			"required": true,
			"properties": natPools
		}
	},
	"natRules": {
		"required": false,
		"type": "array",
		"items": {
			"type": "object",
			"required": true,
			"properties": natRules
		}
	}
};

const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["loadBalancer"]
        },
        "name": {
            "required": true,
            "type": "string"
        },
        "group": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "addressPools": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": addressPools
            }
        },
        "rules": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": rules
            }
        }
    }
};

const update = add;

const list = {
    "type": "object",
    "additionalProperties": true,
    "properties": {
        "group": {
            "type": "string",
            "required": true
        }
    }
};

const remove = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "group": {
            "type": "string",
            "required": true
        },
		"name": {
            "type": "string",
            "required": true
        }
    }
};

module.exports = { add, update, list, remove };
