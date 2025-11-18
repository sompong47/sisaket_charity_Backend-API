const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Google ID (ไม่ต้อง Required แล้ว เพราะคนใช้เบอร์โทรจะไม่มี)
  googleId: {
    type: String,
    unique: true,
    sparse: true // ✅ สำคัญ: ใส่ sparse เพื่อบอกว่า "ถ้าไม่มีค่านี้ (null) ไม่ต้องเช็คซ้ำ"
  },
  
  // 2. Email (ไม่ต้อง Required เผื่อคนใช้เบอร์โทรไม่ได้กรอก)
  email: {
    type: String,
    unique: true,
    sparse: true
  },

  // 3. ชื่อ (จำเป็นต้องมี)
  name: {
    type: String,
    required: true
  },

  picture: String,

  // 4. เบอร์โทร (เพิ่ม unique และ sparse)
  phone: {
    type: String,
    unique: true,
    sparse: true
  },

  // 5. ✅ เพิ่ม Password (สำหรับคนลงทะเบียนผ่านเว็บ)
  password: {
    type: String
  },

  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index ไม่ต้องประกาศซ้ำก็ได้ครับ เพราะใส่ unique: true ข้างบนแล้ว Mongoose จัดการให้
// userSchema.index({ googleId: 1 });
// userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);