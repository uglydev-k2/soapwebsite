# mvlusciouslather

Premium botanical bath and body brand — production-ready Next.js 14 App Router site with a full admin dashboard backed by PostgreSQL.

## Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript** (strict)
- **Tailwind CSS v3** + custom design tokens
- **PostgreSQL** via Prisma ORM
- **NextAuth.js v5** (admin credentials)
- **Zustand** (cart + toasts)
- **React Hook Form + Zod**
- **Recharts**, **UploadThing**, **Resend**, **Square**

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
| `mvlusciouslather@gmail.com` | `msvee-admin-2024` |

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
lib/               # Auth, Prisma, Square, Resend, validations
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
| `SQUARE_*` | Checkout + subscriptions |
| `NEXT_PUBLIC_SUPABASE_*` | Customer accounts + order history |
| `UPLOADTHING_TOKEN` | Admin product image uploads |
| `RESEND_*` | Transactional email |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 analytics |

## Database

```bash
npm run db:push      # Apply schema
npm run db:seed      # Seed products, orders, admin user
npm run db:studio    # Prisma Studio GUI
```

Seed includes sample products, orders, customers, and admin `mvlusciouslather@gmail.com`.

## Production checklist

1. Set all required env vars in `.env.example` (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL)
2. Configure Square (`SQUARE_*`, `NEXT_PUBLIC_SQUARE_*`) for checkout
3. Subscriptions are cart-based and managed in-app (no preassigned Square plan IDs needed)
4. Set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` for order emails
5. Optional: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
6. Run `npm run db:push` after schema updates

## Deploy (Vercel)

**Live URLs:** [soapwebsite.vercel.app](https://soapwebsite.vercel.app) · [mzveesoaps.vercel.app](https://mzveesoaps.vercel.app) · [msvee-soap.vercel.app](https://msvee-soap.vercel.app)

1. Connect repo to Vercel (https://github.com/uglydev-k2/soapwebsite)
2. **Supabase:** Project → **Connect** → copy **Transaction pooler** URL → `DATABASE_URL`, and **Direct** URL → `DIRECT_URL`
3. Add required env vars from `.env.example`:
   - `AUTH_SECRET` or `NEXTAUTH_SECRET` (same value: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = your production URL (e.g. `https://mzveesoaps.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy — Vercel build auto-runs `prisma db push` when `DATABASE_URL` is set
5. Seed once locally: fill `.env.local`, then `npm run db:setup`

If you see **Application error** on the homepage, `DATABASE_URL` is usually missing or the DB is unreachable. Check Vercel → Project → Settings → Environment Variables.

## Features

### Marketing Site
- Hero with botanical SVG animation
- Featured products from database
- Fragrance profiles, ritual philosophy, customer reviews (moderated)
- Back-in-stock waitlist with email alerts
- Promo codes at checkout
- Newsletter signup (saves to DB + Resend welcome email)
- Cart with Square embedded checkout + optional subscriptions

### Admin Dashboard
- KPI overview with live revenue charts
- Product CRUD with image upload
- Order management with status updates, tracking emails, free-sample fulfillment notes
- Customer list with slide-over detail
- Review moderation and promo code management
- Low-stock alerts (products + scent variants)
- Pending subscription setup alerts when Square plans are missing
- Analytics with date range filters
- Store settings, password change, admin invites
