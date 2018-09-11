const add = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["securityGroup"]
        },
        "name": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "description": {
            "required": true,
            "type": "string"
        },
        "network": {
            "required": true,
            "type": "string"
        },
        "labels": {
            "required": false,
            "type": "object"
        },
        "ports": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": {
                    "protocol": {
                        "required": false,
                        "type": "string",
                        "enum": ["tcp", "udp", "*"]
                    },
                    "access": {
                        "required": false,
                        "type": "string",
                        "enum": ["allow", "deny"]
                    },
                    "direction": {
                        "required": false,
                        "type": "string",
                        "enum": ["inbound", "outbound"]
                    },
                    "source": {
                        "required": true,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/g //IP v4 CIDR
                        }
                    },
                    "ip6": {
                        "required": false,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/g //IP v6 CIDR
                        }
                    },
                    "securityGroups": {
                        "required": false,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^sg-[0-9a-zA-Z]+$/g //AWS security group id
                        }
                    },
                    "published": {
                        "required": true,
                        "type": "number"
                    },
                    "range": {
                        "required": true,
                        "type": "number"
                    }
                }
            }
        },
    }
};

const update = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "section": {
            "type": "string",
            "required": true,
            "enum": ["securityGroup"]
        },
        "id": {
            "required": true,
            "type": "string"
        },
        "region": {
            "required": true,
            "type": "string"
        },
        "labels": {
            "required": false,
            "type": "object"
        },
        "ports": {
            "required": true,
            "type": "array",
            "items": {
                "type": "object",
                "required": true,
                "properties": {
                    "protocol": {
                        "required": false,
                        "type": "string",
                        "enum": ["tcp", "udp", "*"]
                    },
                    "access": {
                        "required": false,
                        "type": "string",
                        "enum": ["allow", "deny"]
                    },
                    "direction": {
                        "required": false,
                        "type": "string",
                        "enum": ["inbound", "outbound"]
                    },
                    "source": {
                        "required": true,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/g //IP v4 CIDR
                        }
                    },
                    "ip6": {
                        "required": false,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/g //IP v6 CIDR
                        }
                    },
                    "securityGroups": {
                        "required": false,
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": /^sg-[0-9a-zA-Z]+$/g //AWS security group id
                        }
                    },
                    "published": {
                        "required": true,
                        "type": "number"
                    },
                    "range": {
                        "required": true,
                        "type": "number"
                    }
                }
            }
        },
    }
};

const list = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "region": {
            "type": "string",
            "required": true
        },
	    "ids": {
		    "type": "array",
		    "required": false,
		    "items": {
			    "type": "string",
			    "required": true
		    }
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

module.exports = { add, update, list, remove };
