const add = {
    "type": "object",
    "additionalProperties": false,
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
        },
    }
};

const update = {};

const list = {};

const remove = {};

module.exports = {
    add: add,
    update: update,
    get: get,
    remove: remove,
};
