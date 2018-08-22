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

const update = {};

const list = {};

const remove = {};

module.exports = {
    add, update, list, remove
};
