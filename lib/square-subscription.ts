import { randomUUID } from "crypto";
import { getSquareClient } from "@/lib/square";

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
