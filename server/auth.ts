import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase, AdminPermissions, DEFAULT_SUPER_ADMIN_PERMISSIONS } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fahim-pay-bd-super-secure-jwt-secret-key-2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  isSuperAdmin?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  adminPermissions?: AdminPermissions;
  isAdminSuper?: boolean;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies.fahimpay_token) {
    return req.cookies.fahimpay_token;
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'লগইন করা আবশ্যক (Unauthorized)' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'মেয়াদোত্তীর্ণ বা অবৈধ সেশন। পুনরায় লগইন করুন।' });
    return;
  }

  const db = getDatabase();
  const profile = db.profiles.find((p) => p.id === payload.userId);
  if (!profile) {
    res.status(401).json({ error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  if (profile.status === 'suspended') {
    res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' });
    return;
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'অ্যাডমিন অনুমোদন আবশ্যক।' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'অবৈধ অ্যাডমিন সেশন।' });
    return;
  }

  const db = getDatabase();
  const adminRole = db.user_roles.find((r) => r.userId === payload.userId && r.role === 'admin');
  if (!adminRole) {
    res.status(403).json({ error: 'অননুমোদিত অ্যাক্সেস। আপনি অ্যাডমিন নন।' });
    return;
  }

  req.user = payload;
  req.isAdminSuper = Boolean(adminRole.isSuperAdmin || payload.email.toLowerCase() === 'fahim236455@gmail.com');
  req.adminPermissions = req.isAdminSuper
    ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS }
    : { ...(adminRole.permissions || {}) } as AdminPermissions;

  next();
}

export function requirePermission(permission: keyof AdminPermissions) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAdmin(req, res, () => {
      if (req.isAdminSuper) {
        return next();
      }

      if (req.adminPermissions && req.adminPermissions[permission]) {
        return next();
      }

      res.status(403).json({
        error: `অননুমোদিত অ্যাকশন! আপনার কাছে এই সেকশন বা ফিচারের অ্যাক্সেস পারমিশন নেই। মূল অ্যাডমিনের সাথে যোগাযোগ করুন।`,
      });
    });
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const db = getDatabase();
      const profile = db.profiles.find((p) => p.id === payload.userId);
      if (profile && profile.status !== 'suspended') {
        req.user = payload;
      }
    }
  }
  next();
}


