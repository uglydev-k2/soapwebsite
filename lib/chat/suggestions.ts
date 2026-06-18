import { CHAT_SUGGESTIONS_DEFAULT } from "@/lib/chat/constants";

export function getPageSuggestions(pathname: string): string[] {
  if (pathname.startsWith("/collections/") && pathname.split("/").length > 2) {
    return [
      "Tell me about this product",
      "What scents are available?",
      "Pair this with something else",
      "Is this good for sensitive skin?",
    ];
  }
  if (pathname.startsWith("/collections")) {
    return [
      "Help me pick a scent",
      "Best sellers for gifts",
      "What's new?",
      "Compare bar soap vs body butter",
    ];
  }
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
    return [
      "Shipping timeline?",
      "Can I add a gift note?",
      "Return policy",
      "Help me choose one more item",
    ];
  }
  if (pathname.startsWith("/gift-guide")) {
    return [
      "Gifts under $30",
      "For someone with sensitive skin",
      "Build a full ritual set",
      "What's your most popular scent?",
    ];
  }
  if (pathname.startsWith("/contact")) {
    return [
      "Where is my order?",
      "Return an item",
      "Wholesale inquiry",
      "Product recommendation",
    ];
  }
  return [...CHAT_SUGGESTIONS_DEFAULT];
}
