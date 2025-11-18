const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth'); // ✅ 1. ต้องมีตัวตรวจ Token

// ==================================================
// 🟢 PUBLIC ROUTES (ใครก็ดูได้)
// ==================================================

// GET - ดูสินค้าทั้งหมด (เฉพาะที่เปิดขาย isActive: true)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================================================
// 🔴 ADMIN ROUTES (เฉพาะแอดมิน)
// ⚠️ สำคัญ: ต้องวางไว้ 'ก่อน' Route /:id ไม่งั้นระบบจะนึกว่า 'admin' เป็น ID
// ==================================================

// ✅ GET - ดูสินค้าทั้งหมด (รวมที่ปิดขายด้วย) -> แก้ 404 ตรงนี้
router.get('/admin/all', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================================================
// 🟡 ID SPECIFIC ROUTES (รับค่า ID)
// ==================================================

// GET - ดูสินค้าตาม ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - สร้างสินค้าใหม่ (ใส่ protect ด้วย เพื่อความปลอดภัย)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT - แก้ไขสินค้า (ใส่ protect)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE - ลบสินค้า (Hard delete หรือ Soft delete ตามต้องการ)
router.delete('/:id', protect, async (req, res) => {
  try {
    // ลบจริงๆ ออกจาก Database
    const product = await Product.findByIdAndDelete(req.params.id);
    
    // หรือถ้าจะ Soft delete (แค่ซ่อน) ให้ใช้แบบเดิม:
    // const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;