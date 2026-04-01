import { ServiceConfig, findServiceByPath } from '../config/services';
import http from 'http';

export class ServiceRouter {

    public static proxyRequest(req: any, res: any, next: any): void {
        const service = findServiceByPath(req.originalUrl || req.url);

        if (!service) {
            next();
            return;
        }

        ServiceRouter.forwardRequest(req, res, service);
    }

    private static forwardRequest(req: any, res: any, service: ServiceConfig): void {
        const url = new URL(service.baseUrl);
        const targetPath = (req.originalUrl || req.url).replace(service.prefix, '') || '/';

        const options: http.RequestOptions = {
            hostname: url.hostname,
            port: url.port,
            path: targetPath,
            method: req.method,
            headers: {
                ...req.headers,
                host: url.host
            }
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (error: Error) => {
            console.error(`[ServiceRouter] ${service.name} servisi ulasilamaz: ${error.message}`);
            res.status(503).json({
                error: true,
                message: `${service.name} servisi su anda ulasilamaz durumda`,
                service: service.name,
                timestamp: new Date().toISOString()
            });
        });

        if (req.body && Object.keys(req.body).length > 0) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }

        proxyReq.end();
    }
}
