import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string; // Mongoose _id kullanır ama test uyumluluğu için sanal veya ek alan tutabiliriz
    username: string;
    email: string;
    password: string;
}

const UserSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
