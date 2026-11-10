import crypto from 'crypto';
import { db } from './db';
import type { Request, Response, NextFunction } from 'express';

// Minimal HS256 JWT (no external dependency).
// Set JWT_SECRET in the environment; otherwise a random secret is generated at startup
// (all admin sessions are then invalidated on every server restart).
let SECRET = process.env.JWT_SECRET || '';
if (!SECRET) {
    SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  JWT_SECRET is not set - using a temporary secret. Set JWT_SECRET so admin sessions survive restarts.');
}

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface AdminTokenPayload {
    id: number;
    username: string;
    role: AdminRole;
    exp: number;
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');

const sign = (data: string) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

export function signAdminToken(admin: { id: number; username: string; role: AdminRole }): string {
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }));
    return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = Buffer.from(sign(`${header}.${payload}`));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AdminTokenPayload;
        if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
        return data;
    } catch {
        return null;
    }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) return res.status(401).json({ status: 'error', message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    try {
        // Re-check the DB so suspended/demoted/deleted admins lose access immediately
        const [rows] = await db.query('SELECT role, COALESCE(is_active, 1) AS is_active FROM admins WHERE id = ?', [payload.id]) as any;
        if (rows.length === 0 || !rows[0].is_active) {
            return res.status(401).json({ status: 'error', message: 'บัญชีนี้ไม่สามารถใช้งานได้' });
        }
        (req as any).admin = { ...payload, role: rows[0].role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN' };
        next();
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    if ((req as any).admin?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ status: 'error', message: 'ต้องเป็น Super Admin เท่านั้น' });
    }
    next();
}
