import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
jest.mock('../src/models/ProductModel', () => {
    let memoryDb: any[] = [];
    return {
        ProductModel: {
            find: jest.fn(async () => memoryDb),
            findOne: jest.fn(async (q: any) => memoryDb.find(i => i.id === q.id)),
            findOneAndUpdate: jest.fn(async (q: any, updates: any) => {
                const idx = memoryDb.findIndex(i => i.id === q.id);
                if(idx > -1) { memoryDb[idx] = { ...memoryDb[idx], ...updates }; return memoryDb[idx]; }
                return null;
            }),
            findOneAndDelete: jest.fn(async (q: any) => {
               const idx = memoryDb.findIndex(i => i.id === q.id);
               if(idx > -1) { const doc = memoryDb[idx]; memoryDb.splice(idx, 1); return doc; }
               return null;
            })
        },
        __clearMemoryDb: () => { memoryDb = []; },
        __addDoc: (doc: any) => { memoryDb.push(doc); }
    };
});
jest.mock('../src/database/MongoDatabase', () => {
    return { connectDB: jest.fn(async () => { return; }) };
});
import app from '../src/server';
const { __clearMemoryDb, __addDoc } = require('../src/models/ProductModel');
describe('Product Service - Urun Yonetimi Testleri', () => {
    beforeEach(() => { __clearMemoryDb(); });
    afterEach(() => { __clearMemoryDb(); });
    it('GET /health - 200 donmeli', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });
    it('GET / - Tum urunler listelenmeli', async () => {
        __addDoc({ id: '1', name: 'Telefon', price: 5000, stock: 10 });
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });
});
