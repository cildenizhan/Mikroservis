import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/JsonDatabase';
import crypto from 'crypto';
import path from 'path';

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
}

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'products.json');
const productDb = new JsonDatabase<Product>(DB_PATH);

const router = Router();

router.get('/', (req: Request, res: Response): void => {
    const products = productDb.findAll();
    res.status(200).json(products);
});

router.post('/', (req: Request, res: Response): void => {
    const { name, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
        res.status(400).json({
            error: true,
            message: 'name, price ve stock alanlari zorunludur'
        });
        return;
    }

    const newProduct = productDb.create({
        id: crypto.randomUUID(),
        name,
        price,
        stock
    });

    res.status(201).json(newProduct);
});

router.get('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const product = productDb.findById(id);

    if (!product) {
        res.status(404).json({
            error: true,
            message: 'Urun bulunamadi'
        });
        return;
    }

    res.status(200).json(product);
});

router.put('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const updates = req.body;
    
    // Güvenlik: id'nin güncellenmesini engelle
    if (updates.id) {
        delete updates.id;
    }

    const updatedProduct = productDb.update(id, updates);

    if (!updatedProduct) {
        res.status(404).json({
            error: true,
            message: 'Urun bulunamadi'
        });
        return;
    }

    res.status(200).json(updatedProduct);
});

router.delete('/:id', (req: Request, res: Response): void => {
    const id = req.params['id'] as string;
    const success = productDb.delete(id);

    if (!success) {
        res.status(404).json({
            error: true,
            message: 'Urun bulunamadi'
        });
        return;
    }

    res.status(200).json({
        message: 'Urun basariyla silindi'
    });
});

export default router;
