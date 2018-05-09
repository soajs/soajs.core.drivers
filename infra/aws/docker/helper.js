"use strict";

const helper = {
	
	"getDeploymentFromInfra" : (infra, env) =>{
		let infraStack, info, index;
		for (let i = 0; i < infra.deployments.length; i++) {
			let oneStack = infra.deployments[i];
			if (oneStack.environments.indexOf(env.toUpperCase()) !== -1) {
				infraStack = oneStack;
				index = i;
				break;
			}
		}
		
		if (!infraStack) {
			return null;
		}
		
		let environments = [];
		if (infraStack.environments) {
			infraStack.environments.forEach((oneEnv) => {
				environments.push({code: oneEnv.toUpperCase()});
			});
		}
		return [infraStack, environments, index];
	}
};

module.exports = helper;