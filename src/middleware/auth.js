// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // 1. เช็คว่ามี Token ส่งมาใน Header ไหม
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. ถ้าไม่มี Token ให้ดีดออก
  if (!token) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
  }

  try {
    // 3. แกะ Token (Verify)
    // หมายเหตุ: 'secret' ควรตรงกับตอน Login (ปกติใช้ process.env.JWT_SECRET)
    // ถ้าตอน Login ไม่ได้ตั้ง key อะไรพิเศษ ให้ใช้ 'secret' ไปก่อนเพื่อทดสอบ
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // 4. หา User จาก ID ใน Token
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};