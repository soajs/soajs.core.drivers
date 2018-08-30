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
