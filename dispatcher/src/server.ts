import express from 'express';
import { RequestLogger } from './middleware/RequestLogger';
import { ServiceRouter } from './router/ServiceRouter';

/**
 * Server sınıfı - Dispatcher (API Gateway) ana sunucu sınıfı
 * 
 * Tüm gelen istekleri karşılar, loglar ve ilgili mikroservise yönlendirir.
 * Tek giriş noktası (Single Entry Point) olarak çalışır.
 */
class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.routes();
        this.setupProxy();
        this.setupErrorHandlers();
    }

    /**
     * Middleware'leri yapılandırır
     * Loglama middleware'i tüm isteklerden önce çalışır
     */
    private setupMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(RequestLogger.middleware);
    }

    /**
     * Dispatcher'a ait yerel rotalar
     * Health check gibi doğrudan dispatcher'ın yanıtladığı endpointler
     */
    private routes(): void {
        this.app.get('/api/health', (req, res) => {
            res.status(200).send('OK');
        });
    }

    /**
     * Proxy yönlendirme - İstekleri mikroservislere iletir
     * /api/auth/* → Auth Service
     * /api/products/* → Product Service
     * /api/orders/* → Order Service
     */
    private setupProxy(): void {
        this.app.use(ServiceRouter.proxyRequest);
    }

    /**
     * Hata yakalayıcılar - 404 ve genel hatalar
     */
    private setupErrorHandlers(): void {
        // 404 - Tanımsız rota
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
            console.log(`Dispatcher servisi ${port} portunda çalışıyor.`);
        });
    }
}

export default new Server().app;