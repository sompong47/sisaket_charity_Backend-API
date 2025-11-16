const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');

// Import routes
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const customerRoutes = require('./src/routes/customers');
const userRoutes = require('./src/routes/users');
const settingRoutes = require('./src/routes/settings');
const statisticRoutes = require('./src/routes/statistics');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/statistics', statisticRoutes);

// Root route - serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    message: '🎉 Sisaket Charity API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      users: '/api/users',
      settings: '/api/settings',
      statistics: '/api/statistics'
    },
    documentation: 'http://localhost:3000/api/docs'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Connected'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Dashboard: http://localhost:${PORT}/`);
  console.log(`📊 API Info: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log('='.repeat(50));
});