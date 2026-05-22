import { PrismaClient, OrderStatus, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Forest Cedar Body Wash",
    slug: "forest-cedar-body-wash",
    description:
      "A grounding botanical wash with cedarwood, pine needle, and wild moss. Cleanses without stripping natural oils.",
    price: 28,
    category: Category.BODY_WASH,
    stock: 45,
    fragrance: "Forest & Cedar",
    featured: true,
    images: [],
  },
  {
    name: "Citrus Bloom Bar Soap (3-pack)",
    slug: "citrus-bloom-bar-soap",
    description:
      "Bright, sun-kissed citrus layered with neroli and white florals. Hand-poured in small batches.",
    price: 22,
    category: Category.SOAP,
    stock: 8,
    fragrance: "Citrus Bloom",
    featured: true,
    images: [],
  },
  {
    name: "Warm Amber Body Lotion",
    slug: "warm-amber-body-lotion",
    description:
      "Silky hydration with amber resin, vanilla orchid, and shea butter. Absorbs quickly, leaves a soft glow.",
    price: 34,
    category: Category.LOTION,
    stock: 31,
    fragrance: "Warm Amber",
    featured: true,
    images: [],
  },
  {
    name: "Lavender Mist Sugar Scrub",
    slug: "lavender-mist-sugar-scrub",
    description:
      "Fine cane sugar blended with lavender essential oil and cold-pressed almond oil for gentle exfoliation.",
    price: 26,
    category: Category.SCRUB,
    stock: 0,
    fragrance: "Lavender Mist",
    featured: false,
    images: [],
  },
  {
    name: "Eucalyptus Steam Aromatherapy Set",
    slug: "eucalyptus-steam-aromatherapy",
    description:
      "A ritual set with eucalyptus bath salts, steam oil, and linen sachet for spa-at-home moments.",
    price: 48,
    category: Category.AROMATHERAPY,
    stock: 17,
    fragrance: "Forest & Cedar",
    featured: false,
    images: [],
  },
  {
    name: "The Full Ritual Gift Set",
    slug: "full-ritual-gift-set",
    description:
      "Our complete botanical ritual — body wash, lotion, soap, and scrub in a hand-wrapped gift box.",
    price: 89,
    comparePrice: 110,
    category: Category.GIFT_SET,
    stock: 12,
    fragrance: "Warm Amber",
    featured: true,
    images: [],
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

  await prisma.storeSettings.create({
    data: {
      id: "default",
      name: "MsVee Soaps",
      tagline: "Where Ritual Meets Luxury",
      email: "hello@msvee.co",
      phone: "(555) 867-5309",
      address: "124 Botanical Lane, Portland, OR 97201",
    },
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
