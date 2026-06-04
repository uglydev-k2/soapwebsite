/** Whether UploadThing product image uploads are configured on this deployment. */
export function isUploadThingConfigured(): boolean {
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (token) return true;

  // Legacy v6-style keys (deprecated; prefer UPLOADTHING_TOKEN for v7)
  return Boolean(
    process.env.UPLOADTHING_SECRET?.trim() &&
      process.env.UPLOADTHING_APP_ID?.trim()
  );
}

export function getUploadThingSetupHint(): string {
  return "Add UPLOADTHING_TOKEN from uploadthing.com/dashboard → API Keys → V7";
}
