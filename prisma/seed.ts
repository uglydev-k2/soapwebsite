import { PrismaClient, OrderStatus, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Blush Rose Artisan Bar",
    slug: "blush-rose-artisan-bar",
    description:
      "A hand-poured bar with soft rose clay and creamy coconut lather. Gentle enough for daily use, luxurious enough for evening ritual.",
    price: 16,
    category: Category.SOAP,
    stock: 52,
    fragrance: "Soft Rose & Petal",
    featured: true,
    images: ["/images/products/blush-rose-bar.jpg"],
    ingredients:
      "Saponified coconut & olive oils, rose kaolin clay, shea butter, geranium & rose absolute",
  },
  {
    name: "Botanical Swirl Bar",
    slug: "botanical-swirl-bar",
    description:
      "Marbled sage and deep blue swirls over a sunny botanical base. Small-batch poured for a rich, silky cleanse with forest-fresh scent.",
    price: 18,
    category: Category.SOAP,
    stock: 38,
    fragrance: "Forest & Eucalyptus",
    featured: true,
    images: ["/images/products/botanical-swirl-bar.jpg"],
    ingredients:
      "Coconut oil, olive oil, spirulina & indigo botanicals, eucalyptus & cedarwood essential oils",
  },
  {
    name: "Oat & Honey Comfort Bar",
    slug: "oat-honey-comfort-bar",
    description:
      "Warm caramel tones with colloidal oat and raw honey for skin that feels nourished, never tight. Our go-to for sensitive or dry skin.",
    price: 15,
    category: Category.SOAP,
    stock: 44,
    fragrance: "Oat, Honey & Chamomile",
    featured: true,
    images: ["/images/products/oat-honey-bar.jpg"],
    ingredients: "Colloidal oat, raw honey, coconut oil, shea butter, chamomile extract",
  },
  {
    name: "The Full Ritual Gift Set",
    slug: "full-ritual-gift-set",
    description:
      "Three signature bars plus body wash and lotion in a hand-wrapped gift box — everything to start (or share) a complete MsVee ritual.",
    price: 89,
    comparePrice: 110,
    category: Category.GIFT_SET,
    stock: 12,
    fragrance: "Curated Ritual",
    featured: true,
    images: ["/images/hero-soaps.jpg"],
    ingredients:
      "Includes Blush Rose, Botanical Swirl, and Oat & Honey bars plus cedar body wash and amber lotion",
  },
  {
    name: "Forest Cedar Body Wash",
    slug: "forest-cedar-body-wash",
    description:
      "A grounding botanical wash with cedarwood, pine needle, and wild moss. Cleanses deeply without stripping your skin barrier.",
    price: 28,
    category: Category.BODY_WASH,
    stock: 45,
    fragrance: "Forest & Cedar",
    featured: false,
    images: [],
    ingredients:
      "Coconut-derived surfactants, hemp seed oil, cedarwood essential oil, pine needle extract, glycerin",
  },
  {
    name: "Warm Amber Body Lotion",
    slug: "warm-amber-body-lotion",
    description:
      "Silky hydration with amber resin, vanilla orchid, and shea butter. Absorbs quickly and leaves a soft, healthy glow.",
    price: 34,
    category: Category.LOTION,
    stock: 31,
    fragrance: "Warm Amber",
    featured: false,
    images: [],
    ingredients: "Shea butter, rosehip oil, kokum butter, amber resin, vitamin E",
  },
  {
    name: "Citrus Bloom Bar Soap (3-pack)",
    slug: "citrus-bloom-bar-soap",
    description:
      "Bright, sun-kissed citrus layered with neroli and white florals. Three bars per set — perfect for guest baths or gifting.",
    price: 22,
    category: Category.SOAP,
    stock: 8,
    fragrance: "Citrus Bloom",
    featured: false,
    images: [],
    ingredients:
      "Coconut oil, bergamot essential oil, neroli, mango seed butter, olive oil",
  },
  {
    name: "Rosehip Renewal Bar Soap",
    slug: "rosehip-renewal-bar-soap",
    description:
      "Nourishing bar with rosehip and mango seed butter for a silky, radiant cleanse. A floral favorite beyond our hero trio.",
    price: 14,
    category: Category.SOAP,
    stock: 40,
    fragrance: "Soft Floral",
    featured: false,
    images: [],
    ingredients: "Rosehip oil, mango seed butter, coconut oil, kokum butter, olive oil",
  },
  {
    name: "Lavender Oat Sugar Scrub",
    slug: "lavender-oat-sugar-scrub",
    description:
      "Gentle exfoliation with colloidal oat and calming lavender. Polishes away dullness while comforting stressed skin.",
    price: 26,
    category: Category.SCRUB,
    stock: 20,
    fragrance: "Lavender & Oat",
    featured: false,
    images: [],
    ingredients:
      "Colloidal oat, coconut oil, lavender essential oil, raw sugar, shea butter",
  },
  {
    name: "Cedarwood Calm Roll-On",
    slug: "cedarwood-calm-roll-on",
    description:
      "A pocket-sized aromatherapy blend for wrists and pulse points — cedar and lavender to unwind before sleep or travel.",
    price: 18,
    category: Category.AROMATHERAPY,
    stock: 35,
    fragrance: "Forest & Lavender",
    featured: false,
    images: [],
    ingredients:
      "Cedarwood essential oil, lavender essential oil, hemp seed oil, jojoba",
  },
];

const customers = [
  { email: "sarah.chen@email.com", firstName: "Sarah", lastName: "Chen", phone: "555-0101" },
  { email: "marcus.williams@email.com", firstName: "Marcus", lastName: "Williams", phone: "555-0102" },
  { email: "elena.rodriguez@email.com", firstName: "Elena", lastName: "Rodriguez", phone: "555-0103" },
  { email: "james.okonkwo@email.com", firstName: "James", lastName: "Okonkwo", phone: "555-0104" },
  { email: "priya.patel@email.com", firstName: "Priya", lastName: "Patel", phone: "555-0105" },
];

const statuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

async function main() {
  console.log("Seeding MsVee Soaps database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.storeSettings.deleteMany();

  const hashedPassword = await bcrypt.hash("msvee-admin-2024", 12);
  await prisma.adminUser.create({
    data: {
      email: "admin@msvee.co",
      password: hashedPassword,
      name: "MsVee Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.adminUser.create({
    data: {
      email: "moderator@msvee.co",
      password: await bcrypt.hash("mod-2024", 12),
      name: "Moderator",
      role: "MODERATOR",
    },
  });

  await prisma.storeSettings.create({
    data: {
      id: "default",
      name: "MsVee Soaps",
      tagline: "Where Ritual Meets Luxury",
      email: "hello@msvee.co",
      phone: "(555) 867-5309",
      address: "124 Botanical Lane, Portland, OR 97201",
      maintenanceMode: false,
      featureCheckout: true,
      featureNewsletter: true,
    },
  });

  const superAdmin = await prisma.adminUser.findFirst({
    where: { email: "admin@msvee.co" },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        adminId: superAdmin!.id,
        adminEmail: "admin@msvee.co",
        adminRole: "SUPER_ADMIN",
        action: "CREATE",
        entity: "StoreSettings",
        entityId: "default",
        metadata: { source: "seed" },
      },
      {
        adminId: superAdmin!.id,
        adminEmail: "admin@msvee.co",
        adminRole: "SUPER_ADMIN",
        action: "UPDATE",
        entity: "AdminUser",
        entityId: superAdmin!.id,
        metadata: { note: "Initial super admin" },
      },
    ],
  });

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "sarah.chen@email.com" },
      { email: "elena.rodriguez@email.com" },
    ],
  });

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }

  const createdCustomers = [];
  for (const c of customers) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }

  for (let i = 0; i < 20; i++) {
    const customer = createdCustomers[i % createdCustomers.length];
    const product = createdProducts[i % createdProducts.length];
    const qty = Math.floor(Math.random() * 3) + 1;
    const subtotal = product.price * qty;
    const shipping = subtotal >= 75 ? 0 : 8;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const status = statuses[i % statuses.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.order.create({
      data: {
        orderNumber: `MSV-${100000 + i}`,
        status,
        customerId: customer.id,
        subtotal,
        shipping,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        createdAt,
        items: {
          create: {
            productId: product.id,
            quantity: qty,
            price: product.price,
          },
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
