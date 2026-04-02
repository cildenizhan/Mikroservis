import app from './server';

const PORT = Number(process.env['PORT']) || 3002;

app.listen(PORT, () => {
    console.log(`Product servisi ${PORT} portunda calisiyor.`);
});
