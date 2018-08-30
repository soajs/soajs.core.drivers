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
