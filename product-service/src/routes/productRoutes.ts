import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel.js';
import crypto from 'crypto';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await ProductModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({
                error: true,
                message: 'name, price ve stock alanlari zorunludur'
            });
            return;
        }

        const newProduct = new ProductModel({
            id: crypto.randomUUID(),
            name,
            price,
            stock
        });

        await newProduct.save();

        res.status(201).json({
            id: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const product = await ProductModel.findOne({ id }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

        if (!product) {
            res.status(404).json({
                error: true,
                message: 'Urun bulunamadi'
            });
            return;
        }

        res.status(200).json(product);
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

        const updatedProduct = await ProductModel.findOneAndUpdate({ id }, updates, { new: true, select: '-_id -__v -createdAt -updatedAt' });

        if (!updatedProduct) {
            res.status(404).json({
                error: true,
                message: 'Urun bulunamadi'
            });
            return;
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
        const product = await ProductModel.findOneAndDelete({ id });

        if (!product) {
            res.status(404).json({
                error: true,
                message: 'Urun bulunamadi'
            });
            return;
        }

        res.status(200).json({
            message: 'Urun basariyla silindi'
        });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Sunucu hatasi' });
    }
});

export default router;
