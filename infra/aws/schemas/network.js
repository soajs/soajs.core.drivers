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
        "ipv6Address": {
            "required": false,
	        "type": "boolean",
        },
	    "instanceTenancy": {
		    "required": false,
		    "type": "string",
		    "enum": ["default", "dedicated"],
	    },
        "attachInternetGateway": {
            "required": true,
	        "type": "boolean"
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
            "enum": ["network"]
        },
        "id": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "addresses": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "address": { "type": "string", "required": true }
                }
            }
        },
        "subnets": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "address": { "type": "string", "required": true },
                    "availabilityZone": { "type": "string", "required": false }
                }
            }
        },
	    "instanceTenancy": {
		    "required": true,
		    "type": "string",
		    "enum": [ "default", "dedicated" ]
	    },
        "attachInternetGateway": {
            "required": true,
	        "type": "boolean"
        }
    }
};

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

const remove = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        },
        "id": {
            "type": "string",
            "required": true
        }
    }
};

module.exports = {
    add: add,
    update: update,
    list: list,
    remove: remove,
};
