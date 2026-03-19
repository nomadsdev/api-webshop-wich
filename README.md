# Wichxshop Backend

โปรเจ็ค backend สำหรับร้านค้า Wichxshop พัฒนาด้วย Hono framework และ TypeScript

## วิธีติดตั้ง

### 1. ติดตั้ง dependencies
```bash
npm install
# หรือ
yarn install
```

### 2. สร้างไฟล์ environment
สร้างไฟล์ `.env` ในโฟลเดอร์ server และเพิ่มค่าต่อไปนี้:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/wichxshop
JWT_SECRET=your_jwt_secret_key_here
WICKXSHOP_API_KEY=your_wichxshop_api_key_here
```

### 3. เริ่มโปรแกรม
```bash
npm run dev
# หรือ
yarn dev
```

### 4. สำหรับ production
```bash
npm run build
npm start
```

## โครงสร้างโปรเจ็ค

```
server/
├── src/
│   ├── index.ts              # ไฟล์เริ่มต้นของ server
│   ├── lib/                  # ไลบรารีและฟังก์ชันต่างๆ
│   │   └── mongodb.js        # เชื่อมต่อ MongoDB
│   ├── middleware/           # middleware ต่างๆ
│   │   ├── auth.middleware.ts # middleware ตรวจสอบการเข้าสู่ระบบ
│   │   └── rate-limit.ts     # middleware จำกัดคำขอ
│   ├── models/               # โมเดล MongoDB
│   │   ├── User.ts           # โมเดลผู้ใช้
│   │   ├── Category.ts       # โมเดลหมวดหมู่สินค้า
│   │   ├── HiddenProduct.ts  # โมเดลสินค้าที่ซ่อน
│   │   ├── OrderHistory.ts   # โมเดลประวัติการสั่งซื้อ
│   │   ├── TopupHistory.ts   # โมเดลประวัติการเติมเงิน
│   │   ├── ClaimHistory.ts   # โมเดลประวัติการเคลมสินค้า
│   │   ├── Coupon.ts         # โมเดลคูปองเติมเงิน
│   │   ├── Notify.ts         # โมเดลประกาศ
│   │   ├── ImageSlide.ts     # โมเดลรูปภาพสไลด์
│   │   └── Status.ts         # โมเดลสถานะ
│   ├── routes/               # routes ต่างๆ
│   │   ├── auth.ts           # route การเข้าสู่ระบบ
│   │   ├── admin.ts          # route สำหรับผู้ดูแลระบบ
│   │   ├── profile.ts        # route จัดการโปรไฟล์ผู้ใช้
│   │   ├── topup.ts          # route การเติมเงิน
│   │   ├── status.ts         # route จัดการสถานะ
│   │   ├── notify.ts         # route จัดการประกาศ
│   │   ├── imageslide.ts     # route จัดการรูปภาพ
│   │   └── wichxshop/        # route สำหรับ Wichxshop API
│   │       ├── wichxshop.ts  # route หลัก Wichxshop
│   │       ├── category.ts   # route หมวดหมู่สินค้า
│   │       ├── product.ts    # route สินค้า
│   │       ├── buy.product.ts # route การซื้อสินค้า
│   │       ├── claim.ts      # route การเคลมสินค้า
│   │       ├── otp.netflix.ts # route Netflix OTP
│   │       ├── hidden.product.admin.ts # route จัดการสินค้าที่ซ่อน
│   │       ├── config.hidden.product.ts # route ตรวจสอบสถานะสินค้าที่ซ่อน
│   │       ├── rate.admin.ts # route จัดการเรทสินค้า
│   │       └── config.rate.ts # route คำนวณราคาสินค้า
│   └── services/             # บริการต่างๆ
├── package.json
└── README.md
```

## Dependencies หลัก

### Runtime Dependencies
- **hono** (v4.12.7) - Web framework สำหรับ TypeScript
- **@hono/node-server** (v1.19.11) - Node.js adapter สำหรับ Hono
- **mongoose** (v9.3.0) - MongoDB ODM
- **jsonwebtoken** (v9.0.3) - JWT token handling
- **bcrypt** (v6.0.0) - Password hashing
- **axios** (v1.13.6) - HTTP client
- **dotenv** (v17.3.1) - Environment variables
- **hono-rate-limit** (v1.0.2) - Rate limiting middleware
- **zod** (v4.3.6) - Schema validation
- **remove-comments-tool** (v1.0.3) - Comment removal utility

### Development Dependencies
- **typescript** (v5.8.3) - TypeScript compiler
- **tsx** (v4.7.1) - TypeScript execution
- **@types/node** (v20.11.17) - Node.js type definitions
- **@types/jsonwebtoken** (v9.0.10) - JWT type definitions
- **@types/bcrypt** (v6.0.0) - bcrypt type definitions

## API Endpoints

### Authentication
- `POST /auth/register` - สมัครสมาชิก
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/refresh` - รีเฟรช token

### User Management
- `GET /profile` - ดูข้อมูลโปรไฟล์
- `PUT /profile` - อัปเดตโปรไฟล์
- `GET /profile/history` - ดูประวัติ

### Products
- `GET /product/products` - ดูสินค้าทั้งหมด
- `GET /product/category/:slug` - ดูสินค้าตามหมวดหมู่
- `POST /product/buy` - ซื้อสินค้า
- `POST /product/claim` - เคลมสินค้า

### Admin
- `GET /admin/users` - จัดการผู้ใช้
- `GET /admin/hidden-products` - จัดการสินค้าที่ซ่อน
- `POST /admin/hidden-products` - ซ่อนสินค้า (หลายรายการ)
- `PUT /admin/hidden-products/:id/toggle` - เปลี่ยนสถานะสินค้าที่ซ่อน
- `DELETE /admin/hidden-products/:id` - ลบการซ่อนสินค้า

### Topup
- `POST /topup` - เติมเงิน
- `GET /topup/history` - ประวัติการเติมเงิน
- `POST /topup/coupon` - ใช้คูปองเติมเงิน

## ฟีเจอร์หลัก

- **ระบบสมาชิก**: สมัคร เข้าสู่ระบบ จัดการโปรไฟล์
- **ระบบสินค้า**: แสดงสินค้า หมวดหมู่ การซื้อขาย
- **ระบบการเงิน**: เติมเงิน คูปอง ประวัติการทำรายการ
- **ระบบเคลมสินค้า**: ยื่นเรื่องเคลม ติดตามสถานะ
- **ระบบผู้ดูแล**: จัดการผู้ใช้ สินค้าที่ซ่อน ประกาศ รูปภาพ
- **ระบบ Netflix OTP**: ดึงรหัส OTP สำหรับ Netflix
- **ระบบจัดการสถานะ**: จัดการสถานะต่างๆ ในระบบ
- **Rate Limiting**: ป้องกันการใช้งานมากเกินไป
- **Authentication**: JWT token authentication
- **Database Integration**: MongoDB สำหรับเก็บข้อมูล

## ข้อกำหนด

- Node.js 18 ขึ้นไป
- MongoDB 4.4 ขึ้นไป
- npm หรือ yarn

## Environment Variables

```
PORT=3001                              # พอร์ต server
MONGODB_URI=mongodb://localhost:27017/wichxshop  # การเชื่อมต่อ MongoDB
JWT_SECRET=your_jwt_secret_key_here    # คีย์สำหรับ JWT
WICKXSHOP_API_KEY=your_api_key_here    # API key สำหรับ Wichxshop
```

## การพัฒนา

โปรเจ็คนี้ใช้เทคโนโลยี:
- **Hono Framework** - Web framework ที่เร็วและมีประสิทธิภาพ
- **TypeScript** - พิมพ์ดี ปลอดภัย
- **MongoDB + Mongoose** - ฐานข้อมูล NoSQL
- **JWT** - Authentication token
- **Zod** - Schema validation
- **ES Modules** - Module system สมัยใหม่