const mongoose = require('mongoose');
require('dotenv').config(); // โหลดค่าจาก .env (สำหรับตอนรันในเครื่อง)

const connectDB = async () => {
  try {
    // 1. เช็คก่อนว่ามี Link Database หรือยัง
    if (!process.env.MONGODB_URI) {
        throw new Error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    }

    // 2. เริ่มเชื่อมต่อ
    // (ไม่ต้องใส่ option พวก useNewUrlParser แล้วครับ Mongoose รุ่นใหม่จัดการให้เอง)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // ถ้าต่อ Database ไม่ได้ ให้ปิดโปรแกรมไปเลย (เพราะทำงานต่อก็พังอยู่ดี)
    process.exit(1);
  }
};

// Event Listeners ดักจับสถานะการเชื่อมต่อ
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected (การเชื่อมต่อหลุด)');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Runtime Error:', err);
});

module.exports = connectDB;