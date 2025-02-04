import express from 'express';
import cluster from 'cluster';
import os from 'os'

const cpuCount = os.cpus().length;
const port = 3000;

if(cluster.isPrimary) {
    console.log(`number of cpus is ${cpuCount}`);
    console.log(`Primary ${process.pid} is running`);

    // fork worker 
    for(let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }


cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log('lets fork another worker to replace the dead one');
    cluster.fork();
});

} else {
    const app = express();
    console.log(`Worker ${process.pid} started`);

    app.get ('/', (req, res) => {
        res.send('hellow there')
    })

    app.get ("/api/:n", function (req, res) {
        let n = parseInt(req.params.n);
        let count = 0;

        if (n > 5000000000) n= 5000000000;
        for (let i = 0; i < n; i++) {
            count += i;
        }
        res.send(`final count is ${count} ${process.pid}`)
    })

    app.listen(port, () => {
        console.log(`app listning on port ${port}`);
    });
}
