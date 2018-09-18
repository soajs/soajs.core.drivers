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
        "ports": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": {
                    "name": {
                        "required": true,
                        "type": "string"
                    },
                    "priority": {
                        "required": true,
                        "type": "number",
                        "min": 100,
                        "max": 4096
                    },
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
                    "sourceAddress": {
                        "required": false,
                        "type": "string"
                    },
                    "target": {
                        "required": false,
                        "type": "string"
                    },
                    "destinationAddress": {
                        "required": false,
                        "type": "string"
                    },
                    "published": {
                        "required": false,
                        "type": "string"
                    }
                }
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
