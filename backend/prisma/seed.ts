import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing catalog data (idempotent) ────────
  console.log('  🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ─── Categories ──────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electrónica',
        slug: 'electronica',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Ropa',
        slug: 'ropa',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hogar',
        slug: 'hogar',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Deportes',
        slug: 'deportes',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066035b?w=400',
      },
    }),
  ]);

  console.log(`  ✅ ${categories.length} categorías creadas`);

  // ─── Products ────────────────────────────────────────
  const products: Prisma.ProductCreateInput[] = [
    {
      name: 'Auriculares Inalámbricos Pro',
      description: 'Auriculares Bluetooth con cancelación de ruido activa, 30h de batería y sonido envolvente.',
      price: 129.99,
      stock: 50,
      isActive: true,
      category: { connect: { id: categories[0].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', order: 0 },
          { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', order: 1 },
        ],
      },
      variants: {
        create: [
          { sku: 'AUR-PRO-BLK', color: 'Negro', stock: 20, priceAdjustment: 0, isActive: true },
          { sku: 'AUR-PRO-WHT', color: 'Blanco', stock: 30, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    {
      name: 'Smartwatch Galaxy',
      description: 'Reloj inteligente con GPS, monitor cardíaco, resistencia al agua y pantalla AMOLED.',
      price: 199.99,
      stock: 35,
      isActive: true,
      category: { connect: { id: categories[0].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'SW-GAL-44', size: '44mm', stock: 15, priceAdjustment: 0, isActive: true },
          { sku: 'SW-GAL-40', size: '40mm', stock: 20, priceAdjustment: -10, isActive: true },
        ],
      },
    },
    {
      name: 'Camiseta Deportiva DryFit',
      description: 'Camiseta transpirable de secado rápido, ideal para running y entrenamiento.',
      price: 24.99,
      stock: 100,
      isActive: true,
      category: { connect: { id: categories[1].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'TEE-DF-S-BLK', size: 'S', color: 'Negro', stock: 25, priceAdjustment: 0, isActive: true },
          { sku: 'TEE-DF-M-BLK', size: 'M', color: 'Negro', stock: 25, priceAdjustment: 0, isActive: true },
          { sku: 'TEE-DF-L-BLK', size: 'L', color: 'Negro', stock: 25, priceAdjustment: 0, isActive: true },
          { sku: 'TEE-DF-XL-BLK', size: 'XL', color: 'Negro', stock: 25, priceAdjustment: 2, isActive: true },
        ],
      },
    },
    {
      name: 'Lámpara LED Inteligente',
      description: 'Lámpara LED con control por app, 16 millones de colores y compatibilidad con asistente de voz.',
      price: 49.99,
      stock: 40,
      isActive: true,
      category: { connect: { id: categories[2].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'LMP-LED-STD', stock: 40, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    {
      name: 'Balón de Fútbol Profesional',
      description: 'Balón de fútbol tamaño 5 con costuras térmicas y superficie texturizada para mejor control.',
      price: 34.99,
      stock: 60,
      isActive: true,
      category: { connect: { id: categories[3].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'BAL-FUT-5', size: 'Talla 5', stock: 60, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    {
      name: 'Cargador Rápido USB-C 65W',
      description: 'Cargador de pared USB-C con carga rápida de 65W, compatible con la mayoría de dispositivos.',
      price: 39.99,
      stock: 80,
      isActive: true,
      category: { connect: { id: categories[0].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'CHR-USBC-65W', stock: 80, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    {
      name: 'Zapatillas Running Air',
      description: 'Zapatillas de running con amortiguación de aire, malla transpirable y suela antideslizante.',
      price: 79.99,
      stock: 45,
      isActive: true,
      category: { connect: { id: categories[1].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'ZAP-RUN-40', size: '40', color: 'Negro', stock: 5, priceAdjustment: 0, isActive: true },
          { sku: 'ZAP-RUN-41', size: '41', color: 'Negro', stock: 8, priceAdjustment: 0, isActive: true },
          { sku: 'ZAP-RUN-42', size: '42', color: 'Negro', stock: 10, priceAdjustment: 0, isActive: true },
          { sku: 'ZAP-RUN-43', size: '43', color: 'Negro', stock: 12, priceAdjustment: 0, isActive: true },
          { sku: 'ZAP-RUN-44', size: '44', color: 'Negro', stock: 10, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    {
      name: 'Set Sartenes Antiadherentes',
      description: 'Set de 3 sartenes antiadherentes con revestimiento cerámico, aptas para inducción.',
      price: 59.99,
      stock: 30,
      isActive: true,
      category: { connect: { id: categories[2].id } },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1584990347449-a8d317ee8e7f?w=600', order: 0 },
        ],
      },
      variants: {
        create: [
          { sku: 'SRT-SET-3', stock: 30, priceAdjustment: 0, isActive: true },
        ],
      },
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    console.log(`  ✅ Producto creado: ${created.name}`);
  }

  // ─── Demo User (upsert — idempotent) ────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@urukaisklick.com' },
    update: {},
    create: {
      email: 'demo@urukaisklick.com',
      password: hashedPassword,
      firstName: 'Usuario',
      lastName: 'Demo',
      role: 'CUSTOMER',
      phone: '622311428',
    },
  });

  console.log(`  ✅ Usuario demo creado: ${user.email}`);

  // ─── Admin User ──────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@urukaisklick.com' },
    update: {},
    create: {
      email: 'admin@urukaisklick.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Urukais',
      role: 'ADMIN',
    },
  });

  console.log(`  ✅ Usuario admin creado: ${admin.email}`);
  console.log('\n🎉 Seed completado!');
  console.log('   Demo: demo@urukaisklick.com / password123');
  console.log('   Admin: admin@urukaisklick.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
