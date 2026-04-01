import express from 'express';
import { RequestLogger } from './middleware/RequestLogger';

class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.routes();
    }

    /**
     * Middleware'leri yapılandırır
     * Loglama middleware'i tüm isteklerden önce çalışır
     */
    private setupMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(RequestLogger.middleware);
    }

    private routes(): void {
        this.app.get('/api/health', (req, res) => {
            res.status(200).send('OK');
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Dispatcher servisi ${port} portunda çalışıyor.`);
        });
    }
}

export default new Server().app;