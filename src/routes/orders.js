const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth'); // ✅ Middleware ตรวจ Token

// =================================================================
// 🟢 ส่วนของลูกค้า (Customer)
// =================================================================

// 1. ✅ GET: ดึงประวัติการสั่งซื้อของ "ฉัน" (ต้องวางไว้บนสุด)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // ใหม่ไปเก่า

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. ✅ POST: สร้างคำสั่งซื้อใหม่
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, customerName, phone } = req.body;

    // สร้างเลข Order อัตโนมัติ (เช่น SSK-170...-99)
    const orderNumber = 'SSK-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const order = await Order.create({
      user: req.user.id, // ผูกกับคนสั่ง
      orderNumber,
      customer: {
        name: customerName || req.user.name,
        phone: phone || req.user.phone,
      },
      items,
      totalAmount,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'สั่งซื้อสำเร็จ', data: order });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. ✅ PUT: แจ้งชำระเงิน (แนบสลิป) - เพิ่มใหม่!
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { slipImage, paymentDate, paymentTime } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อ' });
    }

    // ป้องกันคนอื่นมาเนียนแจ้งโอนออเดอร์เรา
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขออเดอร์นี้' });
    }

    // อัปเดตข้อมูลการจ่ายเงิน
    order.payment = {
      ...order.payment,
      slipUrl: slipImage, // รูป Base64
      paidAt: new Date(`${paymentDate}T${paymentTime}`),
      isPaid: true
    };

    // (Optional) จะเปลี่ยนสถานะเลยไหม หรือรอแอดมินกดเปลี่ยน
    // order.status = 'paid'; 

    await order.save();

    res.json({ success: true, data: order, message: 'แจ้งชำระเงินเรียบร้อย' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =================================================================
// 🔴 ส่วนของแอดมิน (Admin)
// =================================================================

// 4. ✅ GET: ดูออเดอร์ทั้งหมด (Admin Dashboard)
router.get('/', protect, async (req, res) => {
  try {
    // ถ้าจะล็อคให้เฉพาะ Admin เข้าได้ ให้เปิดคอมเมนต์นี้
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. ✅ PUT: อัปเดตสถานะ (Admin กดเปลี่ยนสถานะ) - เพิ่มใหม่!
router.put('/:id', protect, async (req, res) => {
  try {
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body, // รับค่า status ใหม่จากหน้าบ้าน
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 6. ✅ DELETE: ลบออเดอร์ (Admin กดลบ) - เพิ่มใหม่!
router.delete('/:id', protect, async (req, res) => {
  try {
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. ✅ GET: ดูออเดอร์รายตัว (วางไว้ล่างสุด เพราะ :id อาจไปชนกับ path อื่น)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อ' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;