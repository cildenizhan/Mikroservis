import app from './server.js';
import { connectDB } from './database/MongoDatabase.js';

const PORT = Number(process.env['PORT']) || 3002;
const MONGO_URI = process.env['MONGO_URI'] || 'mongodb://localhost:27017/product_db';

connectDB(MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`Product servisi ${PORT} portunda calisiyor.`);
    });
});
