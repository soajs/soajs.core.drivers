const add = {
    "type": "object",
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["group"]
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "labels": {
            "required": false,
            "type": "object"
        },
        "name": {
            "type": "pattern",
            "required": true,
            "pattern": /^[-\w\._\(\)]+$/
        }
    }
};

const update = add;

const list = {
    "type": "object",
    "additionalProperties": true,
    "properties": {}
};

const remove = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "group": {
            "type": "string",
            "required": true
        }
    }
};

module.exports = { add, update, list, remove };
