import { formatSquareApiError } from "@/lib/square-subscription";

export function squarePaymentUserMessage(error: unknown): string {
  const detail = formatSquareApiError(error).toLowerCase();

  if (detail.includes("declined") || detail.includes("card_declined")) {
    return "Your card was declined. Please try another payment method.";
  }
  if (
    detail.includes("amount") &&
    (detail.includes("match") || detail.includes("verification"))
  ) {
    return "Payment verification failed. Please refresh the page and try again.";
  }
  if (detail.includes("invalid") && detail.includes("token")) {
    return "Your card session expired. Please refresh and try again.";
  }
  if (detail.includes("insufficient") || detail.includes("permission")) {
    return "Payment could not be processed. Please contact the store.";
  }

  return "Payment could not be processed. Please try again.";
}
