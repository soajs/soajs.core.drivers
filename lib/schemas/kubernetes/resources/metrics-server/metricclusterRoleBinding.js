'use strict';

module.exports = {
	"apiVersion": "rbac.authorization.k8s.io/v1alpha1",
	"kind": "ClusterRoleBinding",
	"metadata": {
		"name": "system:metrics-server"
	},
	"roleRef": {
		"apiGroup": "rbac.authorization.k8s.io",
		"kind": "ClusterRole",
		"name": "system:metrics-server"
	},
	"subjects": [
		{
			"kind": "ServiceAccount",
			"name": "metrics-server",
			"namespace": "kube-system"
		}
	]
};