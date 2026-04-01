import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/server'; 

describe('Dispatcher (API Gateway) Testleri', () => {
    
    it('Sistem çalışıyor mu diye health check atıyoruz', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK'); 
    });

    it('Yanlış bir URL girilirse 404 hatası veriyor mu testicd dispatcher', async () => {
        const response = await request(app).get('/api/olmayan-rota');
        expect(response.status).toBe(404);
    });
});