const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["securityGroup"]
        },
        "name": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "labels": {
            "required": false,
            "type": "object"
        },
        "ports": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": {
                    "protocol": {
                        "required": false,
                        "type": "string",
                        "enum": ["tcp", "udp", "*"]
                    },
                    "access": {
                        "required": false,
                        "type": "string",
                        "enum": ["allow", "deny"]
                    },
                    "direction": {
                        "required": false,
                        "type": "string",
                        "enum": ["inbound", "outbound"]
                    },
                    "source": {
                        "required": false,
                        "type": "string"
                    },
                    "published": {
                        "required": false,
                        "type": "string"
                    }
                }
            }
        },
    }
};

const update = {};

const list = {};

const remove = {};

module.exports = {
    add: add,
    update: update,
    list: list,
    remove: remove,
};
