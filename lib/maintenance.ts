export function isMaintenanceMode(): boolean {
  const value = process.env.MAINTENANCE_MODE;
  return value === "true" || value === "1";
}

export function getMaintenanceMessage(): string {
  return (
    process.env.MAINTENANCE_MESSAGE?.trim() ||
    "We're refreshing our shop! Online orders return July 1."
  );
}
