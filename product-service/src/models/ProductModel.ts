import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    id: string;
    name: string;
    price: number;
    stock: number;
}

const ProductSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true }
}, {
    timestamps: true
});

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
