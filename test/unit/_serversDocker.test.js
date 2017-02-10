"use strict";
var shell = require('shelljs');

var controller = null;
describe("", function () {

    describe("Docker", function () {
        //Remove existing docker services
        it("Remove existing docker services", function (done) {
            shell.exec("docker service rm $(docker service ls -q)");
            process.env.SOAJS_DEPLOY_HA = "swarm";
            done();
        });

        //Start the controller service
        it("Start docker swarm Controller", function (done) {
            process.env.SOAJS_SOLO = true;
            controller = require(__dirname + "/../proxySocket.js");
            setTimeout(function () {
                done();
            }, 2000);
        });

        //Perform the docker swarm test cases
        it("Test docker swarm", function (done) {
            require("./swarm.unit.test.js");
            setTimeout(function () {
                done();
            }, 2000);
        });
    });


});