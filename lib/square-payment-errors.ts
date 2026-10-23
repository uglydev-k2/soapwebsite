import { formatSquareApiError } from "@/lib/square-subscription";

function firstSquareCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "squareErrors" in error) {
    const code = (error as { squareErrors?: { code?: string }[] }).squareErrors?.[0]
      ?.code;
    if (code) return code;
  }
  const detail = formatSquareApiError(error);
  const match = detail.match(/\b[A-Z][A-Z0-9_]{2,}\b/);
  return match?.[0];
}

export function squarePaymentUserMessage(error: unknown): string {
  const detail = formatSquareApiError(error).toLowerCase();
  const code = firstSquareCode(error);

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

  if (code) {
    return `Payment could not be processed (${code}). Please try again or use a different card.`;
  }

  return "Payment could not be processed. Please try again.";
}
