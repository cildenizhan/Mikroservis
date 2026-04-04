import express from 'express';
import { RequestLogger } from './middleware/RequestLogger.js';
import { ServiceRouter } from './router/ServiceRouter.js';
import { AuthMiddleware } from './middleware/AuthMiddleware.js';
import promBundle from 'express-prom-bundle';
import os from 'os';
import path from 'path';
const metricsMiddleware = promBundle({includeMethod: true, includePath: true});

class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.routes();
        this.setupProxy();
        this.setupErrorHandlers();
    }

    private setupMiddlewares(): void {
        this.app.use(metricsMiddleware);
        this.app.use(express.json());
        this.app.use(RequestLogger.middleware);
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.use(AuthMiddleware.verifyToken);
    }

    private routes(): void {
        this.app.get('/api/health', (req, res) => {
            res.status(200).send('OK');
        });

        this.app.get('/api/system-status', (req, res) => {
            const memUsage = process.memoryUsage();
            
            res.status(200).json({
                uptime: process.uptime(),
                memory: {
                    rss: Math.round(memUsage.rss / 1024 / 1024),
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                },
                loadAverage: os.loadavg(),
                timestamp: new Date().toISOString()
            });
        });
    }

    private setupProxy(): void {
        this.app.use(ServiceRouter.proxyRequest);
    }

    private setupErrorHandlers(): void {
        this.app.use((req: express.Request, res: express.Response) => {
            res.status(404).json({
                error: true,
                message: 'Bu endpoint bulunamadi',
                path: req.originalUrl,
                timestamp: new Date().toISOString()
            });
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Dispatcher servisi ${port} portunda calisiyor.`);
        });
    }
}

export default new Server().app;