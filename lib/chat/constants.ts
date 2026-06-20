export const CHAT_ASSISTANT_NAME = "Ritual Guide";

/** Set to true to show the Ritual Guide chat widget on the storefront. */
export const CHAT_WIDGET_ENABLED =
  process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED === "true";

export const CHAT_WELCOME =
  "Hello — I'm your Ritual Guide. I can help you find the perfect scent, compare products, answer shipping questions, and build a gift ritual. What are you looking for today?";

export const CHAT_STORAGE_KEY = "msvee-ritual-guide-chat";

export const CHAT_SUGGESTIONS_DEFAULT = [
  "Help me pick a scent",
  "What's best for sensitive skin?",
  "Gift ideas under $30",
  "Shipping & returns",
] as const;
