/**
 * ServiceConfig arayüzü - Mikroservis yapılandırma bilgisi
 */
export interface ServiceConfig {
    name: string;
    baseUrl: string;
    prefix: string;
}

/**
 * Tüm mikroservislerin yapılandırma bilgilerini içerir
 * Ortam değişkenleri veya varsayılan değerler kullanılır
 */
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

/**
 * Verilen URL yoluna göre uygun servisi bulur
 * @param path - İstek URL yolu
 * @returns Eşleşen servis yapılandırması veya undefined
 */
export function findServiceByPath(path: string): ServiceConfig | undefined {
    return services.find(service => path.startsWith(service.prefix));
}
