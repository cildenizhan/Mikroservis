import express from 'express';

class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.routes();
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