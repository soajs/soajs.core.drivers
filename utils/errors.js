'use strict';

////////////////////////////////////////
//TODO: needs revamp!
////////////////////////////////////////
module.exports = {
    //generic error for testing purposes
    600: "Generic error",

    //common errors
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
    681: "Unable to load resource templates, resource not supported"

};
