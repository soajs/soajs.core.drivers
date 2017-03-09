"use strict";
var assert = require("assert");
var request = require("request");
var shell = require('shelljs');

var controller = null;
describe("", function () {

    describe("Docker", function () {

	    before('Activate swarm mode for local docker engine and create overlay network', function (done) {
		    var params = {
			    method: 'POST',
			    uri: 'http://unix:/var/run/docker.sock:/swarm/init',
			    json: true,
			    headers: {
				    Host: '127.0.0.1'
			    },
			    body: {
				    "ListenAddr": "0.0.0.0:2377",
				    "AdvertiseAddr": "127.0.0.1:2377",
				    "ForceNewCluster": true
			    }
		    };

		    request(params, function (error, response, nodeId) {
			    assert.ifError(error);

			    params = {
				    method: 'POST',
				    uri: 'http://unix:/var/run/docker.sock:/networks/create',
				    json: true,
				    headers: {
					    Host: '127.0.0.1'
				    },
				    body: {
					    "Name": 'soajsnet',
					    "Driver": 'overlay',
					    "Internal": false,
					    "CheckDuplicate": false,
					    "EnableIPv6": false,
					    "IPAM": {
						    "Driver": 'default'
					    }
				    }
			    };

			    request(params, function (error, response, body) {
				    assert.ifError(error);
				    done();
			    });
		    });
	    });

	    beforeEach(function(done){
		    setTimeout(function(){
			    done();
		    }, 700);
	    });

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
