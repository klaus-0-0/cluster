"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cluster_1 = __importDefault(require("cluster"));
const os = require('os');
const cpuCount = os.cpus().length;
const port = 3000;
if (cluster_1.default.isPrimary) {
    console.log(`Number of CPUs is ${cpuCount}`);
    console.log(`Primary ${process.pid} is running`);
    // Fork worker
    for (let i = 0; i < cpuCount; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Let s fork another worker to replace the dead one');
        cluster_1.default.fork();
    });
}
else {
    const app = (0, express_1.default)();
    console.log(`Worker ${process.pid} started`);
    app.get('/', (req, res) => {
        res.send('Hello there');
    });
    app.get('/api/:n', (req, res) => {
        let n = parseInt(req.params.n);
        let count = 0;
        if (n > 5000000000)
            n = 5000000000;
        for (let i = 0; i < n; i++) {
            count += i;
        }
        res.send(`Final count is ${count} ${process.pid}`);
    });
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}
