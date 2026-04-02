import app from './server';

// Server instance exports app directly via "export default new Server().app;"
// But wait, the Server instance is created inside server.ts, but start() is never called!
// Let's call listen manually since app is an express instance.

const PORT = Number(process.env['PORT']) || 3000;

app.listen(PORT, () => {
    console.log(`Dispatcher servisi ${PORT} portunda calisiyor.`);
});
