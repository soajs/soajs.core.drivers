const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["network"]
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
        "address": {
            "required": false,
            "type": "array",
            "items": {"type": "string", "required": true}
        },
        "dnsServers": {
            "required": false,
            "type": "array",
            "items": {"type": "string", "required": true}
        },
        "subnets": {
            "required": false,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": {
                    "name": {
                        "required": true,
                        "type": "string"
                    },
                    "address": {
                        "required": false,
                        "type": "string"
                    }
                }
            }
        },
        "labels": {
            "required": false,
            "type": "object"
        }
    }
};

const update = {};

const get = {};

const remove = {};

module.exports = {
    add: add,
    update: update,
    get: get,
    remove: remove,
};
