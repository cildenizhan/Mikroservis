import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/JsonDatabase.js';
import crypto from 'crypto';
import path from 'path';

export interface Order {
    id: string;
    productId: string;
    userId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'orders.json');
const orderDb = new JsonDatabase<Order>(DB_PATH);

const router = Router();

router.get('/', (req: Request, res: Response): void => {
    const orders = orderDb.findAll();
    res.status(200).json(orders);
});

router.post('/', (req: Request, res: Response): void => {
    const { productId, userId, quantity, totalPrice } = req.body;

    if (!productId || !userId || quantity === undefined || totalPrice === undefined) {
        res.status(400).json({
            error: true,
            message: 'productId, userId, quantity ve totalPrice alanlari zorunludur'
        });
        return;
    }

    const newOrder = orderDb.create({
        id: crypto.randomUUID(),
        productId,
        userId,
        quantity,
        totalPrice,
        status: 'pending'
    });

    res.status(201).json(newOrder);
});

router.get('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const order = orderDb.findById(id);

    if (!order) {
        res.status(404).json({
            error: true,
            message: 'Siparis bulunamadi'
        });
        return;
    }

    res.status(200).json(order);
});

router.put('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const updates = req.body;
    
    if (updates.id) {
        delete updates.id;
    }

    const updatedOrder = orderDb.update(id, updates);

    if (!updatedOrder) {
        res.status(404).json({
            error: true,
            message: 'Siparis bulunamadi'
        });
        return;
    }

    res.status(200).json(updatedOrder);
});

router.delete('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const success = orderDb.delete(id);

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
});

export default router;
