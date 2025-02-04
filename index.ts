import express, { Request, Response } from 'express';
import cluster from 'cluster';
import os from 'os';

const cpuCount: number = os.cpus().length;
const port: number = 3000;

if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${cpuCount}`);
    console.log(`Primary ${process.pid} is running`);

    // Fork worker
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Lets fork another worker to replace the dead one');
        cluster.fork();
    });

} else {
    const app = express();
    console.log(`Worker ${process.pid} started`);

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello there');
    });

    app.get('/api/:n', (req: Request, res: Response) => {
        let n: number = parseInt(req.params.n);
        let count: number = 0;

        if (n > 5000000000) n = 5000000000;
        for (let i = 0; i < n; i++) {
            count += i;
        }
        res.send(`Final count is ${count} ${process.pid}`);
    });

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}
