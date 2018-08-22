var add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["network"],
        },
        "region": {
            "required": true,
            "type": "string",
        },
        "address": {
            "required": true,
            "type": "string",
        },
        "Ipv6Address": {
            "required": false,
	        "type": "boolean",
        },
	    "InstanceTenancy": {
		    "required": false,
		    "type": "string",
		    "enum": ["default", "dedicated"],
	    },
    },
};

var update = {};

var list = {};

var remove = {};

module.exports = {
    add: add,
    update: update,
    list: list,
    remove: remove,
};
