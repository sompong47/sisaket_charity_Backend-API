const mongoose = require('mongoose');

const paymentSlipSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: String,
  image: {
    url: String,
    uploadedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

paymentSlipSchema.index({ orderId: 1 });
paymentSlipSchema.index({ status: 1 });

module.exports = mongoose.model('PaymentSlip', paymentSlipSchema);