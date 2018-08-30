'use strict';

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

module.exports = { list };
