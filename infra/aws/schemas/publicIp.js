const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["publicIp"]
        },
        "domain": {
            "required": true,
            "type": "string",
            "validation": {
                "enum": [ "vpc" ]
            }
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "labels": {
            "required": false,
            "type": "object"
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
        }
    }
};

module.exports = { add, list, remove };
