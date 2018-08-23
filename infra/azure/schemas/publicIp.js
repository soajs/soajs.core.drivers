const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["publicIp"]
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
        "labels": {
            "required": false,
            "type": "object"
        },
        "publicIPAllocationMethod": {
            "required": false,
            "type": "string",
            "enum": ["dynamic", "static"]
        },
        "idleTimeout": {
            "required": false,
            "type": "number"
        },
        "ipAddressVersion": {
            "required": false,
            "type": "string",
            "enum": ["IPv4", "IPv6"]
        },
        "type": {
            "required": false,
            "type": "string",
            "enum": ["basic", "standard"]
        }
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
