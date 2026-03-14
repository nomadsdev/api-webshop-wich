import { Hono } from "hono";
import { z } from "zod";
import Status from "../models/Status.js";
import { auth, authAdmin } from "../middleware/auth.middleware.js";

const app = new Hono();

// Validation schemas
const createStatusSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().min(1).max(100),
  count: z.string().min(1).max(20),
  unit: z.string().min(1).max(20),
  order: z.number().min(1).max(4),
  isActive: z.boolean().optional()
});

const updateStatusSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  subtitle: z.string().min(1).max(100).optional(),
  count: z.string().min(1).max(20).optional(),
  unit: z.string().min(1).max(20).optional(),
  order: z.number().min(1).max(4).optional(),
  isActive: z.boolean().optional()
});

app.get('/', async (c) => {
  try {
    let statuses = await Status.find({ isActive: true })
      .sort({ order: 1 })
      .limit(4);

    if (statuses.length === 0) {
      const defaultStatuses = [
        {
          title: "ผู้ใช้งานเว็บไซต์เรา",
          subtitle: "Member in Website",
          count: "3.6k",
          unit: "คน",
          order: 1,
          isActive: true
        },
        {
          title: "ยอดรีวิวร้าน",
          subtitle: "Review",
          count: "1.7k",
          unit: "รีวิว",
          order: 2,
          isActive: true
        },
        {
          title: "API ที่พร้อมบริการ",
          subtitle: "Open API",
          count: "25",
          unit: "เส้นทาง",
          order: 3,
          isActive: true
        },
        {
          title: "โปรแกรม",
          subtitle: "Program",
          count: "634",
          unit: "ชิ้น",
          order: 4,
          isActive: true
        }
      ];

      await Status.insertMany(defaultStatuses);
      
      statuses = await Status.find({ isActive: true })
        .sort({ order: 1 })
        .limit(4);
    }

    return c.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('Get statuses error:', error);
    return c.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ'
    }, 500);
  }
});

// GET /status/all - ดึงข้อมูลสถิติทั้งหมดสำหรับ admin (authenticated users)
app.get('/all', auth, async (c) => {
  try {
    const statuses = await Status.find({})
      .sort({ order: 1 });

    return c.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('Get all statuses error:', error);
    return c.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ'
    }, 500);
  }
});

// POST /status - สร้างสถิติใหม่ (admin only)
app.post('/', auth, async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createStatusSchema.parse(body);

    // ตรวจสอบว่า order ไม่ซ้ำ
    const existingOrder = await Status.findOne({ order: validatedData.order });
    if (existingOrder) {
      return c.json({
        success: false,
        message: 'ลำดับนี้ถูกใช้งานแล้ว'
      }, 400);
    }

    const status = new Status({
      title: validatedData.title,
      subtitle: validatedData.subtitle,
      count: validatedData.count,
      unit: validatedData.unit,
      order: validatedData.order,
      isActive: validatedData.isActive ?? true
    });

    await status.save();

    return c.json({
      success: true,
      message: 'สร้างสถิติสำเร็จ',
      data: status
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        errors: error.issues
      }, 400);
    }
    console.error('Create status error:', error);
    return c.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างสถิติ'
    }, 500);
  }
});

// PUT /status/:id - อัปเดตสถิติ (admin only)
app.put('/:id', authAdmin, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateStatusSchema.parse(body);

    const status = await Status.findById(id);
    if (!status) {
      return c.json({
        success: false,
        message: 'ไม่พบสถิติที่ระบุ'
      }, 404);
    }

    // ตรวจสอบ order ซ้ำ (ถ้ามีการเปลี่ยน order)
    if (validatedData.order && validatedData.order !== status.order) {
      const existingOrder = await Status.findOne({
        order: validatedData.order,
        _id: { $ne: id }
      });
      if (existingOrder) {
        return c.json({
          success: false,
          message: 'ลำดับนี้ถูกใช้งานแล้ว'
        }, 400);
      }
    }

    Object.assign(status, validatedData);
    await status.save();

    return c.json({
      success: true,
      message: 'อัปเดตสถิติสำเร็จ',
      data: status
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        errors: error.issues
      }, 400);
    }
    console.error('Update status error:', error);
    return c.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถิติ'
    }, 500);
  }
});

// DELETE /status/:id - ลบสถิติ (admin only)
app.delete('/:id', authAdmin, async (c) => {
  try {
    const { id } = c.req.param();

    const status = await Status.findById(id);
    if (!status) {
      return c.json({
        success: false,
        message: 'ไม่พบสถิติที่ระบุ'
      }, 404);
    }

    await Status.findByIdAndDelete(id);

    return c.json({
      success: true,
      message: 'ลบสถิติสำเร็จ'
    });

  } catch (error) {
    console.error('Delete status error:', error);
    return c.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสถิติ'
    }, 500);
  }
});

export default app;
