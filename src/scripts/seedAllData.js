const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Setting = require('../models/setting');
const Admin = require('../models/admin');
const connectDB = require('../config/database');
require('dotenv').config();

const seedAllData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Setting.deleteMany({});
    await Admin.deleteMany({});

    console.log('🌱 Seeding data...\n');

    // 1. Seed Products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
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
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 2. Seed Settings
    console.log('\n⚙️  Creating settings...');
    const settings = await Setting.insertMany([
      {
        key: 'shipping_config',
        value: {
          firstItemFee: 50,
          additionalItemFee: 10,
          freeShippingThreshold: 2000,
          enableFreeShipping: false
        },
        description: 'ค่าจัดส่งสินค้า'
      },
      {
        key: 'event_info',
        value: {
          eventName: 'สู่ขวัญบ้าน บายศรีเมือง รุ่งเรือง 243 ปี',
          eventDate: new Date('2025-01-15'),
          organizer: 'หอการค้าจังหวัดศรีสะเกษ',
          isActive: true,
          salesStartDate: new Date('2024-10-01'),
          salesEndDate: new Date('2024-12-31')
        },
        description: 'ข้อมูลงาน'
      },
      {
        key: 'payment_methods',
        value: {
          promptpay: {
            enabled: true,
            number: '0812345678',
            name: 'หอการค้าจังหวัดศรีสะเกษ'
          },
          bank_transfer: {
            enabled: true,
            banks: [
              { name: 'ธนาคารกรุงไทย', account: '123-4-56789-0', branch: 'ศรีสะเกษ' }
            ]
          }
        },
        description: 'ช่องทางการชำระเงิน'
      }
    ]);
    console.log(`✅ Created ${settings.length} settings`);

    // 3. Seed Customers
    console.log('\n👥 Creating customers...');
    const customers = await Customer.insertMany([
      {
        phone: '0812345678',
        name: 'สมชาย ใจดี',
        email: 'somchai@email.com',
        addresses: [{
          label: 'บ้าน',
          isDefault: true,
          street: '123 หมู่ 5',
          subDistrict: 'เมืองศรีสะเกษ',
          district: 'เมืองศรีสะเกษ',
          province: 'ศรีสะเกษ',
          postalCode: '33000'
        }],
        statistics: {
          totalOrders: 2,
          totalSpent: 1196,
          lastOrderDate: new Date()
        }
      },
      {
        phone: '0898765432',
        name: 'สมหญิง รักษ์ดี',
        email: 'somying@email.com',
        addresses: [{
          label: 'บ้าน',
          isDefault: true,
          street: '456 หมู่ 2',
          subDistrict: 'หนองครก',
          district: 'เมืองศรีสะเกษ',
          province: 'ศรีสะเกษ',
          postalCode: '33000'
        }],
        statistics: {
          totalOrders: 1,
          totalSpent: 349,
          lastOrderDate: new Date()
        }
      }
    ]);
    console.log(`✅ Created ${customers.length} customers`);

    // 4. Seed Users
    console.log('\n🔐 Creating users...');
    const users = await User.insertMany([
      {
        googleId: 'google_123456789',
        email: 'user1@gmail.com',
        name: 'ผู้ใช้งาน 1',
        picture: 'https://via.placeholder.com/100',
        phone: '0812345678',
        lastLogin: new Date()
      },
      {
        googleId: 'google_987654321',
        email: 'user2@gmail.com',
        name: 'ผู้ใช้งาน 2',
        picture: 'https://via.placeholder.com/100',
        phone: '0898765432',
        lastLogin: new Date()
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 5. Seed Orders
    console.log('\n🛒 Creating orders...');
    const orders = await Order.insertMany([
      {
        orderNumber: 'SSK2024110001',
        customer: {
          name: 'สมชาย ใจดี',
          phone: '0812345678',
          email: 'somchai@email.com',
          googleId: 'google_123456789',
          address: {
            street: '123 หมู่ 5',
            subDistrict: 'เมืองศรีสะเกษ',
            district: 'เมืองศรีสะเกษ',
            province: 'ศรีสะเกษ',
            postalCode: '33000',
            fullAddress: '123 หมู่ 5 ต.เมืองศรีสะเกษ อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000'
          }
        },
        items: [{
          productId: products[0]._id,
          productName: 'เสื้อเฉลิมฉลองเมือง 243 ปี',
          size: 'L',
          quantity: 2,
          pricePerUnit: 299,
          subtotal: 598
        }],
        pricing: {
          subtotal: 598,
          shippingFee: 60,
          discount: 0,
          total: 658
        },
        shipping: {
          method: 'standard',
          firstItemFee: 50,
          additionalItemFee: 10,
          totalItems: 2
        },
        payment: {
          method: 'promptpay',
          status: 'paid',
          paidAt: new Date(),
          transactionId: 'TXN123456789'
        },
        status: 'confirmed',
        notes: 'ขอส่งเร็วด้วยครับ',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 86400000),
            updatedBy: 'customer'
          },
          {
            status: 'confirmed',
            timestamp: new Date(),
            updatedBy: 'admin',
            note: 'ตรวจสอบการชำระเงินแล้ว'
          }
        ]
      },
      {
        orderNumber: 'SSK2024110002',
        customer: {
          name: 'สมหญิง รักษ์ดี',
          phone: '0898765432',
          email: 'somying@email.com',
          googleId: 'google_987654321',
          address: {
            fullAddress: '456 หมู่ 2 ต.หนองครก อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000'
          }
        },
        items: [{
          productId: products[0]._id,
          productName: 'เสื้อเฉลิมฉลองเมือง 243 ปี',
          size: 'M',
          quantity: 1,
          pricePerUnit: 299,
          subtotal: 299
        }],
        pricing: {
          subtotal: 299,
          shippingFee: 50,
          discount: 0,
          total: 349
        },
        shipping: {
          method: 'standard',
          firstItemFee: 50,
          additionalItemFee: 10,
          totalItems: 1
        },
        payment: {
          method: 'bank_transfer',
          status: 'pending'
        },
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            updatedBy: 'customer'
          }
        ]
      }
    ]);
    console.log(`✅ Created ${orders.length} orders`);

    // 6. Seed Admins
    console.log('\n👨‍💼 Creating admins...');
    const admins = await Admin.insertMany([
      {
        username: 'admin',
        email: 'admin@sisaket-charity.net',
        passwordHash: '$2b$10$examplehash123456789', // ในการใช้งานจริงต้อง hash password
        profile: {
          name: 'ผู้ดูแลระบบ',
          phone: '0898765432',
          role: 'super_admin'
        },
        permissions: [
          'view_orders',
          'edit_orders',
          'view_products',
          'edit_products',
          'view_statistics',
          'manage_users',
          'manage_settings'
        ],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${admins.length} admins`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All data seeded successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Products:  ${products.length}`);
    console.log(`   Orders:    ${orders.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Users:     ${users.length}`);
    console.log(`   Settings:  ${settings.length}`);
    console.log(`   Admins:    ${admins.length}`);
    console.log('\n🔗 MongoDB Compass: mongodb://127.0.0.1:27017/sisaket_charity');
    console.log('🌐 API URL: http://localhost:3000/api\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedAllData();