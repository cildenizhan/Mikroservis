import express from 'express';
import productRoutes from './routes/productRoutes';

class ProductServer {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.routes();
        this.setupErrorHandlers();
    }

    private routes(): void {
        this.app.get('/health', (req: express.Request, res: express.Response) => {
            res.status(200).json({ status: 'ok', service: 'product-service' });
        });

        this.app.use(productRoutes);
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
            console.log(`Product servisi ${port} portunda calisiyor.`);
        });
    }
}

const productServer = new ProductServer();
export default productServer.app;
