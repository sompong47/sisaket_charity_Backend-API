const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  sales: {
    totalOrders: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalShipping: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 }
  },
  products: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    quantitySold: Number,
    revenue: Number
  }],
  topSizes: [{
    size: String,
    count: Number
  }]
}, {
  timestamps: true
});

statisticSchema.index({ date: -1, type: 1 });

module.exports = mongoose.model('Statistic', statisticSchema);