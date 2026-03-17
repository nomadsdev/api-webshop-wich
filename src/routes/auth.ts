import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { JwtPayload } from 'jsonwebtoken';
import { connectDB } from '../lib/mongodb.js';
import { User, type IUser } from '../models/User.js';
import axios from 'axios';
import { authRateLimit } from '../middleware/rate.limit.js';

import "dotenv/config";

const authRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET as string;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY as string;

const verifyTurnstileToken = async (token: string): Promise<boolean> => {
  try {
    if (!TURNSTILE_SECRET_KEY) {
      console.warn('Turnstile secret key not configured, skipping verification');
      return true;
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      `secret=${encodeURIComponent(TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
};

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

authRoutes.post('/register', authRateLimit, async (c) => {
  try {
    await connectDB();
    
    const { username, email, phone, password, role = 0, turnstileToken } = await c.req.json();
    
    if (!username || !email || !password) {
      return c.json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน'
      }, 400);
    }

    if (!turnstileToken) {
      return c.json({
        success: false,
        message: 'กรุณายืนยันว่าคุณไม่ใช่บอท'
      }, 400);
    }

    const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
    if (!isValidTurnstile) {
      return c.json({
        success: false,
        message: 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่'
      }, 400);
    }
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return c.json({
        success: false,
        message: 'มีผู้ใช้งานนี้อีเมลหรือชื่อผู้ใช้นี้อยู่แล้ว'
      }, 400);
    }
    
    const user = new User({
      username,
      email,
      phone,
      password,
      role
    });
    
    await user.save();
    
    const token = generateToken(user);
    
    return c.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        points: user.points,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    return c.json({
      success: false,
      message: 'สมัครสมาชิกล้มเหลว'
    }, 500);
  }
});

authRoutes.post('/login', authRateLimit, async (c) => {
  try {
    await connectDB();
    
    const { username, password, turnstileToken } = await c.req.json();
    
    if (!username || !password) {
      return c.json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      }, 400);
    }

    if (!turnstileToken) {
      return c.json({
        success: false,
        message: 'กรุณายืนยันว่าคุณไม่ใช่บอท'
      }, 400);
    }

    const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
    if (!isValidTurnstile) {
      return c.json({
        success: false,
        message: 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่'
      }, 400);
    }
    
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!user) {
      return c.json({
        success: false,
        message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง'
      }, 401);
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return c.json({
        success: false,
        message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง'
      }, 401);
    }
    
    const token = generateToken(user);
    
    return c.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        points: user.points,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      message: 'เข้าสู่ระบบล้มเหลว'
    }, 500);
  }
});

authRoutes.get('/me', async (c) => {
  try {
    await connectDB();
    
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        message: 'ไม่พบโทเค็น'
      }, 401);
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return c.json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        points: user.points,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Me endpoint error:', error);
    return c.json({
      success: false,
      message: 'ดึงข้อมูลผู้ใช้ล้มเหลว'
    }, 500);
  }
});

export default authRoutes;