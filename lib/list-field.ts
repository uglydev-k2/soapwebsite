/** Parse comma or newline separated strings into a trimmed string array */
export function parseListField(value: string | undefined | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function formatListField(values: string[] | undefined | null): string {
  return (values ?? []).join(", ");
}
