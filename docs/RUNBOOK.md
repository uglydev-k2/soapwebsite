# MV Luscious Lather — Operations Runbook

Storefront: **mvlusciouslather** (Next.js 14 + Prisma + Square + Supabase)

**Download:** Admin → System → **Download PDF**, **Download HTML**, or **Download Markdown**  
Regenerate PDF after edits: `npm run docs:runbook`

This runbook covers day-to-day operations, incident response, and reconciliation for orders, payments, fulfillment, and subscriptions.

---

## Table of contents

1. [Quick reference](#1-quick-reference)
2. [Daily operations](#2-daily-operations)
3. [Order fulfillment](#3-order-fulfillment)
4. [Payments (Square)](#4-payments-square)
5. [Payment missing / reconciliation](#5-payment-missing--reconciliation)
6. [Shipping labels (Shippo)](#6-shipping-labels-shippo)
7. [Refunds and cancellations](#7-refunds-and-cancellations)
8. [Subscriptions and renewals](#8-subscriptions-and-renewals)
9. [Email notifications](#9-email-notifications)
10. [Maintenance and checkout controls](#10-maintenance-and-checkout-controls)
11. [Environment variables](#11-environment-variables)
12. [Deployment and health checks](#12-deployment-and-health-checks)
13. [Incident playbooks](#13-incident-playbooks)
14. [Admin reference](#14-admin-reference)

---

## 1. Quick reference

| Task | Where / how |
|------|-------------|
| View pending orders | `/admin` → Fulfillment Queue, or `/admin/orders?status=PROCESSING` |
| Fulfill + ship | `/admin/orders/[id]` → Create Shipping Label **or** enter tracking → mark Shipped |
| Look up an order | `/admin/orders` (search by order number or customer email) |
| Verify a payment | [Square Dashboard](https://squareup.com/dashboard) → Transactions → search by payment ID or order number |
| Refund an order | Square Dashboard **or** `PATCH /api/admin/billing` (API only — no admin UI yet) |
| Block shopping | Admin → Settings → Maintenance mode **or** set `MAINTENANCE_MODE=true` in Vercel |
| Health check | `GET /api/health` |
| Env checklist | `npm run env:vercel-checklist` |
| Create admin user | `npm run admin:create` |
| Download runbook | Admin → **System** → Download PDF / HTML / Markdown · `npm run docs:runbook` to rebuild PDF |

**Order number format:** `MLL-XXXXXX` (generated at checkout)

**Payment provider:** Square (primary). Stripe is legacy for old checkout sessions only.

---

## 2. Daily operations

### Morning checklist (5–10 min)

1. **Open admin dashboard** — `/admin`
   - Review **Fulfillment Queue** (orders in `PROCESSING`)
   - Check low-stock alerts if any products are near zero

2. **Verify yesterday’s payments in Square**
   - Square Dashboard → **Transactions** or **Balance**
   - Compare deposit total to admin revenue (rough match; Square fees reduce net deposit)
   - Flag any payment stuck in **Pending** or **Failed**

3. **Process shipments**
   - For each unshipped order: create label or buy label elsewhere, enter tracking, mark **Shipped**
   - Customer receives tracking email automatically on ship (if Resend is configured)

4. **Scan email / contact**
   - Contact form submissions go to `STORE_CONTACT_EMAIL` or `RESEND_FROM_EMAIL`

### Weekly checklist

- Review `/admin/inventory` for low stock
- Review `/admin/subscriptions` for failed renewals (check server logs if renewals seem stale)
- Confirm Vercel cron ran: Vercel → Project → Cron Jobs → `/api/cron/subscription-charges` (daily 14:00 UTC)
- Spot-check `/api/health` after deploys

---

## 3. Order fulfillment

### Order lifecycle

```
Checkout (Square charge)
  → fulfillOrder()
  → status: PROCESSING
  → Admin packs order
  → SHIPPED (+ tracking email)
  → DELIVERED (+ delivered + reorder emails)
```

**Statuses:** `PENDING` | `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `REFUNDED`

**Note:** New Square orders are created as **`PROCESSING`**, not `PENDING`. The fulfillment queue includes both.

### Where order data lives

| Data | Location |
|------|----------|
| Order totals, status | Prisma `Order` table |
| Shipping address, tracking, label URL, promo, subscription meta | `Order.notes` (JSON string) |
| Line items | `OrderItem` + `Product` |
| Backup copy | Supabase `orders` table (if `SUPABASE_SERVICE_ROLE_KEY` set) |

### Option A — Shippo label from admin (recommended for US orders)

**Prerequisites:** `SHIPPO_API_TOKEN` and `SHIP_FROM_*` env vars configured (see [§6](#6-shipping-labels-shippo)).

1. Go to `/admin/orders/[id]`
2. Confirm **Ship To** address and package weight
3. Click **Create Shipping Label**
   - Purchases USPS Ground Advantage via Shippo
   - Opens PDF in new tab for printing
   - Saves tracking number on the order
   - Marks order **SHIPPED**
   - Sends tracking email to customer
4. To reprint: click **Print Shipping Label** (does not charge again)

**From dashboard queue:** Fulfillment Queue → **Print Label** (same API).

### Option B — Manual label (Pirate Ship, USPS.com, etc.)

1. Open order detail — copy address from **Ship To**
2. Use package weight shown on order (calculated from product categories + 3 oz packaging)
3. Buy label externally
4. Paste tracking number in **Tracking Number** field
5. Change status to **SHIPPED** (sends tracking email)
   - Or use **Send Tracking Email** without changing status

### Packing notes

- `includeFreeSample: true` in order notes → include complimentary sample (shown on order detail)
- Subscription renewals do **not** include free sample

---

## 4. Payments (Square)

### How checkout works

1. Customer completes form on `/checkout`
2. Square Web SDK tokenizes card → `sourceId`
3. `POST /api/checkout`:
   - Validates cart, promo, shipping quote
   - Charges card via Square (`chargeSquarePayment`)
   - Creates order via `fulfillOrder`
   - Sends confirmation email
4. Redirect to `/order/confirmation?payment_id=...&email=...`

**Key files:** `app/api/checkout/route.ts`, `lib/square-payments.ts`, `lib/fulfill-order.ts`

### Square env vars (production)

```
SQUARE_ACCESS_TOKEN
SQUARE_LOCATION_ID
SQUARE_ENVIRONMENT=production
NEXT_PUBLIC_SQUARE_APPLICATION_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID
```

**Sandbox vs production:** `SQUARE_ENVIRONMENT` must match the tokens and application IDs. Sandbox charges do not deposit real money.

**Subscriptions:** The production access token must include **Customers** and **Cards** (create/read) permissions—not payments alone—or saving cards for renewals will fail after checkout. Regenerate the token under Square Developer → MsVee Website → Credentials if subscribe orders pay but no subscription appears in admin.

### Payment statuses accepted at checkout

The site treats these Square statuses as successful:

- `COMPLETED`
- `APPROVED`
- `PENDING` ← **funds may not be settled yet**

There is **no Square webhook** in this codebase. Payment status is not synced after checkout. Always verify in Square Dashboard for disputes, failures, or delayed settlement.

### Where payment ID is stored

- Prisma: `Order.paymentId` (Square payment ID, e.g. `FWA5ZRoQwAPU7iL3GU7D8tt9a4aZY`)
- Square reference: order number in `referenceId` / payment note (`mvlusciouslather order MLL-XXXXXX`)

### Payout timing

Square typically deposits 1–2 **business days** after capture. Weekend/holiday orders may show as completed in Square before the bank deposit arrives. This is normal Square behavior, not a site bug.

---

## 5. Payment missing / reconciliation

Use this when: *“Customer was charged” / “Order exists but I didn’t get paid” / “Square shows nothing”*

### Step 1 — Find the order in admin

`/admin/orders` → search by:

- Order number (`MLL-277764`)
- Customer email
- Date filter

Record:

| Field | Example |
|-------|---------|
| Order number | `MLL-277764` |
| Total | `$32.10` |
| Payment ID | `FWA5ZRoQwAPU7iL3GU7D8tt9a4aZY` |
| Status | `SHIPPED` |
| Created | `2026-07-26` |

### Step 2 — Look up payment in Square

1. [Square Dashboard](https://squareup.com/dashboard) → **Transactions**
2. Search payment ID **or** order number (`MLL-XXXXXX`)
3. Note status:

| Square status | Meaning | Action |
|---------------|---------|--------|
| **Completed** | Captured successfully | Check **Transfers/Deposits** for payout date; wait 1–2 business days |
| **Pending** | Not fully settled | Wait; monitor; do not ship if still pending after 24h |
| **Failed / Canceled** | No money collected | Order may exist in error — contact customer, do not fulfill |
| **Not found** | No charge recorded | See [orphan scenarios](#orphan-scenarios) below |

### Step 3 — Compare amounts

Order total in admin should match Square charge (before Square processing fees). Breakdown:

- Subtotal (after promo/subscription discount)
- + Shipping (USPS quote or $0 free shipping)
- + Tax (8% on subtotal)

### Step 4 — Check bank deposit

Square Dashboard → **Balance** → **Transfers** (or linked bank deposits)

Match deposit date to transaction date + 1–2 business days.

### Orphan scenarios

#### A. Square shows Completed, admin has order — no bank deposit yet

- Normal delay (especially weekend orders)
- Verify correct Square business account is linked to bank
- Contact Square Support with payment ID if >3 business days

#### B. Customer says charged, no order in admin

1. Search Square by customer email and date
2. Search Prisma by `paymentId` if you have it from customer’s bank statement
3. Check Supabase `orders` table if configured
4. If payment exists in Square but no order → **payment succeeded, fulfillment failed** (see [§13.1](#131-payment-succeeded-order-not-saved))

#### C. Order in admin, no payment in Square

- Possible test/sandbox mismatch
- Possible manual/seed order (`paymentId` null on old seed data)
- Data entry error — verify `paymentId` field is populated

#### D. Order shipped but payment still Pending in Square

- Site accepts `PENDING` as success at checkout
- Do not assume funds received until Square shows **Completed**
- Pause further shipments for that customer until resolved

### Database lookup (support / developer)

```bash
# Load env first, then query by date or order number
export $(grep -v '^#' .env.local | xargs)
npx tsx -e "
import { prisma } from './lib/prisma';
const orders = await prisma.order.findMany({
  where: { orderNumber: 'MLL-277764' },
  include: { customer: true, items: { include: { product: true } } },
});
console.log(JSON.stringify(orders, null, 2));
await prisma.\$disconnect();
"
```

---

## 6. Shipping labels (Shippo)

### Setup (one-time)

1. Create account at [goshippo.com](https://goshippo.com)
2. Connect USPS account for commercial rates
3. Add to Vercel environment:

```bash
SHIPPO_API_TOKEN=shippo_live_...
SHIP_FROM_NAME="MV Luscious Lather"
SHIP_FROM_STREET1="your street"
SHIP_FROM_CITY="your city"
SHIP_FROM_STATE="TX"
SHIP_FROM_ZIP="your zip"
SHIP_FROM_PHONE="your phone"
SHIP_FROM_EMAIL="hello@mvlusciouslather.com"

# Optional parcel defaults (inches)
SHIP_PARCEL_LENGTH_IN=8
SHIP_PARCEL_WIDTH_IN=6
SHIP_PARCEL_HEIGHT_IN=3
```

4. Redeploy

### API behavior

- **Endpoint:** `POST /api/orders/[id]/label`
- **US domestic only** (international → manual labels)
- **Service:** cheapest USPS Ground Advantage (or similar USPS tier)
- **Cost:** charged to your Shippo account (not the customer — shipping was already paid at checkout)
- **Idempotent:** returns existing label unless `{ "force": true }` (avoid — charges again)

### Troubleshooting labels

| Error | Fix |
|-------|-----|
| "Shipping labels are not configured" | Add `SHIPPO_API_TOKEN` |
| "Ship-from address is not configured" | Add all required `SHIP_FROM_*` vars |
| "No USPS shipping rates" | Verify address; check Shippo USPS connection |
| "US orders only" | Use manual label for international |

---

## 7. Refunds and cancellations

### Via Square Dashboard (simplest)

1. Find payment by ID or order number
2. Issue refund in Square
3. Update order status in admin to **REFUNDED**

### Via API (automated Square refund + status update)

**No admin UI button exists yet.** Use authenticated admin session or API tool:

```http
PATCH /api/admin/billing
Content-Type: application/json

{
  "orderId": "<prisma-order-id>",
  "action": "refund"
}
```

- Attempts Square refund for full order total
- Sets order status to `REFUNDED`
- **Warning:** If Square refund fails, order may still be marked REFUNDED — verify response `paymentRefunded` field

**Cancel without refund:**

```json
{ "orderId": "...", "action": "cancel" }
```

Sets status to `CANCELLED` only.

### Subscriptions

- Cancel via `/admin/subscriptions` or `PATCH /api/admin/subscriptions`
- Refund API **does not refund subscription payments** — cancel only
- Refund individual renewal orders via order refund flow

---

## 8. Subscriptions and renewals

### How subscriptions work

1. Customer chooses **Subscribe** at checkout with cadence (monthly / bi-monthly / quarterly)
2. Checkout tokenizes with **`CHARGE`** (same as one-time). After payment succeeds, card is saved via Cards API using the **payment id** as `sourceId`.
3. `CustomerSubscription` record stores cart snapshot + next charge date
4. Daily cron charges saved card (`ccof:…`) with the matching **Square customer id** and creates renewal order

### Cron job

| Setting | Value |
|---------|-------|
| Schedule | Daily at **14:00 UTC** (`0 14 * * *`) |
| Path | `/api/cron/subscription-charges` |
| Auth | `Authorization: Bearer $CRON_SECRET` |

**Manual run (production):**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/subscription-charges
```

**If cron fails:** renewals stop charging. Check:

- `CRON_SECRET` set in Vercel
- Vercel Cron enabled on your plan
- Server logs for `[msvee:subscription-renewal]`

### Renewal failure modes

| Symptom | Cause | Action |
|---------|-------|--------|
| Card declined | Expired/insufficient funds | Contact customer; update card (support flow) |
| Out of stock | Product unavailable | Restock or contact customer |
| Charged but no order | DB error after payment | Square Dashboard + manual order creation |
| Subscription active but never renews | Cron 401 / paused | Fix `CRON_SECRET`; check subscription status |

---

## 9. Email notifications

**Provider:** Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)

| Event | Recipient | Trigger |
|-------|-----------|---------|
| Order confirmation | Customer | After successful checkout |
| New order alert | Store email + admins | After checkout (if `notifyNewOrder`) |
| Low stock alert | Store email + admins | Stock drops to ≤10 after order |
| Tracking / shipped | Customer | Status → SHIPPED or label created |
| Delivered + reorder nudge | Customer | Status → DELIVERED |
| Newsletter welcome | Subscriber | Newsletter signup |
| Contact / wholesale | Store contact | Form submission |

**If emails stop:** check `RESEND_API_KEY` in Vercel. Orders still complete — emails fail silently in logs.

**Admin toggles not wired:** `notifyOrderShipped` exists in settings UI but is not checked in code before sending shipped emails.

---

## 10. Maintenance and checkout controls

### Two independent switches

| Switch | Effect |
|--------|--------|
| Env `MAINTENANCE_MODE=true` | Full-screen overlay on storefront; admin still accessible |
| DB `StoreSettings.maintenanceMode` | Blocks checkout API (503) |
| DB `StoreSettings.featureCheckout=false` | Blocks checkout only (“Checkout temporarily unavailable”) |

**Recommended for “closed for orders”:** enable both maintenance mode and disable checkout in Settings.

### Admin access during maintenance

`/admin` remains available. Customers can dismiss overlay per session but checkout API still blocks if DB flag is set.

---

## 11. Environment variables

### Required (production)

```
DATABASE_URL          # Supabase pooler (port 6543)
DIRECT_URL            # Direct Postgres (port 5432) for migrations
AUTH_SECRET           # or NEXTAUTH_SECRET
NEXTAUTH_URL          # https://your-production-domain.com
```

### Checkout / payments

```
SQUARE_ACCESS_TOKEN
SQUARE_LOCATION_ID
SQUARE_ENVIRONMENT=production
NEXT_PUBLIC_SQUARE_APPLICATION_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID
CRON_SECRET           # subscription renewals
```

### Email

```
RESEND_API_KEY
RESEND_FROM_EMAIL
STORE_CONTACT_EMAIL   # optional override for contact forms
```

### Shipping labels

```
SHIPPO_API_TOKEN
SHIP_FROM_STREET1
SHIP_FROM_CITY
SHIP_FROM_STATE
SHIP_FROM_ZIP
# + optional SHIP_FROM_NAME, PHONE, EMAIL, parcel dimensions
```

### Auth / storage (optional but recommended)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
UPLOADTHING_TOKEN
```

Full list: `.env.example` and `npm run env:vercel-checklist`

---

## 12. Deployment and health checks

### Deploy pipeline (Vercel)

```
prisma generate
→ scripts/vercel-db-push.mjs (migrations + db push, non-blocking)
→ scripts/fix-product-catalog-data.ts
→ next build
```

### Post-deploy smoke test

1. `GET /api/health` → expect `{ "status": "ok", "database": true, "missingEnv": [] }`
2. Homepage loads
3. `/collections` loads products
4. `/checkout` loads Square card form (with item in cart)
5. `/admin/login` accessible
6. Place sandbox test order (if using sandbox env)

### Create admin user

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run admin:create
```

---

## 13. Incident playbooks

### 13.1 Payment succeeded, order not saved

**Customer message:** “I was charged but got an error / no confirmation email”

1. Get customer email + approximate time
2. Square Dashboard → search transactions by email/time
3. Copy Square **payment ID**
4. Query DB: `Order` where `paymentId = <id>`
   - If found → send confirmation link: `/order/confirmation?payment_id=...&email=...`
   - If not found → payment orphaned
5. **Recovery options:**
   - Manually fulfill from Square details (create order in admin if needed — may require dev)
   - Refund in Square + ask customer to reorder
6. Check logs for `[msvee:checkout] Fulfillment failed after payment`

**Common causes:** product deleted mid-checkout, DB outage, scent option out of stock at fulfillment time.

### 13.2 Checkout broken site-wide

1. `GET /api/health`
2. Check Vercel env: Square vars, `DATABASE_URL`
3. Admin → Settings: `featureCheckout` enabled?
4. Maintenance mode off?
5. Square status page / API outages
6. Browser console on `/checkout` for Square SDK errors

### 13.3 Customer didn’t receive tracking email

1. Confirm order status is **SHIPPED**
2. Confirm `trackingNumber` in order notes
3. Check Resend dashboard for delivery failures
4. Admin order detail → **Send Tracking Email**

### 13.4 Wrong shipping address on label

1. Do **not** use Shippo force repurchase without voiding old label in Shippo
2. Correct address with customer
3. Create new label manually or via API with corrected notes (may need dev to update `shippingAddress` in notes JSON)

### 13.5 Subscription charged twice

1. Check `Order.paymentId` uniqueness — checkout is idempotent on payment ID
2. Check cron logs for duplicate runs
3. Refund duplicate in Square if confirmed

---

## 14. Admin reference

### Routes

| Path | Purpose |
|------|---------|
| `/admin` | Dashboard + fulfillment queue |
| `/admin/orders` | Order list, filters, bulk status, CSV export |
| `/admin/orders/[id]` | Detail, label, tracking, emails |
| `/admin/customers` | Customer records |
| `/admin/products` | Catalog |
| `/admin/inventory` | Low stock |
| `/admin/subscriptions` | Recurring subscriptions |
| `/admin/billing` | Revenue metrics (refund via API only) |
| `/admin/settings` | Store config, maintenance, shipping thresholds |
| `/admin/analytics` | Traffic charts |
| `/admin/logs` | Audit log |

### API endpoints (ops-relevant)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | System health |
| POST | `/api/checkout` | Process payment + create order |
| GET | `/api/orders/confirmation` | Order lookup for confirmation page |
| PATCH | `/api/orders/[id]` | Update status, tracking |
| POST | `/api/orders/[id]` | `send-tracking`, `send-delivered` |
| POST | `/api/orders/[id]/label` | Create Shippo label |
| PATCH | `/api/admin/billing` | Cancel / refund |
| GET | `/api/cron/subscription-charges` | Subscription renewals (cron) |

### Order notes JSON fields (`lib/order-notes.ts`)

```json
{
  "shippingAddress": { "line1", "line2", "city", "state", "postalCode", "country" },
  "trackingNumber": "USPS...",
  "carrier": "USPS",
  "labelUrl": "https://...",
  "shippoTransactionId": "...",
  "shippingService": "USPS Ground Advantage",
  "shippingWeightOz": 9,
  "paymentProvider": "square",
  "purchaseType": "one_time | subscription",
  "subscriptionCadence": "monthly | bimonthly | quarterly",
  "promoCode": "CODE",
  "includeFreeSample": true,
  "internalNotes": "admin notes"
}
```

---

## Revision history

| Date | Notes |
|------|-------|
| 2026-08-06 | Added admin download (HTML, Markdown, print-to-PDF) |
| 2026-08-05 | Initial runbook: fulfillment, Square reconciliation, Shippo labels, subscriptions |

---

*For code changes or runbook updates, edit this file at `docs/RUNBOOK.md`.*
