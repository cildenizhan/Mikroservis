import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../src/server';
import fs from 'fs';
import path from 'path';

const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

describe('Auth Service - Kullanici Yonetimi Testleri', () => {

    beforeEach(async () => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }

        await request(app)
            .post('/register')
            .send({ username: 'ali', email: 'ali@test.com', password: '123456' });

        await request(app)
            .post('/register')
            .send({ username: 'veli', email: 'veli@test.com', password: '654321' });
    });

    afterEach(() => {
        if (fs.existsSync(USERS_DB_PATH)) {
            fs.unlinkSync(USERS_DB_PATH);
        }
    });

    it('GET /users - Tum kullanicilar listelenmeli', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    });

    it('GET /users - Sifre bilgisi donmemeli', async () => {
        const response = await request(app).get('/users');

        response.body.forEach((user: any) => {
            expect(user).not.toHaveProperty('password');
        });
    });

    it('GET /users/:id - Tek kullanici getirilmeli', async () => {
        const allUsers = await request(app).get('/users');
        const userId = allUsers.body[0].id;

        const response = await request(app).get(`/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('username');
    });

    it('GET /users/:id - Olmayan kullanici icin 404 donmeli', async () => {
        const response = await request(app).get('/users/olmayan-id-123');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', true);
    });

    it('GET /users/:id - Sifre bilgisi donmemeli', async () => {
        const allUsers = await request(app).get('/users');
        const userId = allUsers.body[0].id;

        const response = await request(app).get(`/users/${userId}`);

        expect(response.body).not.toHaveProperty('password');
    });

    it('DELETE /users/:id - Kullanici silinebilmeli', async () => {
        const allUsers = await request(app).get('/users');
        const userId = allUsers.body[0].id;

        const response = await request(app).delete(`/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');

        const checkUser = await request(app).get(`/users/${userId}`);
        expect(checkUser.status).toBe(404);
    });

    it('DELETE /users/:id - Olmayan kullanici silinmeye calisilirsa 404 donmeli', async () => {
        const response = await request(app).delete('/users/olmayan-id-123');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', true);
    });
});
