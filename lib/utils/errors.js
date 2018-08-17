'use strict';

////////////////////////////////////////
//TODO: needs revamp!
////////////////////////////////////////
module.exports = {
    //validation error
    173: "Validation Error.",

    //generic error for testing purposes
    500: "Requested Method not found!",
	501: 'Invalid Operation Requested!',
    600: "Generic error",

    //common errors
	517: "Error Loading Kubernetes Template!",
    518: "The chosen strategy does not exist",
    519: "The chosen driver does not support the selected function",



    520: "Unable to retrieve the kubernetes deployer",
    521: "Unable to list the Kubernetes cluster nodes",
    522: "Unable to add the node to the Kubernetes cluster",
    523: "Unable to remove the node from the Kubernetes cluster",
    524: "Unable to update the node in the kubernetes cluster",

    525: "Unable to create the kubernetes service",
    526: "Unable to deploy the kubernetes service",
    527: "Unable to scale the kubernetes service",
    529: "Error while inspecting the kubernetes service",

    530: "Unable to retrieve the kubernetes service replica set",
    531: "Unable to update the kubernetes service replica set",
    532: "Unable to delete the kubernetes service replica set",

    533: "Unable to list the kubernetes services",
    534: "Unable to delete the kubernetes services",

    535: "Unable to delete the kubernetes service deployment",
    536: "Unable to retrieve the kubernetes service deployment",

    537: "Unable to get container logs",

    539: "Unable to delete the kubernetes pod",


    540: "Unable to retrieve the docker swarm deployer",
    541: "Unable to inspect the docker swarm",
    542: "Unable to retrieve the docker swarm information",
    543: "Unable to inspect the docker swarm",

    544: "Unable to add the node to the docker swarm",
    545: "Unable to delete the node from the docker swarm",
    546: "Unable to update the node in the docker swarm",
    547: "Unable to inspect the node",
    548: "Unable to list the nodes",

    549: "Unable to list the services",
    550: "Unable to inspect the docker swarm service",
    551: "Unable to scale the docker swarm service",
    552: "Unable to list the docker swarm service tasks",
    553: "Unable to delete the docker swarm service",
    554: "Unable to retrieve the docker swarm service components",

    555: "Unable to inspect the docker swarm task",

    556: "Unable to list the docker swarm networks",
    557: "Unable to inspect the docker swarm network",
    558: "Unable to create the docker swarm network",

    559: "Unable to delete the docker swarm services",

    560: "Unable to get the docker swarm service host",

    561: "Unable to reach the specified node",

	562: "Unable to list the kubernetes secrets",
	563: "Unable to delete the kubernetes secret",
	564: "Unable to create the kubernetes secret",
	565: "Secret not found",
	566: "Unable to delete secret",
    567: "Unable to create the docker secret",
    568: "Unable to delete Docker secret",
    569: "Unable to list the Docker secrets",
    570: "Invalid secret data",

    571: "Namespace not found",

    652: "Unable to add node to swarm, specified node is already part of a swarm",

    653: "Unable to redeploy service",

    654: "Unable to remove node",

    655: "Unable to inspect node",

    656: "Unable to inspect the specified pod",

    657: "Could not find a Kubernetes deployment for the specified environment",

    658: "Unable to inspect swarm network",

    659: "Unable to list kubernetes deployment pods",
    660: "Unable to delete kubernetes pods",

    661: "Unable to find service",

    662: "Unable to deploy service",

    663: "Unable to list kubernetes daemon sets",
    664: "Unable to delete kubernetes daemon set",

    670: "Error while retrieving the namespaces",
    671: "Error while deleting the namespace",
    672: "Namespace already exists",

    673: "Unable to update kubernetes service",

    674: "Missing required input",
    675: "Unable to get autoscaler",
    676: "Unable to create autoscaler",
    677: "Unable to update autoscaler",
    678: "Unable to delete autoscaler",
    679: "Autoscaling is only supported for Deployments",

    680: "Unable to create resource",
    681: "Unable to load resource templates, resource not supported",

    682: "Unable to create service account",
    683: "Unable to delete service account",

    684: "Unable to get certificates",
    685: "Certificates for this environment were not found",
    686: "No environment code passed to driver",
    687: "No environment registry passed to driver",

	688: "Unable to get metrics",

    689: "Unable to perform maintenance operation",

    700: "Unable to authenticate",
    701: "Unable to get virutal machine",
    702: "Unable to power off virtual machine",
    703: "Unable to start virtual machine",
    704: "Unable to list virtual machines",
    705: "Unable to delete virtual machine",
    706: "Unable to restart virtual machine",
    707: "Unable to redeploy virtual machine",
    708: "Unable to delete resource group",
    709: "Unable to list virtual machine sizes",
    710: "Unable to list virtual machine image publishers",
    711: "Unable to list virtual machine image offers",
    712: "Unable to list virtual machine image SKU's",
    713: "Unable to list regions",
    714: "Unable to list resource groups",
    715: "Unable to create virtual network",
    716: "Unable to get subnet information",
    717: "Unable to create public IP",
    718: "Unable to create network security group",
    719: "Unable to create network interface",
    720: "Unable to get virtual machine image info",
    721: "Unable to deploy virtual machine",

	722: "Detected ports outside the range of valid exposed ports (0 , 2767)",
	723: "Invalid port schema provided!",
	724: "Invalid volume schema provided!",
	725: `Unable to find any secret in this deployment. Create Secrets first then supply them while deploying service(s).`,
	726: `The following Secret %secret_name% does not exist !`,

    727: 'Unable to render template. Check the handlebars syntax and try again',
    728: 'Unable to apply terraform template. An error occurred when writing file',
    729: 'Unable to apply terraform template. An error occured when trying to execute template',
    730: 'Terraform was able to create the VM layer but was unable to return a state file that includes how this layer was created and this prevents SOAJS from modifying and/or destroying this VM layer.',
    731: "Unable to list Networks",
    732: "Unable to list load balancers",
    733: "Unable to list subnets",
    734: "Unable to list security groups",
    735: "Unable to list public IPs",
    736: "Failed to execute command",
    737: "Unable to list disks",
    738: "Unable to deploy cluster",
    739: "templateState either is not an object, or does't exist",
    740: "Unable to delete cluster",
    741: "Unable to delete load Balancer",
    742: "Unable to delete Network",
    743: "Unable to delete Public IP",
    744: "Unable to delete Security Group",
    745: "Unable to create Public IP",
    746: "Unable to update Public IP",
    747: "Unable to create Network",
    748: "Unable to Update Network",
    749: "Unable to create/update Load Balancer",
    750: "Unable to update Load Balancer",
    751: "Unable to create Security Group",
    752: "Unable to update  Security Group",
    753: "Unable to create group",
    754: "Unable to update  group",
    755: "Invalid group name. Make sure it matches the regular expression ^[-\w\._\(\)]+$",
    756: "Unable to create/update subnet",
    757: "Unable to delete subnet",
    758: "Unable to get virtual machine",
    759: "Unable to update virtual machine",
    760: "Validation error",
    761: "No schema found to validate inputs.",

	766: "Run command extension execution is in progress. Please wait for completion before invoking a run command.",

	999: "Unable to proceed because the recipe of this deployment requires the SOAJS Controller to be deployed in this environment. Deploy the SOAJS Controller first so you can proceed or use another recipe."

};
