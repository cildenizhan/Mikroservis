import request from 'supertest';
import { describe, it, expect } from '@jest/globals';


describe('Dispatcher (API Gateway) Testleri', () => {
    
    it('Sistem ayakta mı kontrolü (Health Check) 200 dönmeli', async () => {
        const response = await request('http://localhost:8080').get('/api/health');
        expect(response.status).toBe(200);
    });

    it('Bilinmeyen bir adrese gidildiğinde 404 dönmeli', async () => {
        const response = await request('http://localhost:8080').get('/api/olmayan-rota');
        expect(response.status).toBe(404);
    });
});