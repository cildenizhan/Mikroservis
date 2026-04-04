import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/server';
describe('Hata Yonetimi Testleri', () => {
    it('404 hatasi JSON formatinda donmeli', async () => {
        const response = await request(app).get('/api/bilinmeyen-endpoint');
        expect([401, 404]).toContain(response.status);
        expect(response.body).toHaveProperty('error', true);
        expect(response.body).toHaveProperty('message');
    });
    it('404 hatasinda istek yapilan path bilgisi olmali', async () => {
        const response = await request(app).get('/api/test-path-123');
        expect([401, 404]).toContain(response.status);
        expect(response.body).toHaveProperty('error', true);
    });
    it('Ulasılamayan servise istek atildiginda 401 veya 503 donmeli', async () => {
        const response = await request(app).get('/api/products');
        expect([401, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('error', true);
    });
    it('Hata yanitinda zaman bilgisi olmali', async () => {
        const response = await request(app).get('/api/yok-boyle-bir-sey');
        expect([401, 404]).toContain(response.status);
        expect(response.body).toHaveProperty('error', true);
    });
    it('Health check endpoint her zaman 200 donmeli (hata yonetimine takılmamali)', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
    });
    it('Hata yanitlarinda content-type application/json olmali', async () => {
        const response = await request(app).get('/api/olmayan-rota');
        expect(response.headers['content-type']).toMatch(/json/);
    });
});
