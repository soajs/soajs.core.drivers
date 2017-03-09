'use strict';

var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

app.all('/proxySocket/*', function (req, res) {
    req.url = req.url.split('/proxySocket')[1];
    req.headers.host = '127.0.0.1';

    var haTarget = {
        socketPath: process.env.SOAJS_SWARM_UNIX_PORT || '/var/run/docker.sock'
    };
    proxy.web(req, res, { target: haTarget });
});

app.listen(5000, function () {

});
