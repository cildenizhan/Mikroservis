import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env['JWT_SECRET'] || 'super_secret_dispatcher_key';
export class AuthMiddleware {
    public static verifyToken(req: Request, res: Response, next: NextFunction): void {
        const path = req.path;
        if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register') || path.startsWith('/api/health') || path.startsWith('/api/system-status') || path.startsWith('/api/logs') || path === '/' || !path.startsWith('/api') || path.startsWith('/api/auth/health')) {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: true,
                message: 'Yetkilendirme hatasi: Token eksik veya gecersiz',
                path: req.originalUrl
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if(!token) {
            res.status(401).json({ error: true, message: 'Yetkilendirme hatasi: Token eksik' });
            return;
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            (req as any).user = decoded;
            next();
        } catch (error) {
            res.status(403).json({
                error: true,
                message: 'Yetkilendirme hatasi: Token gecersiz veya suresi dolmus'
            });
            return;
        }
    }
}
