const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // ✅ ใช้สำหรับเข้ารหัสรหัสผ่านมาตรฐาน (ถ้ายังไม่มี ให้ลง npm install bcryptjs)

// ----------------------------------------------------
// ✅ ส่วนที่เพิ่มใหม่: Register (ลงทะเบียนผ่านเบอร์โทร)
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // 1. เช็คว่าข้อมูลมาครบไหม
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // 2. เช็คว่าเบอร์นี้มีคนใช้ไปหรือยัง
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ success: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
    }

    // 3. เข้ารหัสรหัสผ่าน (เพื่อความปลอดภัย)
    // *หมายเหตุ: ถ้ายังไม่ได้ลง bcryptjs ให้คอมเมนต์บรรทัดนี้ แล้วใช้ hashedPassword = password แทน (แต่ไม่แนะนำ)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. สร้าง User ใหม่
    user = await User.create({
      name,
      phone,
      password: hashedPassword,
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
// ✅ ส่วนที่เพิ่มใหม่: Login (เข้าสู่ระบบผ่านเบอร์โทร)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. ค้นหา User จากเบอร์โทร
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ' });
    }

    // 2. ตรวจสอบรหัสผ่าน
    // ถ้าตอน Register เข้ารหัสไว้ ต้องใช้ bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // 3. อัปเดตเวลา Login ล่าสุด
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      // ส่งข้อมูลกลับไปหน้าบ้าน (Token/User info)
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role || 'user'
      },
      // ถ้าทำระบบ Token (JWT) ให้ส่ง token ตรงนี้ด้วย
      token: 'sample-token-fix-this-later' 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// ของเดิม (Google Login)
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