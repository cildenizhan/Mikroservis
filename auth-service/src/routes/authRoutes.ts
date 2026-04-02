import { Router, Request, Response } from 'express';
import { UserModel } from '../models/UserModel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ error: true, message: 'username, email ve password alanlari zorunludur' });
            return;
        }

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            res.status(409).json({ error: true, message: 'Bu username zaten kullaniliyor' });
            return;
        }

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            res.status(409).json({ error: true, message: 'Bu email zaten kullaniliyor' });
            return;
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const newUser = new UserModel({
            id: crypto.randomUUID(),
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: true, message: 'username ve password alanlari zorunludur' });
            return;
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            res.status(401).json({ error: true, message: 'Gecersiz kullanici adi veya sifre' });
            return;
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
            res.status(401).json({ error: true, message: 'Gecersiz kullanici adi veya sifre' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env['JWT_SECRET'] || 'super_secret_dispatcher_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.get('/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.find({}, { _id: 0, password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const user = await UserModel.findOne({ id }, { _id: 0, password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user) {
            res.status(404).json({ error: true, message: 'Kullanici bulunamadi' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const user = await UserModel.findOneAndDelete({ id });
        if (!user) {
            res.status(404).json({ error: true, message: 'Kullanici bulunamadi' });
            return;
        }
        res.status(200).json({ message: `${user.username} kullanicisi silindi` });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

export default router;
