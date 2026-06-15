import { PrismaClient, UserRole } from '../generated/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ebooks' },
      update: {},
      create: { name: 'Ebooks', slug: 'ebooks', icon: 'BookOpen', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'formations' },
      update: {},
      create: { name: 'Formations', slug: 'formations', icon: 'GraduationCap', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'templates' },
      update: {},
      create: { name: 'Templates', slug: 'templates', icon: 'Layout', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: { name: 'Audio', slug: 'audio', icon: 'Music', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'logiciels' },
      update: {},
      create: { name: 'Logiciels', slug: 'logiciels', icon: 'Code', sortOrder: 5 },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await argon2.hash('Admin@2025!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yourid.com' },
    update: {},
    create: {
      email: 'admin@yourid.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'YourID',
      username: 'admin',
      role: UserRole.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create demo seller
  const sellerPassword = await argon2.hash('Demo@2025!');
  const seller = await prisma.user.upsert({
    where: { email: 'demo@yourid.com' },
    update: {},
    create: {
      email: 'demo@yourid.com',
      password: sellerPassword,
      firstName: 'Kofi',
      lastName: 'Mensah',
      username: 'kofimensah',
      role: UserRole.SELLER,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Create demo store
  const store = await prisma.store.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      name: 'Digital Africa',
      slug: 'digitalafrica',
      description: 'Ressources digitales pour entrepreneurs africains',
      currency: 'XOF',
      country: 'SN',
      totalRevenue: 850000,
      totalSales: 127,
      balance: 125000,
    },
  });

  // Create demo products
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        storeId: store.id,
        categoryId: categories[0].id,
        type: 'EBOOK',
        status: 'PUBLISHED',
        title: 'Guide Ultime du E-Commerce en Afrique',
        slug: 'guide-ecommerce-afrique',
        description: 'Tout ce dont vous avez besoin pour lancer et développer votre boutique en ligne en Afrique.',
        price: 15000,
        currency: 'XOF',
        isMarketplace: true,
        totalSales: 45,
        rating: 4.8,
        reviewCount: 23,
      },
      {
        storeId: store.id,
        categoryId: categories[1].id,
        type: 'COURSE',
        status: 'PUBLISHED',
        title: 'Formation Complète Marketing Digital',
        slug: 'formation-marketing-digital',
        description: 'Maîtrisez les stratégies de marketing digital pour développer votre audience.',
        price: 35000,
        currency: 'XOF',
        isMarketplace: true,
        totalSales: 32,
        rating: 4.9,
        reviewCount: 18,
      },
      {
        storeId: store.id,
        categoryId: categories[2].id,
        type: 'TEMPLATE',
        status: 'PUBLISHED',
        title: 'Pack Templates Business Plan',
        slug: 'templates-business-plan',
        description: 'Collection de 20 templates professionnels pour votre business plan.',
        price: 8000,
        currency: 'XOF',
        isMarketplace: true,
        totalSales: 50,
        rating: 4.7,
        reviewCount: 31,
      },
    ],
  });

  console.log(`✅ Demo seller and products created`);
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Admin: admin@yourid.com / Admin@2025!');
  console.log('📧 Demo seller: demo@yourid.com / Demo@2025!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
