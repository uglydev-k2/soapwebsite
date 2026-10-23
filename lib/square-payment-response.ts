import type { Square } from "square";

type CreatePaymentResponse = Square.CreatePaymentResponse;

export class SquarePaymentFailedError extends Error {
  readonly squareErrors: { code?: string; detail?: string }[];

  constructor(message: string, squareErrors: { code?: string; detail?: string }[] = []) {
    super(message);
    this.name = "SquarePaymentFailedError";
    this.squareErrors = squareErrors;
  }
}

export function assertSquarePaymentCreated(response: CreatePaymentResponse) {
  const payment = response.payment;
  const apiErrors = response.errors ?? [];

  if (apiErrors.length && !payment?.id) {
    const message = apiErrors
      .map((entry) => entry.detail || entry.code)
      .filter(Boolean)
      .join("; ");
    throw new SquarePaymentFailedError(
      message || "Square could not create the payment",
      apiErrors
    );
  }

  if (!payment?.id) {
    throw new SquarePaymentFailedError("Square did not return a payment id");
  }

  return payment;
}
