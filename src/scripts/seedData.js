const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

const seedProducts = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    console.log('🌱 Seeding products...');
    
    const products = [
      {
        productCode: 'SSK243-001',
        name: 'เสื้อเฉลิมฉลองเมือง 243 ปี',
        description: 'เสื้อสู่ขวัญบ้าน บายศรีเมือง รุ่งเรือง 243 ปี จังหวัดศรีสะเกษ',
        price: 299,
        images: [
          {
            url: 'https://example.com/images/ssk243-front.jpg',
            alt: 'ด้านหน้า',
            isPrimary: true
          },
          {
            url: 'https://example.com/images/ssk243-back.jpg',
            alt: 'ด้านหลัง',
            isPrimary: false
          }
        ],
        sizes: [
          { size: 'S', stock: 100, available: true },
          { size: 'M', stock: 150, available: true },
          { size: 'L', stock: 120, available: true },
          { size: 'XL', stock: 80, available: true },
          { size: '2XL', stock: 50, available: true }
        ],
        isActive: true,
        category: 'charity-event',
        tags: ['ศรีสะเกษ', '243ปี', 'เฉลิมฉลอง', 'การกุศล']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products created successfully!`);
    
    createdProducts.forEach(product => {
      console.log(`   - ${product.productCode}: ${product.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedProducts();