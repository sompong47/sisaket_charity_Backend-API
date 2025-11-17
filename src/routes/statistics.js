const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// GET - สรุปสถิติทั้งหมด
router.get('/summary', async (req, res) => {
  try {
    // นับจำนวนสินค้า
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // นับจำนวนคำสั่งซื้อ
    const totalOrders = await Order.countDocuments();
    
    // นับจำนวนลูกค้า
    const totalCustomers = await Customer.countDocuments();
    
    // คำนวณยอดขายรวม
    const orders = await Order.find({ 
      'payment.status': 'paid',
      status: { $ne: 'cancelled' }
    });
    
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.pricing?.total || 0);
    }, 0);
    
    const totalItems = orders.reduce((sum, order) => {
      return sum + (order.shipping?.totalItems || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        totalItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - สถิติยอดขายตามวัน
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: today },
      'payment.status': 'paid'
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, order) => sum + order.shipping.totalItems, 0);

    res.json({
      success: true,
      data: {
        date: today,
        totalOrders,
        totalItems,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - สินค้าขายดี
router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.productCode',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - สถิติตามไซส์
router.get('/sizes', async (req, res) => {
  try {
    const sizeStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.size',
          count: { $sum: '$items.quantity' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: sizeStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;