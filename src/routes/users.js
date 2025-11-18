const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // ✅ 1. เรียกใช้ jwt เพื่อสร้าง Token

// ----------------------------------------------------
// Register (ลงทะเบียนผ่านเบอร์โทร)
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ success: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: 'user', // default role
      registerDate: new Date(),
      lastLogin: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

// ----------------------------------------------------
// ✅ Login (แก้ไขแล้ว: สร้าง Token จริง)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. ค้นหา User
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ' });
    }

    // 2. ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // 3. ✅ สร้าง Token ของจริง (สำคัญมาก!)
    // ใช้ secret key เดียวกับ middleware (ตั้งใน env หรือใช้ค่า default 'secret')
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '30d' }
    );

    // 4. อัปเดตเวลา Login ล่าสุด
    user.lastLogin = new Date();
    await user.save();

    // 5. ส่ง Token และข้อมูลกลับไป
    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: token, // 👈 ส่ง Token ที่ใช้งานได้จริงไปให้ Frontend
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Google Login (คงเดิม)
// ----------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    let user = await User.findOne({ googleId });

    if (user) {
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        lastLogin: new Date()
      });
    }

    // (Optional: ถ้าจะให้ Google Login เข้า Admin ได้ด้วย ต้องสร้าง Token ตรงนี้เหมือนกัน)
    // แต่ตอนนี้เอาแค่ Login ธรรมดาให้ผ่านก่อน
    res.json({
      success: true,
      message: 'User logged in successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ lastLogin: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;