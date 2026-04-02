import app from './server';

const PORT = Number(process.env['PORT']) || 3003;

app.listen(PORT, () => {
    console.log(`Order servisi ${PORT} portunda calisiyor.`);
});
