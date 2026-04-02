import express from 'express';
import orderRoutes from './routes/orderRoutes.js';

class OrderServer {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.routes();
        this.setupErrorHandlers();
    }

    private routes(): void {
        this.app.get('/health', (req: express.Request, res: express.Response) => {
            res.status(200).json({ status: 'ok', service: 'order-service' });
        });

        this.app.use(orderRoutes);
    }

    private setupErrorHandlers(): void {
        this.app.use((req: express.Request, res: express.Response) => {
            res.status(404).json({
                error: true,
                message: 'Bu endpoint bulunamadi',
                path: req.originalUrl
            });
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Order servisi ${port} portunda calisiyor.`);
        });
    }
}

const orderServer = new OrderServer();
export default orderServer.app;
