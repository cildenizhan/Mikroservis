import { Router, Request, Response } from 'express';
import { OrderModel } from '../models/OrderModel.js';
import * as crypto from 'crypto';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await OrderModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId, userId, quantity, totalPrice } = req.body;

        if (!productId || !userId || quantity === undefined || totalPrice === undefined) {
            res.status(400).json({
                error: true,
                message: 'productId, userId, quantity ve totalPrice alanlari zorunludur'
            });
            return;
        }

        const newOrder = new OrderModel({
            id: crypto.randomUUID(),
            productId,
            userId,
            quantity,
            totalPrice,
            status: 'pending'
        });

        await newOrder.save();

        res.status(201).json({
            id: newOrder.id,
            productId: newOrder.productId,
            userId: newOrder.userId,
            quantity: newOrder.quantity,
            totalPrice: newOrder.totalPrice,
            status: newOrder.status
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const order = await OrderModel.findOne({ id }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

        if (!order) {
            res.status(404).json({
                error: true,
                message: 'Siparis bulunamadi'
            });
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const updates = req.body;
        
        if (updates.id) {
            delete updates.id;
        }

        const updatedOrder = await OrderModel.findOneAndUpdate({ id }, updates, { new: true, select: '-_id -__v -createdAt -updatedAt' });

        if (!updatedOrder) {
            res.status(404).json({
                error: true,
                message: 'Siparis bulunamadi'
            });
            return;
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const success = await OrderModel.findOneAndDelete({ id });

        if (!success) {
            res.status(404).json({
                error: true,
                message: 'Siparis bulunamadi'
            });
            return;
        }

        res.status(200).json({
            message: 'Siparis basariyla silindi'
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

export default router;
