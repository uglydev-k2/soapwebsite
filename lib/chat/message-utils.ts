import type { UIMessage } from "ai";
import type { ChatProductResult } from "@/lib/chat/types";

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function getMessageProducts(message: UIMessage): ChatProductResult[] {
  const products: ChatProductResult[] = [];

  for (const part of message.parts) {
    if (!part.type.startsWith("tool-")) continue;
    if (!("state" in part) || part.state !== "output-available") continue;
    if (!("output" in part) || !part.output) continue;

    const output = part.output as Record<string, unknown>;
    if (Array.isArray(output.products)) {
      for (const item of output.products) {
        if (isChatProduct(item)) products.push(item);
      }
    }
    if (output.product && isChatProduct(output.product)) {
      products.push(output.product);
    }
    if (Array.isArray(output.relatedProducts)) {
      for (const item of output.relatedProducts) {
        if (isChatProduct(item)) products.push(item);
      }
    }
  }

  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function isChatProduct(value: unknown): value is ChatProductResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "slug" in value &&
    "name" in value &&
    "url" in value
  );
}
