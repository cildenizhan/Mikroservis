import express from 'express';
import { RequestLogger } from './middleware/RequestLogger.js';
import { ServiceRouter } from './router/ServiceRouter.js';
import { AuthMiddleware } from './middleware/AuthMiddleware.js';
import promBundle from 'express-prom-bundle';

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
        this.app.use(AuthMiddleware.verifyToken);
    }

    private routes(): void {
        this.app.get('/api/health', (req, res) => {
            res.status(200).send('OK');
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