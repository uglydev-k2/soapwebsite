/** Normalize token pasted from dashboard (quotes, accidental key prefix, etc.) */
export function getUploadThingToken(): string | undefined {
  const raw = process.env.UPLOADTHING_TOKEN?.trim();
  if (!raw) return undefined;

  let token = raw;
  if (token.startsWith("UPLOADTHING_TOKEN=")) {
    token = token.slice("UPLOADTHING_TOKEN=".length).trim();
  }
  if (
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith('"') && token.endsWith('"'))
  ) {
    token = token.slice(1, -1).trim();
  }

  return token.length > 0 ? token : undefined;
}

/** Whether UploadThing product image uploads are configured on this deployment. */
export function isUploadThingConfigured(): boolean {
  if (getUploadThingToken()) return true;

  // Legacy v6-style keys (deprecated; prefer UPLOADTHING_TOKEN for v7)
  return Boolean(
    process.env.UPLOADTHING_SECRET?.trim() &&
      process.env.UPLOADTHING_APP_ID?.trim()
  );
}

export function getUploadThingSetupHint(): string {
  return "Add UPLOADTHING_TOKEN from uploadthing.com/dashboard → API Keys → V7";
}
