import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
jest.mock('../src/models/UserModel.js', () => {
    let memoryDb: any[] = [];
    return {
        UserModel: {
            findOne: jest.fn(async (query: any) => memoryDb.find(u => u.username === query.username || u.email === query.email || u.id === query.id)),
            findOneAndDelete: jest.fn(async (query: any) => {
               const idx = memoryDb.findIndex(u => u.id === query.id);
               if(idx > -1) { const u = memoryDb[idx]; memoryDb.splice(idx, 1); return u; }
               return null;
            }),
            find: jest.fn(async () => memoryDb),
        },
        __clearMemoryDb: () => { memoryDb = []; },
        __addUser: (user: any) => { memoryDb.push(user); }
    };
});
jest.mock('../src/database/MongoDatabase.js', () => {
    return {
        connectDB: jest.fn(async () => { return; })
    };
});
import app from '../src/server.js';
import crypto from 'crypto';
const { __clearMemoryDb, __addUser } = require('../src/models/UserModel.js');
describe('Auth Service - Register Testleri', () => {
    beforeEach(() => {
        __clearMemoryDb();
    });
    afterEach(() => {
        __clearMemoryDb();
    });
});
describe('Auth Service - Health & Genel Testler', () => {
    it('GET /health - 200 donmeli', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('service', 'auth-service');
    });
    it('Tanimsiz rota icin 404 donmeli', async () => {
        const response = await request(app).get('/olmayan-rota');
        expect(response.status).toBe(404);
    });
});
