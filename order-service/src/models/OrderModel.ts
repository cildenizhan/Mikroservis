import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    id: string;
    productId: string;
    userId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

const OrderSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
}, {
    timestamps: true
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
