/** Build a USPS tracking URL from a tracking number. */
export function buildUspsTrackingUrl(trackingNumber: string): string {
  const cleaned = trackingNumber.trim();
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(cleaned)}`;
}

export type ParsedTracking = {
  number: string;
  url: string;
};

/** Parse admin-entered tracking text (number, carrier prefix, or full URL). */
export function parseTrackingInput(input?: string | null): ParsedTracking | null {
  if (!input?.trim()) return null;

  const trimmed = input.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const label =
        url.searchParams.get("tLabels") ||
        url.searchParams.get("trackingNumber") ||
        trimmed.split("/").pop() ||
        trimmed;
      return { number: decodeURIComponent(label), url: trimmed };
    } catch {
      return { number: trimmed, url: trimmed };
    }
  }

  const number = trimmed.replace(/^(USPS|FedEx|UPS)\s*#?\s*/i, "").trim();
  if (!number) return null;

  return { number, url: buildUspsTrackingUrl(number) };
}
