import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../src/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'products.json');

describe('Product Service - Urun Yonetimi Testleri', () => {

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
        expect(response.body).toHaveProperty('service', 'product-service');
    });

    it('POST / - Yeni urun basariyla eklenmeli (201)', async () => {
        const response = await request(app)
            .post('/')
            .send({ name: 'Laptop', price: 15000, stock: 10 });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', 'Laptop');
        expect(response.body).toHaveProperty('price', 15000);
        expect(response.body).toHaveProperty('stock', 10);
    });

    it('POST / - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/')
            .send({ name: 'Laptop' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
    });

    it('GET / - Tum urunler listelenmeli', async () => {
        await request(app).post('/').send({ name: 'Urun 1', price: 100, stock: 5 });
        await request(app).post('/').send({ name: 'Urun 2', price: 200, stock: 15 });

        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    });

    it('GET /:id - Gecerli urun id ile 200 donmeli', async () => {
        const createRes = await request(app).post('/').send({ name: 'Urun X', price: 50, stock: 1 });
        const productId = createRes.body.id;

        const response = await request(app).get(`/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', productId);
        expect(response.body).toHaveProperty('name', 'Urun X');
    });

    it('GET /:id - Olmayan urun 404 donmeli', async () => {
        const response = await request(app).get('/olmayan-id-123');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', true);
    });

    it('PUT /:id - Urun güncellenebilmeli', async () => {
        const createRes = await request(app).post('/').send({ name: 'Eski Isim', price: 100, stock: 1 });
        const productId = createRes.body.id;

        const response = await request(app)
            .put(`/${productId}`)
            .send({ name: 'Yeni Isim', price: 150 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', 'Yeni Isim');
        expect(response.body).toHaveProperty('price', 150);
        expect(response.body).toHaveProperty('stock', 1); // Degismeyen alan ayni kalmali
    });

    it('PUT /:id - Olmayan urun guncelleme 404', async () => {
        const response = await request(app)
            .put('/olmayan-id-123')
            .send({ name: 'Test' });

        expect(response.status).toBe(404);
    });

    it('DELETE /:id - Urun silinebilmeli', async () => {
        const createRes = await request(app).post('/').send({ name: 'Silinecek Urun', price: 50, stock: 1 });
        const productId = createRes.body.id;

        const deleteRes = await request(app).delete(`/${productId}`);
        expect(deleteRes.status).toBe(200);

        const checkRes = await request(app).get(`/${productId}`);
        expect(checkRes.status).toBe(404);
    });

    it('DELETE /:id - Olmayan urun silme 404', async () => {
        const response = await request(app).delete('/olmayan-id-123');
        expect(response.status).toBe(404);
    });
});
