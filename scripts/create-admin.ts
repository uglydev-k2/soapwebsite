/**
 * Create or update a NextAuth admin user (Prisma AdminUser).
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='secret' npm run admin:create
 *   npm run admin:create -- you@example.com 'secret' 'Your Name' ADMIN
 */
import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "EDITOR"];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? process.argv[2])?.trim().toLowerCase();
  let password = process.env.ADMIN_PASSWORD ?? process.argv[3];
  const name = (process.env.ADMIN_NAME ?? process.argv[4] ?? "Admin").trim();
  const roleArg = (process.env.ADMIN_ROLE ?? process.argv[5] ?? "ADMIN").toUpperCase();

  if (!email) {
    console.error(
      "Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='secret' npm run admin:create"
    );
    process.exit(1);
  }

  if (!password) {
    password = randomBytes(12).toString("base64url");
    console.log("No password provided — generated a random password.");
  }

  if (!ROLES.includes(roleArg as Role)) {
    console.error(`Invalid role. Use one of: ${ROLES.join(", ")}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hashed,
      role: roleArg as Role,
      active: true,
    },
    update: {
      name,
      password: hashed,
      role: roleArg as Role,
      active: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log("\nAdmin account ready:");
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Name:     ${admin.name}`);
  console.log(`  Role:     ${admin.role}`);
  console.log(`  Password: ${password}`);
  console.log("\nSign in at /admin/login\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
