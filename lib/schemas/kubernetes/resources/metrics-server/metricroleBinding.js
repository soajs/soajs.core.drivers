'use strict';

module.exports = {
	"apiVersion": "rbac.authorization.k8s.io/v1alpha1",
	"kind": "ClusterRole",
	"metadata": {
		"name": "system:metrics-server"
	},
	"rules": [
		{
			"apiGroups": [
				""
			],
			"resources": [
				"pods",
				"nodes",
				"nodes/stats"
			],
			"verbs": [
				"get",
				"list",
				"watch"
			]
		}
	]
};