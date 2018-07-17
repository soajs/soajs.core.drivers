'use strict';

module.exports = {
	
	apiVersion2016: '2016-06-01',
	apiVersion2018: '2018-02-01',
	
	lbHealthProbeIdFormat: '/subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%GROUP_NAME%/providers/Microsoft.Network/loadBalancers/%LB_NAME%/probes/%LB_PROBE_NAME%',
	lbIpConfigIdFormat: '/subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%GROUP_NAME%/providers/Microsoft.Network/loadBalancers/%LB_NAME%/frontendIPConfigurations/%CONFIG_NAME%',
	lbAddressPoolIdFormat: '/subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%GROUP_NAME%/providers/Microsoft.Network/loadBalancers/%LB_NAME%/backendAddressPools/%ADDRESS_POOL_NAME%'
	
};
