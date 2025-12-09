import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Role } from './types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only!)
  await prisma.creditTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@webshop.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      creditBalance: 0,
    },
  });
  console.log('✅ Created admin user: admin@webshop.com / admin123');

  // Create customer users
  const customerPassword = await bcrypt.hash('customer123', 10);
  
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
        creditBalance: 500,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
        creditBalance: 1000,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
        creditBalance: 250,
      },
    }),
  ]);
  console.log('✅ Created 3 customer users (password: customer123)');

  // Create addresses for customers
  await Promise.all([
    prisma.address.create({
      data: {
        userId: customers[0].id,
        name: 'Alice Johnson',
        addressLine1: 'Nørrebrogade 52',
        addressLine2: '2. tv',
        city: 'København',
        postalCode: '2200',
        country: 'Denmark',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[0].id,
        name: 'Alice\'s Mom',
        addressLine1: 'Vestergade 15',
        city: 'Aarhus',
        postalCode: '8000',
        country: 'Denmark',
        isDefault: false,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[1].id,
        name: 'Bob Smith',
        addressLine1: 'Strandvejen 89',
        city: 'Hellerup',
        postalCode: '2900',
        country: 'Denmark',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[2].id,
        name: 'Charlie Brown',
        addressLine1: 'Gammeltorv 22',
        addressLine2: '1. sal',
        city: 'Odense',
        postalCode: '5000',
        country: 'Denmark',
        isDefault: true,
      },
    }),
  ]);
  console.log('✅ Created sample addresses');

  // Create initial credit transactions for customers
  for (const customer of customers) {
    await prisma.creditTransaction.create({
      data: {
        customerId: customer.id,
        amount: customer.creditBalance,
        type: 'REWARD',
        reason: 'Initial credit grant',
        createdByUserId: admin.id,
      },
    });
  }
  console.log('✅ Created initial credit transactions');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Godiva Premium Chocolate Collection',
        description: 'Luxurious assortment of Belgian chocolates in an elegant gold box. Perfect for celebrating or sharing with family.',
        imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
        priceInCredits: 150,
        stock: 50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Amazon Gift Card - $100',
        description: 'Digital Amazon gift card worth $100. Delivered instantly via email. Perfect for letting your loved ones choose their own gift.',
        imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400',
        priceInCredits: 200,
        stock: null, // Digital, unlimited
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Spa Day Gift Certificate',
        description: 'Full day spa package including massage, facial, and access to facilities. Valid at premium spa locations nationwide.',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
        priceInCredits: 500,
        stock: 25,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Starbucks Gift Card - $50',
        description: 'Physical Starbucks gift card loaded with $50. Perfect for coffee lovers or as a thoughtful gesture.',
        imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
        priceInCredits: 100,
        stock: 100,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Lindt Swiss Chocolate Gift Box',
        description: 'Premium Swiss chocolate assortment featuring Lindt\'s finest truffles and pralines. Beautifully packaged for gifting.',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        priceInCredits: 120,
        stock: 75,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Visa Prepaid Card - $250',
        description: 'Prepaid Visa card loaded with $250. Use anywhere Visa is accepted. Perfect for maximum flexibility.',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        priceInCredits: 500,
        stock: 30,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fine Dining Experience for Two',
        description: 'Gift certificate for an upscale dining experience at select partner restaurants. Includes appetizers, mains, and desserts.',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        priceInCredits: 400,
        stock: 20,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'LEGO Architecture Set',
        description: 'Premium LEGO Architecture building set. Great for display or family building time. Various iconic landmarks available.',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
        priceInCredits: 180,
        stock: 40,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wine & Cheese Gift Basket',
        description: 'Curated selection of premium wines, artisanal cheeses, and gourmet crackers in an elegant basket.',
        imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        priceInCredits: 300,
        stock: 35,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Apple AirPods Pro',
        description: 'Premium wireless earbuds with active noise cancellation. Perfect tech gift for yourself or family.',
        imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
        priceInCredits: 600,
        stock: 15,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Netflix Gift Card - 6 Months',
        description: 'Six months of Netflix Premium subscription. Perfect entertainment gift for the whole family.',
        imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
        priceInCredits: 180,
        stock: null, // Digital, unlimited
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Premium Golf Accessories Set',
        description: 'High-quality golf accessories including premium golf balls, tees, and microfiber towel in branded carrying case.',
        imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
        priceInCredits: 250,
        stock: 30,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created 12 products');

  // Get Alice's default address
  const aliceAddress = await prisma.address.findFirst({
    where: { userId: customers[0].id, isDefault: true },
  });

  // Create a sample order for Alice with shipping address
  const aliceOrder = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      totalCredits: 150,
      status: 'DELIVERED',
      shippingName: aliceAddress!.name,
      shippingAddressLine1: aliceAddress!.addressLine1,
      shippingAddressLine2: aliceAddress!.addressLine2,
      shippingCity: aliceAddress!.city,
      shippingState: aliceAddress!.state,
      shippingPostalCode: aliceAddress!.postalCode,
      shippingCountry: aliceAddress!.country,
      isGift: false,
      trackingNumber: 'TRACK123456789',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: aliceOrder.id,
      productId: products[0].id, // Godiva chocolates
      quantity: 1,
      priceInCreditsAtPurchase: 150,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      customerId: customers[0].id,
      amount: -150,
      type: 'PURCHASE',
      reason: 'Purchase: 1x Godiva Premium Chocolate Collection',
      relatedOrderId: aliceOrder.id,
    },
  });

  await prisma.user.update({
    where: { id: customers[0].id },
    data: { creditBalance: 350 }, // 500 - 150
  });

  console.log('✅ Created sample order for Alice');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 1 Admin user');
  console.log('  - 3 Customer users');
  console.log('  - 12 Products');
  console.log('  - 1 Sample order');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin: admin@webshop.com / admin123');
  console.log('  Customer 1: alice@example.com / customer123 (350 credits)');
  console.log('  Customer 2: bob@example.com / customer123 (1000 credits)');
  console.log('  Customer 3: charlie@example.com / customer123 (250 credits)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
