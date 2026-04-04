import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/server';
describe('Hata Yonetimi Testleri', () => {
    it('404 hatasi JSON formatinda donmeli', async () => {
        const response = await request(app).get('/api/bilinmeyen-endpoint');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
    });
    it('404 hatasinda istek yapilan path bilgisi olmali', async () => {
        const response = await request(app).get('/api/test-path-123');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('path', '/api/test-path-123');
    });
    it('Ulasılamayan servise istek atildiginda 503 donmeli', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('error', true);
        expect(response.body).toHaveProperty('service');
    });
    it('Hata yanitinda timestamp ISO 8601 formatinda olmali', async () => {
        const response = await request(app).get('/api/yok-boyle-bir-sey');
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        expect(response.body.timestamp).toMatch(isoRegex);
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
