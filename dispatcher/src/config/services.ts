export interface ServiceConfig {
    name: string;
    baseUrl: string;
    prefix: string;
}

export const services: ServiceConfig[] = [
    {
        name: 'auth-service',
        baseUrl: process.env['AUTH_SERVICE_URL'] || 'http://localhost:3001',
        prefix: '/api/auth'
    },
    {
        name: 'product-service',
        baseUrl: process.env['PRODUCT_SERVICE_URL'] || 'http://localhost:3002',
        prefix: '/api/products'
    },
    {
        name: 'order-service',
        baseUrl: process.env['ORDER_SERVICE_URL'] || 'http://localhost:3003',
        prefix: '/api/orders'
    }
];

export function findServiceByPath(path: string): ServiceConfig | undefined {
    return services.find(service => path.startsWith(service.prefix));
}
