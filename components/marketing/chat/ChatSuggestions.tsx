"use client";

import { cn } from "@/lib/utils";

export function ChatSuggestions({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  if (!suggestions.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion)}
          className={cn(
            "border border-green/15 bg-cream px-3 py-1.5 text-left text-xs text-green transition-colors",
            "hover:border-terra hover:bg-terra/10 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          style={{ borderRadius: "2px" }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
