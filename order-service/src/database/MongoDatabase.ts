import mongoose, { Document, Model, Schema } from 'mongoose';

export async function connectDB(uri: string) {
    try {
        await mongoose.connect(uri);
        console.log(`[MongoDatabase] DB baglantisi basarili.`);
    } catch (error) {
        console.error(`[MongoDatabase] Baglanti hatasi:`, error);
        process.exit(1);
    }
}
