require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');
};

const seedAdmin = async () => {
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existingAdmin) {
    console.log('Admin user already exists:', process.env.ADMIN_EMAIL);
    return existingAdmin;
  }

  const admin = await User.create({
    name: 'AR Gifts Admin',
    email: process.env.ADMIN_EMAIL || 'admin@argifts.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    phone: '9000000000',
  });

  console.log('Admin user created:', admin.email);
  return admin;
};

const seedProducts = async () => {
  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    console.log(`Products already seeded (${existingCount} found). Skipping...`);
    return;
  }

  const products = [
    {
      name: 'AR Birthday Greeting Card',
      description: 'A stunning AR-enabled birthday greeting card that comes alive with your personalized video message when scanned. Premium matte finish with vibrant colors. Perfect for birthdays, celebrations, and special occasions.',
      price: 299,
      category: 'greeting-card',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          publicId: 'sample/greeting-card-1',
        },
      ],
      features: [
        'AR-enabled video playback',
        'Premium matte finish',
        'A4 size (8.3 x 11.7 inches)',
        'Custom message printing',
        'QR code for AR scanning',
        'Eco-friendly materials',
      ],
      stock: 500,
      isActive: true,
    },
    {
      name: 'AR Anniversary Photo Frame',
      description: 'Elegant wooden photo frame with AR technology. Place your favorite photo and add a heartfelt video message that plays when the frame is scanned. Available in multiple sizes and finishes.',
      price: 899,
      category: 'photo-frame',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
          publicId: 'sample/photo-frame-1',
        },
      ],
      features: [
        'Premium wooden frame',
        'AR video on scan',
        '6x4 inch photo space',
        'Multiple finish options',
        'Landscape & portrait',
        'Gift ready packaging',
      ],
      stock: 200,
      isActive: true,
    },
    {
      name: 'AR Magic Mug',
      description: 'Start every morning with a magical experience. This premium ceramic mug displays your custom image and plays a personalized AR video when scanned. Microwave and dishwasher safe.',
      price: 599,
      category: 'mug',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
          publicId: 'sample/mug-1',
        },
      ],
      features: [
        '330ml premium ceramic',
        'Full wrap AR print',
        'Microwave safe',
        'Dishwasher safe',
        'High-definition printing',
        'Gift box included',
      ],
      stock: 300,
      isActive: true,
    },
    {
      name: 'AR Memory Keychain',
      description: 'Carry your most precious memories everywhere. This metal keychain features a custom photo with an embedded QR code that triggers a video message when scanned. Durable and compact.',
      price: 399,
      category: 'keychain',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1558618047-f4a91a3dc1c3?w=800',
          publicId: 'sample/keychain-1',
        },
      ],
      features: [
        'Premium metal finish',
        'AR QR code embedded',
        '4x4 cm photo space',
        'Durable epoxy coating',
        'Split ring attachment',
        'Velvet pouch included',
      ],
      stock: 400,
      isActive: true,
    },
    {
      name: 'AR LED Light Frame',
      description: 'Illuminate your space with this stunning LED photo frame that creates a magical AR experience. The edge-lit LED frame glows beautifully while the custom image plays a video when scanned.',
      price: 1499,
      category: 'led-frame',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
          publicId: 'sample/led-frame-1',
        },
      ],
      features: [
        'Edge-lit LED illumination',
        'AR video on scan',
        'USB powered',
        '3 brightness levels',
        '8x10 inch display',
        'Acrylic glass panel',
        'Remote control included',
      ],
      stock: 150,
      isActive: true,
    },
    {
      name: 'AR Wedding Card',
      description: 'Make your wedding invitations truly unforgettable. These premium AR wedding cards reveal your personal video message when scanned, creating a first impression your guests will never forget.',
      price: 1299,
      category: 'greeting-card',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
          publicId: 'sample/wedding-card-1',
        },
      ],
      features: [
        'Set of 10 cards',
        'AR video per card',
        'Premium ivory paper',
        'Gold foil accents',
        'Matching envelopes',
        'Custom wording',
      ],
      stock: 100,
      isActive: true,
      price: 1299,
    },
  ];

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
};

const seed = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedProducts();
    console.log('\n✅ Seeding completed successfully!');
    console.log(`\nAdmin Credentials:`);
    console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@argifts.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
