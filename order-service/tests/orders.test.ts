import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../src/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'orders.json');

describe('Order Service - Siparis Yonetimi Testleri', () => {

    beforeEach(() => {
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
        }
    });

    afterEach(() => {
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
        }
    });

    it('GET /health - 200 donmeli', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('service', 'order-service');
    });

    it('POST / - Yeni siparis basariyla eklenmeli (201)', async () => {
        const response = await request(app)
            .post('/')
            .send({ productId: 'prod-1', userId: 'user-1', quantity: 2, totalPrice: 300 });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('productId', 'prod-1');
        expect(response.body).toHaveProperty('userId', 'user-1');
        expect(response.body).toHaveProperty('quantity', 2);
        expect(response.body).toHaveProperty('totalPrice', 300);
        expect(response.body).toHaveProperty('status', 'pending');
    });

    it('POST / - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/')
            .send({ productId: 'prod-1' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
    });

    it('GET / - Tum siparisler listelenmeli', async () => {
        await request(app).post('/').send({ productId: 'prod-1', userId: 'user-1', quantity: 1, totalPrice: 100 });
        await request(app).post('/').send({ productId: 'prod-2', userId: 'user-2', quantity: 3, totalPrice: 450 });

        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    });

    it('GET /:id - Gecerli siparis id ile 200 donmeli', async () => {
        const createRes = await request(app).post('/').send({ productId: 'prod-3', userId: 'user-3', quantity: 1, totalPrice: 50 });
        const orderId = createRes.body.id;

        const response = await request(app).get(`/${orderId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', orderId);
        expect(response.body).toHaveProperty('productId', 'prod-3');
    });

    it('GET /:id - Olmayan siparis 404 donmeli', async () => {
        const response = await request(app).get('/olmayan-id-123');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', true);
    });

    it('PUT /:id - Siparis durumu güncellenebilmeli', async () => {
        const createRes = await request(app).post('/').send({ productId: 'prod-1', userId: 'user-1', quantity: 1, totalPrice: 100 });
        const orderId = createRes.body.id;

        const response = await request(app)
            .put(`/${orderId}`)
            .send({ status: 'shipped' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'shipped');
    });

    it('DELETE /:id - Siparis iptal / silinebilmeli', async () => {
        const createRes = await request(app).post('/').send({ productId: 'p', userId: 'u', quantity: 1, totalPrice: 10 });
        const orderId = createRes.body.id;

        const deleteRes = await request(app).delete(`/${orderId}`);
        expect(deleteRes.status).toBe(200);

        const checkRes = await request(app).get(`/${orderId}`);
        expect(checkRes.status).toBe(404);
    });
});
