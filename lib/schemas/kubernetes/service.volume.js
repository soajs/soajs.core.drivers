"use strict";

module.exports = {
	"type": "object",
	"properties": {
		"volumes": {
			"type": "array",
			"required": true,
			"items": {
				"type": "object",
				"properties": {
					"name" : {
						"required": true,
						"type": "string"
					},
					"hostPath": {
						"type": "object",
						"properties": {
							"path" : {
								"type": "string"
							}
						}
					}
				}
			}
		},
		"volumeMounts": {
			"type": "array",
			"required": true,
			"items": {
				"type": "object",
				"properties": {
					"name" : {
						"required": true,
						"type": "string"
					},
					"mountPath": {
						"type": "string"
					}
				}
			}
		}
	}
};