const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profile: {
    name: String,
    phone: String,
    role: {
      type: String,
      enum: ['admin', 'super_admin', 'staff'],
      default: 'admin'
    }
  },
  permissions: [String],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });

module.exports = mongoose.model('Admin', adminSchema);