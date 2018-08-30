'use strict';

const list = {
    "type": "object",
    "additionalProperties": true,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        }
    }
};

module.exports = { list };
