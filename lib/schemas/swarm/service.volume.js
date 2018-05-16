"use strict";

module.exports = {
	"type": "object",
	"properties": {
		"volumes": {
			"type": "array",
			"additionalProperties": false,
			"items": {
				"type": "object",
				"properties": {
					"Type" : {
						"required": true,
						"type": "string"
					},
					"Source": {
						"type": "string"
					},
					"Target": {
						"type": "string"
					},
					"ReadOnly": {
						"type": "boolean"
					}
				}
			}
		}
	}
};