const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["network"],
        },
        "name": {
            "required": true,
            "type": "string",
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
	    }
    }
};

const update = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["network"],
        },
        "id": {
            "required": true,
            "type": "string",
        },
        "region": {
            "required": true,
            "type": "string",
        },
        "addresses": {
            "required": true,
            "type": "array",
            "properties": {
                "address": { "type": "string", "required": false }
            }
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

const list = {};

const remove = {};

module.exports = {
    add: add,
    update: update,
    list: list,
    remove: remove,
};
