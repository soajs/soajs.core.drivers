const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["certificate"],
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
        "action": {
            "required": true,
            "type": "string",
            "validation": {
                "enum": [ "request", "import" ]
            }
        },

        // for requesting a new certificate
        "domain": {
            "required": false,
            "type": "string",
        },
        "alternativeDomains": {
            "required": false,
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "validationMethod": {
            "required": false,
            "type": "string",
            "validation": {
                "enum": [ "dns", "email" ]
            }
        },

        // for importing a certificate
        "certificate": {
            "required": false,
            "type": "string",
        },
        "privateKey": {
            "required": false,
            "type": "string",
        },
        "chain": {
            "required": false,
            "type": "string",
        },

        // for renewing a certificate
        "id": {
            "required": false,
            "type": "string",
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
        "id": {
            "type": "string",
            "required": true
        }
    }
};

module.exports = { add, list, remove };
