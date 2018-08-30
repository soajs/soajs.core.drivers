'use strict';

const list = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        },
        "type": {
            "type": "string",
            "required": true,
            "enum": [ "data" ]
        }
    }
};

module.exports = { list };
