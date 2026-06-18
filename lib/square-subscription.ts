import { randomUUID } from "crypto";
import { getSquareClient, getSquareLocationId } from "@/lib/square";
import type { SubscriptionCadence } from "@/lib/subscriptions";
import { getSubscriptionPlanVariationId } from "@/lib/subscriptions";

export async function createSquareCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<string> {
  const response = await getSquareClient().customers.create({
    idempotencyKey: randomUUID(),
    emailAddress: input.email,
    givenName: input.firstName,
    familyName: input.lastName,
    phoneNumber: input.phone?.trim() || undefined,
  });

  const customerId = response.customer?.id;
  if (!customerId) {
    throw new Error("Square customer could not be created");
  }
  return customerId;
}

export async function createSquareCardOnFile(input: {
  customerId: string;
  sourceId: string;
  idempotencyKey: string;
}): Promise<string> {
  const response = await getSquareClient().cards.create({
    idempotencyKey: input.idempotencyKey,
    sourceId: input.sourceId,
    card: {
      customerId: input.customerId,
    },
  });

  const cardId = response.card?.id;
  if (!cardId) {
    throw new Error("Card could not be saved for subscription billing");
  }
  return cardId;
}

export async function createSquareSubscription(input: {
  customerId: string;
  cardId: string;
  cadence: SubscriptionCadence;
  idempotencyKey: string;
}): Promise<string> {
  const planVariationId = getSubscriptionPlanVariationId(input.cadence);
  if (!planVariationId) {
    throw new Error(`Subscription plan is not configured for ${input.cadence}`);
  }

  const response = await getSquareClient().subscriptions.create({
    idempotencyKey: input.idempotencyKey,
    locationId: getSquareLocationId(),
    customerId: input.customerId,
    planVariationId,
    cardId: input.cardId,
    timezone: "America/Chicago",
    source: {
      name: "MV Luscious Lather Checkout",
    },
  });

  const subscriptionId = response.subscription?.id;
  if (!subscriptionId) {
    throw new Error("Square subscription could not be created");
  }
  return subscriptionId;
}
