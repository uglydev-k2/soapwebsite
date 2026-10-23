#!/usr/bin/env node
/**
 * Smoke-test subscription checkout APIs (no card charge).
 *
 *   BASE_URL=https://www.mvlusciouslather.com node scripts/verify-subscription-checkout.mjs
 */
const BASE =
  process.env.BASE_URL?.replace(/\/$/, "") || "https://www.mvlusciouslather.com";
const PRODUCT_ID = process.env.TEST_PRODUCT_ID || "cmvkflmwy0000ogl7o2noqtg2";

const address = {
  email: "verify-subscription@example.com",
  firstName: "Verify",
  lastName: "Subscription",
  line1: "123 Test St",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  country: "US",
};

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

function pass(msg) {
  console.log("OK:", msg);
}

console.log(`Verifying subscription checkout at ${BASE}\n`);

const configRes = await fetch(`${BASE}/api/checkout/config`);
const config = await configRes.json();
if (!configRes.ok || !config.data?.applicationId) {
  fail(`checkout/config → ${configRes.status}`);
} else {
  pass(`Square config (app ${config.data.applicationId.slice(0, 12)}…)`);
}

const optionsRes = await fetch(`${BASE}/api/checkout/subscription-options`);
const options = await optionsRes.json();
if (
  !optionsRes.ok ||
  options.data?.discountRate !== 0.1 ||
  !options.data?.cadences?.every((c) => c.planConfigured)
) {
  fail("subscription-options missing cadences or discount");
} else {
  pass(`Subscription options (${options.data.cadences.length} cadences, 10% off)`);
}

const totalsBody = {
  ...address,
  items: [{ productId: PRODUCT_ID, quantity: 1, price: 1 }],
  purchaseType: "subscription",
  subscriptionCadence: "monthly",
};

const totalsOneTime = await post("/api/checkout/totals", {
  ...totalsBody,
  purchaseType: "one_time",
});
const totalsSub = await post("/api/checkout/totals", totalsBody);

if (!totalsSub.ok || totalsSub.json.data?.total !== 11.47) {
  fail(
    `subscription totals expected total 11.47, got ${JSON.stringify(totalsSub.json)}`
  );
} else {
  pass(`Subscription totals $${totalsSub.json.data.total} (${totalsSub.json.data.totalCents} cents)`);
}

if (totalsOneTime.ok && totalsSub.ok) {
  const subDisc = totalsOneTime.json.data.subtotal - totalsSub.json.data.subtotal;
  if (subDisc < 0.09 || subDisc > 0.11) {
    fail(`expected ~$0.10 subscription discount on subtotal, delta=${subDisc}`);
  } else {
    pass("10% subscription discount applied on merchandise");
  }
}

const badPayment = await post("/api/checkout", {
  ...totalsBody,
  sourceId: "cnon:invalid-smoke-test",
  idempotencyKey: crypto.randomUUID(),
});

if (badPayment.status !== 402) {
  fail(`checkout with bad token should 402, got ${badPayment.status}`);
} else {
  pass("Checkout reaches Square (402 on invalid payment token, not validation error)");
}

if (badPayment.json.error?.includes("delivery frequency")) {
  fail("checkout incorrectly rejected subscription cadence");
}

const missingCadence = await post("/api/checkout/totals", {
  ...address,
  items: [{ productId: PRODUCT_ID, quantity: 1, price: 1 }],
  purchaseType: "subscription",
});
if (missingCadence.ok) {
  fail("totals should require subscriptionCadence when purchaseType=subscription");
} else {
  pass("Validation requires cadence for subscription totals");
}

console.log(process.exitCode ? "\nSome checks failed." : "\nAll subscription smoke checks passed.");
