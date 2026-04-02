import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/JsonDatabase';
import crypto from 'crypto';
import path from 'path';

interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');
const userDb = new JsonDatabase<User>(DB_PATH);

const router = Router();

router.post('/register', (req: Request, res: Response): void => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({
            error: true,
            message: 'username, email ve password alanlari zorunludur'
        });
        return;
    }

    const existingUsers = userDb.findAll();
    const usernameExists = existingUsers.find(u => u.username === username);
    if (usernameExists) {
        res.status(409).json({
            error: true,
            message: 'Bu username zaten kullaniliyor'
        });
        return;
    }

    const emailExists = existingUsers.find(u => u.email === email);
    if (emailExists) {
        res.status(409).json({
            error: true,
            message: 'Bu email zaten kullaniliyor'
        });
        return;
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = userDb.create({
        id: crypto.randomUUID(),
        username,
        email,
        password: hashedPassword
    });

    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    });
});

router.post('/login', (req: Request, res: Response): void => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({
            error: true,
            message: 'username ve password alanlari zorunludur'
        });
        return;
    }

    const users = userDb.findAll();
    const user = users.find(u => u.username === username);

    if (!user) {
        res.status(401).json({
            error: true,
            message: 'Gecersiz kullanici adi veya sifre'
        });
        return;
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
        res.status(401).json({
            error: true,
            message: 'Gecersiz kullanici adi veya sifre'
        });
        return;
    }

    const token = crypto.randomBytes(32).toString('hex');

    res.status(200).json({
        token,
        username: user.username,
        email: user.email
    });
});

router.get('/users', (req: Request, res: Response): void => {
    const users = userDb.findAll().map(({ password, ...rest }) => rest);
    res.status(200).json(users);
});

router.get('/users/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const user = userDb.findById(id);

    if (!user) {
        res.status(404).json({
            error: true,
            message: 'Kullanici bulunamadi'
        });
        return;
    }

    const { password, ...safeUser } = user;
    res.status(200).json(safeUser);
});

router.delete('/users/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const user = userDb.findById(id);

    if (!user) {
        res.status(404).json({
            error: true,
            message: 'Kullanici bulunamadi'
        });
        return;
    }

    userDb.delete(id);
    res.status(200).json({
        message: `${user.username} kullanicisi silindi`
    });
});

export default router;
