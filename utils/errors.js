'use strict';

module.exports = {
    //common errors
    518: "The chosen strategy does not exist",
    519: "The chosen driver does not support the selected function",

    //kubernetes errors
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

    //docker swarm errors
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
    652: "Unable to add node to swarm, specified node is already part of a swarm"
};
