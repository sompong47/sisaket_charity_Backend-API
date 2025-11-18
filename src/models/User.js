const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Google ID
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // 2. Email
  email: {
    type: String,
    unique: true,
    sparse: true
  },

  // 3. ชื่อ
  name: {
    type: String,
    required: true
  },

  picture: String,

  // 4. เบอร์โทร
  phone: {
    type: String,
    unique: true,
    sparse: true
  },

  // 5. Password
  password: {
    type: String
  },

  // 6. ✅ เพิ่ม Role (บทบาท)
  role: {
    type: String,
    enum: ['user', 'admin'], // ค่าที่เป็นไปได้
    default: 'user'          // สมัครใหม่เป็น user ก่อนเสมอ
  },

  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);