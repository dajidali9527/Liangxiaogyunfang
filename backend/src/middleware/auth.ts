import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'yunfang-jwt-secret-2026';
export interface AuthPayload {
  userId: string;
  role: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    _res.status(401).json({ error: '未登录' });
    return;
  }
  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    _res.status(401).json({ error: '登录已过期' });
  }
}
export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    _res.status(403).json({ error: '需要管理员权限' });
    return;
  }
  next();
}
