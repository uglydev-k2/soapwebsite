# MsVee Soaps

Premium botanical bath and body brand — production-ready Next.js 14 App Router site with a full admin dashboard backed by PostgreSQL.

## Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript** (strict)
- **Tailwind CSS v3** + custom design tokens
- **PostgreSQL** via Prisma ORM
- **NextAuth.js v5** (admin credentials)
- **Zustand** (cart + toasts)
- **React Hook Form + Zod**
- **Recharts**, **UploadThing**, **Resend**, **Stripe**

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit DATABASE_URL and other keys

# Push schema & seed database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing site.

**Admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

| Email | Password |
|-------|----------|
| `admin@msvee.co` | `msvee-admin-2024` |

## Project Structure

```
app/
  (marketing)/     # Public site — home, collections, about, cart
  admin/           # Protected dashboard
  api/             # REST API routes
components/
  marketing/       # Hero, Navbar, ProductGrid, etc.
  admin/           # Sidebar, charts, forms, tables
  ui/              # Shared Button, Input, Modal, Toast
lib/               # Auth, Prisma, Stripe, Resend, validations
prisma/            # Schema + seed data
store/             # Zustand cart + toast stores
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session encryption |
| `NEXTAUTH_URL` | App URL for auth callbacks |
| `STRIPE_*` | Checkout + webhooks |
| `UPLOADTHING_*` | Product image uploads |
| `RESEND_*` | Transactional email |

## Database

```bash
npm run db:push      # Apply schema
npm run db:seed      # Seed products, orders, admin user
npm run db:studio    # Prisma Studio GUI
```

Seed includes 6 products, 20 orders, 5 customers, and admin `admin@msvee.co`.

## Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deploy (Vercel)

1. Connect repo to Vercel (https://github.com/uglydev-k2/soapwebsite)
2. Add a **PostgreSQL** database (Vercel Postgres, Neon, or Supabase) and set **`DATABASE_URL`**
3. Add required env vars from `.env.example`:
   - `AUTH_SECRET` or `NEXTAUTH_SECRET` (same value: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = your production URL (e.g. `https://your-app.vercel.app`)
4. Redeploy — the build runs `prisma db push` to create tables
5. Seed once locally or via CLI: `DATABASE_URL="..." npm run db:seed`
6. Configure Stripe webhook: `https://your-domain.com/api/stripe/webhook`

If you see **Application error** on the homepage, `DATABASE_URL` is usually missing or the DB is unreachable. Check Vercel → Project → Settings → Environment Variables.

## Features

### Marketing Site
- Hero with botanical SVG animation
- Featured products from database
- Fragrance profiles, ritual philosophy, testimonials
- Newsletter signup (saves to DB + Resend welcome email)
- Cart with Stripe Checkout

### Admin Dashboard
- KPI overview with live revenue charts
- Product CRUD with image upload
- Order management with status updates
- Customer list with slide-over detail
- Analytics with date range filters
- Store settings, password change, admin invites
