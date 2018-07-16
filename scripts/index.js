'use strict';

const driverUtils = require('./utils/index.js');


/**
* List available public ips

* @param  {Object}   options
* @param  {Function} cb
* @return {void}
*/
const options = {
  infra: {
    name: 'azure',
    stack: {
      technology: 'vm'
    },
    api: {
      clientId: "cca65dcd-3aa3-44d3-81cb-6b57b764be6a",
      secret: "QY7TMLyoA6Jjzidtduqbn/4Y2mDlyJUbKZ40c6dBTYw=",
      domain: "608c3255-376b-47a4-8e8e-9291e506d03e",
      subscriptionId: "d159e994-8b44-42f7-b100-78c4508c34a6"
    }
  }
};
options.params = {
  resourceGroupName: 'interns-test',
  //publicIpAddressName: 'interns-ip',
  //virtualNetworkName:'interns-vn',
  networkSecurityGroupName: 'interns-sg2',
  // addressSpace: {
  //       addressPrefixes: [
  //         '10.0.0.0/16'
  //       ]
  //     },
  location: 'eastus',

};

driverUtils.authenticate(options, (error, authData) => {

  const networkClient = driverUtils.getConnector({
    api: 'network',
    credentials: authData.credentials,
    subscriptionId: options.infra.api.subscriptionId
  });

  networkClient.networkSecurityGroups.deleteMethod(options.params.resourceGroupName,options.params.networkSecurityGroupName,function (error, publicIpAddressName) {
//console.log(options.params.location);
console.log(publicIpAddressName);
//console.log(error);

      });



});
