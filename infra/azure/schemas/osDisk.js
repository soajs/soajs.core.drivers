'use strict';

const list = {
    "type": "object",
    "additionalProperties": true,
    "properties": {
        "group": {
            "type": "string",
            "required": true
        },
        "type": {
            "type": "string",
            "required": true,
            "enum": [ "os" ]
        }
    }
};

module.exports = { list };
