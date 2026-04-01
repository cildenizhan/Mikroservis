import request from 'supertest';
import { describe, it, expect, beforeEach } from '@jest/globals';
import app from '../src/server';
import { RequestLogger } from '../src/middleware/RequestLogger';

describe('Loglama Middleware Testleri', () => {

    beforeEach(() => {
        // Her testten önce log kayıtlarını temizle
        RequestLogger.clearLogs();
    });

    it('Gelen istek loglanıyor mu - zaman damgası, metot, URL kaydedilmeli', async () => {
        await request(app).get('/api/health');

        const logs = RequestLogger.getLogs();
        expect(logs.length).toBeGreaterThan(0);

        const lastLog = logs[logs.length - 1];
        expect(lastLog).toHaveProperty('timestamp');
        expect(lastLog).toHaveProperty('method', 'GET');
        expect(lastLog).toHaveProperty('url', '/api/health');
    });

    it('Log kaydında status code bulunmalı', async () => {
        await request(app).get('/api/health');

        const logs = RequestLogger.getLogs();
        const lastLog = logs[logs.length - 1];
        expect(lastLog).toHaveProperty('statusCode', 200);
    });

    it('Log kaydında yanıt süresi (responseTime) bulunmalı', async () => {
        await request(app).get('/api/health');

        const logs = RequestLogger.getLogs();
        const lastLog = logs[logs.length - 1];
        expect(lastLog).toHaveProperty('responseTime');
        expect(typeof lastLog!.responseTime).toBe('number');
        expect(lastLog!.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('Zaman damgası ISO 8601 formatında olmalı', async () => {
        await request(app).get('/api/health');

        const logs = RequestLogger.getLogs();
        const lastLog = logs[logs.length - 1];
        
        // ISO 8601 formatı kontrolü
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        expect(lastLog!.timestamp).toMatch(isoRegex);
    });

    it('Birden fazla istek sırayla loglanmalı', async () => {
        await request(app).get('/api/health');
        await request(app).get('/api/olmayan-rota');

        const logs = RequestLogger.getLogs();
        expect(logs.length).toBe(2);
        expect(logs[0]!.url).toBe('/api/health');
        expect(logs[1]!.url).toBe('/api/olmayan-rota');
    });

    it('404 hatası loglanmalı', async () => {
        await request(app).get('/api/olmayan-rota');

        const logs = RequestLogger.getLogs();
        const lastLog = logs[logs.length - 1];
        expect(lastLog).toHaveProperty('statusCode', 404);
    });

    it('POST isteği loglanmalı', async () => {
        await request(app).post('/api/health');

        const logs = RequestLogger.getLogs();
        const lastLog = logs[logs.length - 1];
        expect(lastLog).toHaveProperty('method', 'POST');
    });
});
