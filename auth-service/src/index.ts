import app from './server';

const PORT = Number(process.env['PORT']) || 3001;

app.listen(PORT, () => {
    console.log(`Auth servisi ${PORT} portunda calisiyor.`);
});
