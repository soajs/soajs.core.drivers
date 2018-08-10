var network = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["network"]
        },
        "name": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "address": {
            "required": true,
            "type": "array",
            "items": {"type": "string", "required": true}
        },
        "Ipv6Address": {
            "required": false,
	        "type": "boolean"
        },
	    "InstanceTenancy": {
		    "required": false,
		    "type": "string",
		    "enum": ["default", "dedicated"]
	    }
    }
};

module.exports = network;
