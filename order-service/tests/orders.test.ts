import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

jest.mock('../src/models/OrderModel.js', () => {
    let memoryDb: any[] = [];
    return {
        OrderModel: {
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

jest.mock('../src/database/MongoDatabase.js', () => {
    return { connectDB: jest.fn(async () => { return; }) };
});

import app from '../src/server.js';
const { __clearMemoryDb, __addDoc } = require('../src/models/OrderModel.js');

describe('Order Service - Siparis Yonetimi Testleri', () => {
    beforeEach(() => { __clearMemoryDb(); });
    afterEach(() => { __clearMemoryDb(); });

    it('GET /health - 200 donmeli', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });

    it('GET / - Tum siparisler listelenmeli', async () => {
        __addDoc({ id: '1', productId: 'p1', userId: 'u1', quantity: 2, totalPrice: 100, status: 'pending' });
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });
});
