const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // ✅ เพิ่ม Security

// ==================================================================
// 🟢 PUBLIC: สถิติสำหรับโชว์หน้าแรก (ไม่ต้อง Login)
// ==================================================================
router.get('/public', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const soldStats = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } }
    ]);
    const totalShirtsSold = soldStats.length > 0 ? soldStats[0].totalSold : 0;

    const products = await Product.find({ isActive: true });
    const inventory = products.map(p => {
        const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
        return {
            id: p._id,
            name: p.name,
            image: p.images[0]?.url || '',
            totalStock: totalStock,
            sizes: p.sizes.map(s => ({ size: s.size, count: s.stock }))
        };
    });

    res.json({ success: true, data: { totalOrders, totalShirtsSold, inventory } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================================================================
// 🔴 ADMIN: สถิติเชิงลึก (ต้อง Login)
// ==================================================================

// 1. สรุปภาพรวม (Summary)
router.get('/summary', protect, async (req, res) => {
  try {
    // นับจำนวนสินค้า
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // นับจำนวนคำสั่งซื้อ
    const totalOrders = await Order.countDocuments();
    
    // นับจำนวนสมาชิก (User)
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // คำนวณยอดขายรวม (เฉพาะที่จ่ายเงินแล้ว)
    // หมายเหตุ: ปรับ status ตามที่ใช้จริง เช่น 'paid', 'shipped', 'completed'
    const paidOrders = await Order.find({ 
      status: { $in: ['paid', 'shipped', 'completed'] } 
    });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // นับจำนวนชิ้นที่ขายได้ (เฉพาะที่จ่ายเงินแล้ว)
    const totalItemsSold = paidOrders.reduce((sum, order) => {
      const orderQty = order.items.reduce((iSum, item) => iSum + item.quantity, 0);
      return sum + orderQty;
    }, 0);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        totalItemsSold
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. สถิติยอดขายวันนี้ (Daily)
router.get('/daily', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: today },
      // นับทุกออเดอร์ หรือเฉพาะที่จ่ายแล้วก็ได้ (อันนี้นับที่จ่ายแล้ว)
      status: { $in: ['paid', 'shipped', 'completed'] }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, order) => {
        return sum + order.items.reduce((iSum, item) => iSum + item.quantity, 0);
    }, 0);

    res.json({
      success: true,
      data: {
        date: today,
        totalOrders,
        totalItems,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. สินค้าขายดี (Top Products)
router.get('/top-products', protect, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      // กรองเฉพาะออเดอร์ที่ไม่ถูกยกเลิก
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.productName', // Group ตามชื่อสินค้า
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          // คำนวณยอดขายรายตัว (ราคา x จำนวน)
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. สถิติตามไซซ์ (Sizes)
router.get('/sizes', protect, async (req, res) => {
  try {
    const sizeStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.size',
          count: { $sum: '$items.quantity' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: sizeStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;