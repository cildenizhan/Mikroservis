import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
    scenarios: {
        low_load: {
            executor: 'constant-vus',
            vus: 50,
            duration: '2m',
            startTime: '0s',
            tags: { scenario: 'low_load' },
        },
        medium_load: {
            executor: 'constant-vus',
            vus: 100,
            duration: '2m',
            startTime: '2m10s',
            tags: { scenario: 'medium_load' },
        },
        high_load: {
            executor: 'constant-vus',
            vus: 200,
            duration: '2m',
            startTime: '4m20s',
            tags: { scenario: 'high_load' },
        },
        stress_test: {
            executor: 'constant-vus',
            vus: 500,
            duration: '2m',
            startTime: '6m30s',
            tags: { scenario: 'stress_test' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'],
        errors: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
        'health status is 200': (r) => r.status === 200,
    });
    errorRate.add(healthRes.status !== 200);
    responseTime.add(healthRes.timings.duration);

    const productsRes = http.get(`${BASE_URL}/api/products`);
    check(productsRes, {
        'products status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    });
    errorRate.add(productsRes.status >= 500 && productsRes.status !== 503);
    responseTime.add(productsRes.timings.duration);

    const ordersRes = http.get(`${BASE_URL}/api/orders`);
    check(ordersRes, {
        'orders status is 200 or 401 or 503': (r) => r.status === 200 || r.status === 401 || r.status === 503,
    });
    errorRate.add(ordersRes.status >= 500 && ordersRes.status !== 503);
    responseTime.add(ordersRes.timings.duration);

    sleep(1);
}
