import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/server'; 

describe('Dispatcher (API Gateway) Testleri', () => {
    
    it('Sistem calisiyor mu diye health check atiyoruz', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK'); 
    });

    it('Yanlis bir URL girilirse 401 veya 404 hatasi veriyor mu testi', async () => {
        const response = await request(app).get('/api/olmayan-rota');
        expect([401, 404]).toContain(response.status);
    });
});