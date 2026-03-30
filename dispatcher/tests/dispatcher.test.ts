import request from 'supertest';
import { describe, it, expect } from '@jest/globals';


describe('Dispatcher (API Gateway) Testleri', () => {
    
    it('Sistem çalışıyor mu diye health check atıyoruz', async () => {
        const response = await request('http://localhost:8080').get('/api/health');
        expect(response.status).toBe(200);
    });

    it('Yanlış bir URL girilirse 404 hatası veriyor mu testi', async () => {
        const response = await request('http://localhost:8080').get('/api/olmayan-rota');
        expect(response.status).toBe(404);
    });
});