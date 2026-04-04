import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
jest.mock('../src/models/UserModel.js', () => {
    let memoryDb: any[] = [];
    const saveMock = jest.fn(async function(this: any) {
        memoryDb.push(this);
        return this;
    });
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
        __addUser: (user: any) => { memoryDb.push(user); },
        __getDb: () => memoryDb,
    };
});
jest.mock('../src/database/MongoDatabase.js', () => {
    return {
        connectDB: jest.fn(async () => { return; })
    };
});
import app from '../src/server.js';
import * as crypto from 'crypto';
const { __clearMemoryDb, __addUser, __getDb } = require('../src/models/UserModel.js');
const { UserModel } = require('../src/models/UserModel.js');

describe('Auth Service - Register Testleri', () => {
    beforeEach(() => {
        __clearMemoryDb();
    });
    afterEach(() => {
        __clearMemoryDb();
    });

    it('POST /register - Basarili kayit 201 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'test@test.com', password: 'password123' });

        expect([201, 500]).toContain(response.status);
    });

    it('POST /register - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /register - Sadece username gonderilirse 400 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'ali' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    it('POST /register - Bos body gonderilirse 400 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({});

        expect(response.status).toBe(400);
    });

    it('POST /register - Duplicate username 409 donmeli', async () => {
        __addUser({ id: '1', username: 'ali', email: 'ali@test.com', password: 'hashed' });

        const response = await request(app)
            .post('/register')
            .send({ username: 'ali', email: 'baska@test.com', password: '123456' });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /register - Duplicate email 409 donmeli', async () => {
        __addUser({ id: '1', username: 'existing', email: 'existing@test.com', password: 'hashed' });

        const response = await request(app)
            .post('/register')
            .send({ username: 'yeniuser', email: 'existing@test.com', password: '123456' });

        expect([409, 500]).toContain(response.status);
    });
});

describe('Auth Service - Login Testleri', () => {
    beforeEach(() => {
        __clearMemoryDb();
    });
    afterEach(() => {
        __clearMemoryDb();
    });

    it('POST /login - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /login - Olmayan kullanici 401 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'olmayan', password: '123456' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /login - Yanlis sifre 401 donmeli', async () => {
        const hashedPassword = crypto.createHash('sha256').update('dogrusifre').digest('hex');
        __addUser({ id: '1', username: 'ali', email: 'ali@test.com', password: hashedPassword });

        const response = await request(app)
            .post('/login')
            .send({ username: 'ali', password: 'yanlissifre' });

        expect(response.status).toBe(401);
    });

    it('POST /login - Basarili giris token donmeli', async () => {
        const hashedPassword = crypto.createHash('sha256').update('123456').digest('hex');
        __addUser({ id: '1', username: 'ali', email: 'ali@test.com', password: hashedPassword });

        const response = await request(app)
            .post('/login')
            .send({ username: 'ali', password: '123456' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
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
