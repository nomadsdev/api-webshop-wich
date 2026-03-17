import { Hono } from "hono";
import { connectDB } from "../../lib/mongodb.js";
import { User } from "../../models/User.js";
import { OrderHistory } from "../../models/OrderHistory.js";
import { TopupHistory } from "../../models/TopupHistory.js";
import { auth, authAdmin, type AuthContext } from "../../middleware/auth.middleware.js";

const router = new Hono();

router.get("/admin/overview", auth, authAdmin, async (c: AuthContext) => {
  try {
    await connectDB();
    
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 1 });
    const totalRegularUsers = totalUsers - totalAdmins;
    
    // Get order statistics
    const totalOrders = await OrderHistory.countDocuments();
    const successfulOrders = await OrderHistory.countDocuments({ status: "success" });
    const failedOrders = await OrderHistory.countDocuments({ status: "failed" });
    const pendingOrders = await OrderHistory.countDocuments({ status: "pending" });
    
    // Get topup statistics
    const totalTopups = await TopupHistory.countDocuments();
    const successfulTopups = await TopupHistory.countDocuments({ status: "success" });
    const failedTopups = await TopupHistory.countDocuments({ status: "failed" });
    const pendingTopups = await TopupHistory.countDocuments({ status: "pending" });
    
    // Get revenue statistics
    const totalRevenue = await OrderHistory.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    
    const totalPointsAdded = await TopupHistory.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$pointsAdded" } } }
    ]);
    
    // Get recent activities
    const recentOrders = await OrderHistory.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentTopups = await TopupHistory.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentUsers = await User.find()
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await OrderHistory.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, "$totalPrice", 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const monthlyTopups = await TopupHistory.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          points: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, "$pointsAdded", 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get top products
    const topProducts = await OrderHistory.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$productName",
          count: { $sum: "$quantity" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return c.json({
      status: "success",
      message: "ดึงข้อมูลภาพรวมสำเร็จ",
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          regularUsers: totalRegularUsers
        },
        orders: {
          total: totalOrders,
          successful: successfulOrders,
          failed: failedOrders,
          pending: pendingOrders
        },
        topups: {
          total: totalTopups,
          successful: successfulTopups,
          failed: failedTopups,
          pending: pendingTopups
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          totalPointsAdded: totalPointsAdded[0]?.total || 0
        },
        recent: {
          orders: recentOrders,
          topups: recentTopups,
          users: recentUsers
        },
        monthly: {
          orders: monthlyOrders,
          topups: monthlyTopups
        },
        topProducts
      }
    });
    
  } catch (error: any) {
    console.error("Get overview error:", error);
    return c.json({ 
      status: "error", 
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวม" 
    }, 500);
  }
});

export default router;