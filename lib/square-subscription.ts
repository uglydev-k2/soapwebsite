import { randomUUID } from "crypto";
import { SquareError } from "square";
import { getSquareClient } from "@/lib/square";
import { formatSquareBillingPhone } from "@/lib/square-billing-contact";
import { SquarePaymentFailedError } from "@/lib/square-payment-response";

export function formatSquareApiError(error: unknown): string {
  if (error instanceof SquarePaymentFailedError) {
    const fromSquare = error.squareErrors
      .map((entry) => entry.detail || entry.code)
      .filter(Boolean)
      .join("; ");
    return fromSquare || error.message;
  }

  if (error instanceof SquareError) {
    const fromSquare = error.errors
      .map((entry) => entry.detail || entry.code)
      .filter(Boolean)
      .join("; ");
    return fromSquare || error.message;
  }

  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : String(error);
  }
  const record = error as {
    message?: string;
    errors?: { code?: string; detail?: string; field?: string }[];
    body?: { errors?: { code?: string; detail?: string; field?: string }[] };
  };
  const errors = record.errors ?? record.body?.errors;
  if (errors?.length) {
    return errors
      .map((entry) => entry.detail || entry.code || entry.field)
      .filter(Boolean)
      .join("; ");
  }
  return record.message ?? "Square API error";
}

async function createSquareCustomerRecord(input: {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}): Promise<string> {
  const response = await getSquareClient().customers.create({
    idempotencyKey: randomUUID(),
    emailAddress: input.email.trim(),
    givenName: input.firstName.trim(),
    familyName: input.lastName.trim(),
    phoneNumber: input.phoneNumber,
  });

  const customerId = response.customer?.id;
  if (!customerId) {
    throw new Error("Square customer could not be created");
  }
  return customerId;
}

export async function createOrGetSquareCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
}): Promise<string> {
  const client = getSquareClient();
  const email = input.email.trim();
  const phoneNumber = formatSquareBillingPhone(
    input.phone,
    input.countryCode ?? "US"
  );

  try {
    const searchResponse = await client.customers.search({
      limit: BigInt(1),
      query: {
        filter: {
          emailAddress: {
            exact: email,
          },
        },
      },
    });

    const existingId = searchResponse.customers?.[0]?.id;
    if (existingId) {
      return existingId;
    }
  } catch (error) {
    console.warn(
      "[msvee:square] Customer search failed, will try create:",
      formatSquareApiError(error)
    );
  }

  try {
    return await createSquareCustomerRecord({
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber,
    });
  } catch (error) {
    if (!phoneNumber) {
      throw error;
    }
    console.warn(
      "[msvee:square] Customer create with phone failed, retrying without phone:",
      formatSquareApiError(error)
    );
    return createSquareCustomerRecord({
      email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }
}

/** @deprecated Use createOrGetSquareCustomer */
export async function createSquareCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<string> {
  return createOrGetSquareCustomer(input);
}

/** `sourceId` may be a Web Payments nonce or a Square payment id after CreatePayment. */
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
