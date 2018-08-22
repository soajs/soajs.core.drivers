var add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["keyPair"],
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
    },
};

var update = {};

var get = {};

var remove = {};

module.exports = {
    add: add,
    update: update,
    get: get,
    remove: remove,
};
