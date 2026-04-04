import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/server';
describe('Dispatcher Router / Proxy Testleri', () => {
    it('GET /api/auth/health - Auth servisine yonlendirme yapilmali', async () => {
        const response = await request(app).get('/api/auth/health');
        expect([200, 503]).toContain(response.status);
    });
    it('GET /api/products - Product servisine yonlendirme yapilmali', async () => {
        const response = await request(app).get('/api/products');
        expect([200, 503]).toContain(response.status);
    });
    it('GET /api/orders - Order servisine yonlendirme yapilmali', async () => {
        const response = await request(app).get('/api/orders');
        expect([200, 503]).toContain(response.status);
    });
    it('POST /api/auth/register - Auth servisine POST yonlendirme', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test', password: '123456' });
        expect([200, 201, 503]).toContain(response.status);
    });
    it('POST /api/products - Product servisine POST yonlendirme', async () => {
        const response = await request(app)
            .post('/api/products')
            .send({ name: 'Test Urun', price: 100 });
        expect([200, 201, 503]).toContain(response.status);
    });
    it('PUT /api/products/1 - Product servisine PUT yonlendirme', async () => {
        const response = await request(app)
            .put('/api/products/1')
            .send({ name: 'Guncellenmis Urun', price: 150 });
        expect([200, 503]).toContain(response.status);
    });
    it('DELETE /api/products/1 - Product servisine DELETE yonlendirme', async () => {
        const response = await request(app)
            .delete('/api/products/1');
        expect([200, 204, 503]).toContain(response.status);
    });
    it('Tanimsiz rota icin 404 donmeli', async () => {
        const response = await request(app).get('/api/bilinmeyen-servis/xyz');
        expect(response.status).toBe(404);
    });
    it('Yanit her zaman JSON formatinda olmali', async () => {
        const response = await request(app).get('/api/products');
        if (response.status !== 404) {
            expect(response.headers['content-type']).toMatch(/json/);
        }
    });
});
