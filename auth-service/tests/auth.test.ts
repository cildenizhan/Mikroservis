import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../src/server';
import fs from 'fs';
import path from 'path';

const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

describe('Auth Service - Register Testleri', () => {

    beforeEach(() => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }
    });

    afterEach(() => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }
    });

    it('POST /register - Basarili kayit 201 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'test@test.com', password: '123456' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'test@test.com');
    });

    it('POST /register - Sifre response icinde donmemeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'test@test.com', password: '123456' });

        expect(response.status).toBe(201);
        expect(response.body).not.toHaveProperty('password');
    });

    it('POST /register - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /register - Ayni username ile kayit 409 donmeli', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'test@test.com', password: '123456' });

        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'baska@test.com', password: '654321' });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /register - Ayni email ile kayit 409 donmeli', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'user1', email: 'test@test.com', password: '123456' });

        const response = await request(app)
            .post('/register')
            .send({ username: 'user2', email: 'test@test.com', password: '654321' });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', true);
    });
});

describe('Auth Service - Login Testleri', () => {

    beforeEach(async () => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }

        await request(app)
            .post('/register')
            .send({ username: 'testuser', email: 'test@test.com', password: '123456' });
    });

    afterEach(() => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }
    });

    it('POST /login - Dogru bilgilerle 200 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: '123456' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('username', 'testuser');
    });

    it('POST /login - Yanlis sifre ile 401 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'yanlis-sifre' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /login - Olmayan kullanici ile 401 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'olmayan-user', password: '123456' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', true);
    });

    it('POST /login - Eksik alanlarla 400 donmeli', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', true);
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
