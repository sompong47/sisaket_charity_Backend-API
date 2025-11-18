const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // ✅ เพิ่ม: ผูกกับ User ที่ Login (สำคัญมากสำหรับดูประวัติ)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },

  // ข้อมูลลูกค้า (เก็บแยกเผื่อกรณีที่อยู่ที่จัดส่งไม่ตรงกับที่อยู่บ้าน)
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: {
      fullAddress: String, // รับแบบง่ายๆ ไปก่อน
      postalCode: String
    }
  },

  // รายการสินค้า
  items: [{
    // productId ให้เป็น optional ไปก่อน (เผื่อระบบสินค้ายังไม่เสร็จ)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false 
    },
    productName: String,
    size: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number, // ปรับชื่อให้ตรงกับ Frontend (price)
    subtotal: Number
  }],

  // ยอดเงิน
  totalAmount: { type: Number, required: true }, // ปรับชื่อให้ตรงกับ Frontend

  // สถานะการจัดส่ง/ชำระเงิน
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  payment: {
    method: { type: String, default: 'promptpay' },
    slipUrl: String,
    isPaid: { type: Boolean, default: false }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index
orderSchema.index({ user: 1 }); // ค้นหาตาม user เร็วขึ้น
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);