/** Whether UploadThing product image uploads are configured on this deployment. */
export function isUploadThingConfigured(): boolean {
  if (process.env.UPLOADTHING_TOKEN?.trim()) return true;
  return Boolean(
    process.env.UPLOADTHING_SECRET?.trim() &&
      process.env.UPLOADTHING_APP_ID?.trim()
  );
}
