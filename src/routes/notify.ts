import { Hono } from "hono";
import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb.js";
import { Notify } from "../models/Notify.js";
import { auth, authAdmin, type AuthContext } from "../middleware/auth.middleware.js";

const router = new Hono();

router.get("/", async (c) => {
  try {
    await connectDB();
    
    const { page = "1", limit = "10", type } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query: any = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notify.find(query)
      .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-viewCount');
    
    const total = await Notify.countDocuments(query);
    
    return c.json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return c.json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ" 
    }, 500);
  }
});

router.get("/admin", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    const { page = "1", limit = "10", search, type, priority } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const notifications = await Notify.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Notify.countDocuments(query);
    
    return c.json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    console.error("Get admin notifications error:", error);
    return c.json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ" 
    }, 500);
  }
});

router.get("/admin/stats", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    const stats = await Promise.all([
      Notify.countDocuments({ isActive: true }),
      Notify.countDocuments({ isActive: false }),
      Notify.countDocuments({ isPinned: true, isActive: true }),
      Notify.countDocuments({ type: 'news', isActive: true }),
      Notify.countDocuments({ type: 'blog', isActive: true }),
      Notify.countDocuments({ type: 'announcement', isActive: true }),
      Notify.countDocuments({ type: 'maintenance', isActive: true })
    ]);
    
    const [
      totalActive,
      totalInactive,
      totalPinned,
      totalNews,
      totalBlog,
      totalAnnouncement,
      totalMaintenance
    ] = stats;
    
    return c.json({
      success: true,
      message: "ดึงข้อมูลสถิติประกาศสำเร็จ",
      data: {
        totalActive,
        totalInactive,
        totalPinned,
        byType: {
          news: totalNews,
          blog: totalBlog,
          announcement: totalAnnouncement,
          maintenance: totalMaintenance
        }
      }
    });
    
  } catch (error: any) {
    console.error("Get notification stats error:", error);
    return c.json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" 
    }, 500);
  }
});

router.post("/admin", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    const { title, content, type, priority, imageUrl, link, tags, publishedAt } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ 
        success: false,
        message: "กรุณากรอกชื่อและเนื้อหาประกาศ" 
      }, 400);
    }
    
    const newNotification = new Notify({
      title,
      content,
      type: type || 'news',
      priority: priority || 'medium',
      imageUrl,
      link,
      tags: tags || [],
      isActive: true,
      isPinned: false,
      viewCount: 0,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    });
    
    await newNotification.save();
    
    return c.json({
      success: true,
      message: "สร้างประกาศสำเร็จ",
      data: newNotification
    });
    
  } catch (error: any) {
    console.error("Create notification error:", error);
    return c.json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างประกาศ" 
    }, 500);
  }
});

router.put("/admin/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    const notificationId = c.req.param("id");
    
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return c.json({ 
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง" 
      }, 400);
    }
    
    const { title, content, type, priority, isActive, isPinned, imageUrl, link, tags, publishedAt } = await c.req.json();
    
    const notification = await Notify.findByIdAndUpdate(
      notificationId,
      { 
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
        ...(isPinned !== undefined && { isPinned }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(link !== undefined && { link }),
        ...(tags !== undefined && { tags }),
        ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) })
      },
      { new: true }
    );
    
    if (!notification) {
      return c.json({ 
        success: false,
        message: "ไม่พบประกาศ" 
      }, 404);
    }
    
    return c.json({
      success: true,
      message: "อัปเดตประกาศสำเร็จ",
      data: notification
    });
    
  } catch (error: any) {
    console.error("Update notification error:", error);
    return c.json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตประกาศ" 
    }, 500);
  }
});

router.delete("/admin/:id", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    const notificationId = c.req.param("id");
    
    // Validate ObjectId
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return c.json({ 
        success: false,
        message: "รหัสประกาศไม่ถูกต้อง" 
      }, 400);
    }
    
    const notification = await Notify.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return c.json({ 
        success: false,
        message: "ไม่พบประกาศ" 
      }, 404);
    }
    
    return c.json({
      success: true,
      message: "ลบประกาศสำเร็จ"
    });
    
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return c.json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการลบประกาศ" 
    }, 500);
  }
});

// ==================== DYNAMIC ROUTES (MUST BE LAST) ====================

// Get single notification (public) - increment view count
// This route MUST be last to avoid conflicts with specific routes
router.get("/:id", async (c) => {
  try {
    await connectDB();
    
    const notificationId = c.req.param("id");
    
    // Validate ObjectId
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return c.json({ 
        success: false, 
        message: "รหัสประกาศไม่ถูกต้อง" 
      }, 400);
    }
    
    const notification = await Notify.findByIdAndUpdate(
      notificationId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!notification || !notification.isActive) {
      return c.json({ 
        success: false, 
        message: "ไม่พบประกาศ" 
      }, 404);
    }
    
    return c.json({
      success: true,
      message: "ดึงข้อมูลประกาศสำเร็จ",
      data: notification
    });
    
  } catch (error: any) {
    console.error("Get notification error:", error);
    return c.json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ" 
    }, 500);
  }
});

export default router;