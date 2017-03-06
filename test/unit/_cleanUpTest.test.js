"use strict";
var shell = require('shelljs');

describe("Clean up kubneretes and docker deployments", function () {
    //Remove existing docker services
    it("Cleanup docker services", function (done) {
        shell.exec("docker service rm $(docker service ls -q)");
        done();
    });

    //Remove existing kubernetes deployments
    it.skip("Cleanup kubernetes deployments", function (done) {
        shell.exec("kubectl delete namespaces --all");
        done();
    });
});
