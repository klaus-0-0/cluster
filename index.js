"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cluster_1 = require("cluster");
var os_1 = require("os");
var cpuCount = os_1.default.cpus().length;
var port = 3000;
if (cluster_1.default.isPrimary) {
    console.log("Number of CPUs is ".concat(cpuCount));
    console.log("Primary ".concat(process.pid, " is running"));
    // Fork worker
    for (var i = 0; i < cpuCount; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', function (worker, code, signal) {
        console.log("Worker ".concat(worker.process.pid, " died"));
        console.log('Lets fork another worker to replace the dead one');
        cluster_1.default.fork();
    });
}
else {
    var app = (0, express_1.default)();
    console.log("Worker ".concat(process.pid, " started"));
    app.get('/', function (req, res) {
        res.send('Hello there');
    });
    app.get('/api/:n', function (req, res) {
        var n = parseInt(req.params.n);
        var count = 0;
        if (n > 5000000000)
            n = 5000000000;
        for (var i = 0; i < n; i++) {
            count += i;
        }
        res.send("Final count is ".concat(count, " ").concat(process.pid));
    });
    app.listen(port, function () {
        console.log("App listening on port ".concat(port));
    });
}
