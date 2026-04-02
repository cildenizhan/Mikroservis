import express from 'express';
import authRoutes from './routes/authRoutes';

class AuthServer {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.routes();
        this.setupErrorHandlers();
    }

    private routes(): void {
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', service: 'auth-service' });
        });

        this.app.use(authRoutes);
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
            console.log(`Auth servisi ${port} portunda calisiyor.`);
        });
    }
}

const authServer = new AuthServer();
export default authServer.app;
