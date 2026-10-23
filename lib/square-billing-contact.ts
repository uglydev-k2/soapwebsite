/** Square billingContact.phone must be E.164; invalid values break tokenization. */
export function formatSquareBillingPhone(
  phone: string | undefined,
  countryCode: string
): string | undefined {
  const trimmed = phone?.trim();
  if (!trimmed) return undefined;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return undefined;

  if (countryCode === "US" || countryCode === "CA") {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return undefined;
  }

  if (digits.length >= 9 && digits.length <= 15) {
    return trimmed.startsWith("+") ? trimmed : `+${digits}`;
  }

  return undefined;
}
