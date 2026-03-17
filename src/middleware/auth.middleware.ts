import jwt from "jsonwebtoken";
import type { Context, Next } from 'hono';
import { connectDB } from '../lib/mongodb.js';
import { User } from '../models/User.js';
import type { JwtPayload } from 'jsonwebtoken';

import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthContext extends Context {
  user?: {
    id: string;
    username: string;
    email: string;
    role: number;
    points: number;
  };
}

export const auth = async (c: AuthContext, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        message: 'ไม่พบโทเค็นหรือรูปแบบไม่ถูกต้อง'
      }, 401);
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (!decoded.id) {
      return c.json({
        success: false,
        message: 'โทเค็นไม่ถูกต้อง'
      }, 401);
    }
    
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return c.json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      }, 404);
    }
    
    c.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points
    };
    
    await next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({
        success: false,
        message: 'โทเค็นหมดอายุหรือไม่ถูกต้อง'
      }, 401);
    }
    
    return c.json({
      success: false,
      message: 'การตรวจสอบสิทธิ์ล้มเหลว'
    }, 500);
  }
};

export const authAdmin = async (c: AuthContext, next: Next) => {
  try {
    await auth(c, async () => {});
    
    if (!c.user) {
      return c.json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      }, 401);
    }
    
    if (c.user.role !== 1) {
      return c.json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึง ต้องการสิทธิ์ผู้ดูแลระบบ'
      }, 403);
    }
    
    await next();
    
  } catch (error) {
    console.error('AuthAdmin middleware error:', error);
    return c.json({
      success: false,
      message: 'การตรวจสอบสิทธิ์ผู้ดูแลระบบล้มเหลว'
    }, 500);
  }
};

export const getCurrentUser = (c: AuthContext) => {
  return c.user;
};

export const isAdmin = (c: AuthContext): boolean => {
  return c.user?.role === 1;
};

export const isSelfOrAdmin = (targetUserId: string, c: AuthContext): boolean => {
  return c.user?.id === targetUserId || c.user?.role === 1;
};