const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth'); // ✅ ต้องมีไฟล์นี้ (Middleware ตรวจ Token)

// ---------------------------------------------
// ✅ GET: ดึงประวัติการสั่งซื้อของ "ฉัน" (ต้องวางไว้บนสุด ก่อน /:id)
// ---------------------------------------------
router.get('/my-orders', protect, async (req, res) => {
  try {
    // ค้นหาออเดอร์ที่ user field ตรงกับ ID ของคนที่ล็อกอินอยู่
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // ใหม่ไปเก่า

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------
// POST: สร้างคำสั่งซื้อใหม่ (ต้อง Login ก่อน)
// ---------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, customerName, phone } = req.body;

    // สร้างเลข Order อัตโนมัติ (เช่น SSK-1700543...)
    const orderNumber = 'SSK-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const order = await Order.create({
      user: req.user.id, // ✅ ผูกกับคนที่ Login
      orderNumber,
      customer: {
        name: customerName || req.user.name,
        phone: phone || req.user.phone,
      },
      items,       // รับ array items จากหน้าบ้าน
      totalAmount, // รับยอดรวม
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'สั่งซื้อสำเร็จ',
      data: order
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------
// GET: ดูออเดอร์ตาม ID (สำหรับหน้ารายละเอียด)
// ---------------------------------------------
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อ' });
    }

    // ป้องกันไม่ให้ดูออเดอร์คนอื่น (ถ้าไม่ใช่ Admin)
    // if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' });
    // }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------
// GET: Admin ดูทั้งหมด (เอาไว้ทำหน้า Admin ทีหลัง)
// ---------------------------------------------
router.get('/', protect, async (req, res) => {
  try {
    // เช็ค Role admin ตรงนี้ได้ถ้าต้องการ
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;