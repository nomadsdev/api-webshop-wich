# SafeZone WichShop Server

ระบบ Server สำหรับร้าน WichShop โดย SafeZone Dev

## ระบบที่รองรับ

- **ระบบสมาชิก** (ล็อกอิน/สมัครสมาชิก)
- **ระบบสินค้า** (จัดการสินค้า WichX)
- **ระบบเติมเงิน** (ตรวจสอบสลิป/TrueMoney Gift)
- **ระบบจัดการ** (Admin Panel)
- **ระบบโปรไฟล์** (จัดการข้อมูลผู้ใช้)
- **ระบบแจ้งเตือน** (Notifications)

## ความต้องการพื้นฐาน

- Node.js 18.x ขึ้นไป
- MongoDB
- npm หรือ yarn

## การติดตั้ง

### 1. ดาวน์โหลดโครงการ
```bash
ดาวโหลดโปรเจคนี้จากลิ้งค์หรือช่องทางผู้พัฒนาส่งให้คุณ
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก และตั้งค่าดังนี้:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wichshop

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# SlipOK API (สำหรับตรวจสอบสลิป)
SLIPOK_API_KEY=your_slipok_api_key
SLIPOK_BRANCH_ID=your_slipok_branch_id

# ข้อมูลบัญชีรับเงิน
RECEIVE_PHONE=0987654321
RECEIVE_ACCOUNT=1234567890
RECEIVE_NAME_TH=ชื่อบัญชีภาษาไทย
RECEIVE_NAME_EN=Account Name English

# WichX Shop API
WICKXSHOP_API_KEY=your_wichxshop_api_key

# Phone Number (สำหรับ QR Code)
PHONE_NUMBER_RECEIVE=0987654321

# อื่นๆ
NODE_ENV=development
PORT=5000
```

### 4. เชื่อมต่อฐานข้อมูล

ตรวจสอบให้แน่ใจว่า MongoDB ทำงานอยู่:
```bash
# สำหรับ MongoDB แบบ Local
mongod

# หรือ MongoDB Atlas
# ใช้ Connection String จาก MongoDB Atlas ใน MONGODB_URI
```

## การใช้งาน

### การเริ่ม Server (โหมด Development)
```bash
npm run dev
```

### การ Build สำหรับ Production
```bash
npm run build
```

### การเริ่ม Server (โหมด Production)
```bash
npm start
```

Server จะทำงานที่: `http://localhost:5000`

## API Endpoints หลัก

### ระบบสมาชิก (`/api/v1/auth`)
- `POST /register` - สมัครสมาชิก
- `POST /login` - เข้าสู่ระบบ
- `GET /me` - ดูข้อมูลตัวเอง

### ระบบสินค้า (`/api/v1/product`)
- `GET /products` - ดูสินค้าทั้งหมด
- `GET /products/:id` - ดูรายละเอียดสินค้า
- `POST /buy` - ซื้อสินค้า

### ระบบเติมเงิน (`/api/v1/topup`)
- `GET /generate-qr/:amount` - สร้าง QR Code
- `POST /verify-slip` - ตรวจสอบสลิป
- `POST /truemoney-gift` - เติมเงิน TrueMoney Gift
- `GET /history` - ประวัติการเติมเงิน

### ระบบจัดการ (`/api/v1/admin`)
- `GET /users` - ดูผู้ใช้ทั้งหมด
- `POST /admin/add-points` - เพิ่มแต้มผู้ใช้
- `GET /topup/history` - ประวัติการเติมเงินทั้งหมด

## โครงสร้างโฟลเดอร์

```
server/
├── src/
│   ├── routes/          # API Routes
│   │   ├── auth.js      # ระบบสมาชิก
│   │   ├── topup.js     # ระบบเติมเงิน
│   │   ├── wichxshop/   # ระบบสินค้า WichX
│   │   └── admin.js     # ระบบจัดการ
│   ├── models/          # MongoDB Models
│   ├── lib/             # Library ต่างๆ
│   └── middleware/      # Middleware
├── public/              # Static Files
├── docs/               # Documentation
└── package.json
```

## การตั้งค่าเพิ่มเติม

### การเปลี่ยน Port
แก้ไขใน `.env`:
```env
PORT=3000
```

### การเปิด CORS
CORS ถูกเปิดไว้สำหรับทุก route แล้ว สามารถแก้ไขได้ใน `src/index.ts`

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Database Connection Error**
   - ตรวจสอบ MongoDB ทำงานอยู่หรือไม่
   - ตรวจสอบ MONGODB_URI ใน `.env`

2. **JWT Secret Error**
   - ตั้งค่า JWT_SECRET ใน `.env`

3. **SlipOK API Error**
   - ตรวจสอบ SLIPOK_API_KEY และ SLIPOK_BRANCH_ID

4. **Port ใช้งานไม่ได้**
   - เปลี่ยน port ใน `src/index.ts`
   - ตรวจสอบว่า port ไม่ถูกใช้งานโดยโปรแกรมอื่น

## การติดต่อสนับสนุน

- **Discord:** SafeZone Dev - https://discord.gg/kUpfn9Ujpm
- **ร้าน:** SafeZone Dev

## License

สงวนลิขสิทธิ์โดย SafeZone Dev