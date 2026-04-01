import express from 'express';

class AuthServer {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.routes();
    }

    private routes(): void {
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', service: 'auth-service' });
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
