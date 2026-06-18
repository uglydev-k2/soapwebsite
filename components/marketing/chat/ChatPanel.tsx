"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Copy,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatMarkdown, ChatTypingIndicator } from "@/components/marketing/chat/ChatMarkdown";
import { ChatProductCards } from "@/components/marketing/chat/ChatProductCards";
import { ChatSuggestions } from "@/components/marketing/chat/ChatSuggestions";
import {
  CHAT_ASSISTANT_NAME,
  CHAT_STORAGE_KEY,
  CHAT_WELCOME,
} from "@/lib/chat/constants";
import { getPageSuggestions } from "@/lib/chat/suggestions";
import { getMessageProducts, getMessageText } from "@/lib/chat/message-utils";
import { useChatUiStore } from "@/store/chatUiStore";
import { useToastStore } from "@/store/toastStore";

function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ChatWidget() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const addToast = useToastStore((s) => s.addToast);
  const { isOpen, close, toggle, hasUnread, markUnread, setNudgeShown, nudgeShown } =
    useChatUiStore();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [initialMessages] = useState(() => loadStoredMessages());
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const pageContext = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const productSlug =
      segments[0] === "collections" && segments.length === 2 ? segments[1] : undefined;
    return { pathname, productSlug };
  }, [pathname]);

  const suggestions = useMemo(() => getPageSuggestions(pathname), [pathname]);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: "msvee-ritual-guide",
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { pageContext },
    }),
    onFinish: () => {
      if (!isOpen) markUnread();
    },
    onError: () => {
      addToast("The Ritual Guide hit a snag — try again.", "error");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((json) => setEnabled(Boolean(json?.data?.enabled ?? json?.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!nudgeShown && !isOpen) {
      const timer = window.setTimeout(() => setNudgeShown(), 12000);
      return () => window.clearTimeout(timer);
    }
  }, [nudgeShown, isOpen, setNudgeShown]);

  useEffect(() => {
    if (isOpen) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, status]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setInput("");
      await sendMessage({ text: trimmed });
    },
    [isLoading, sendMessage]
  );

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    addToast("Conversation cleared");
  };

  const copyLastAssistant = async () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    await navigator.clipboard.writeText(getMessageText(lastAssistant));
    addToast("Copied to clipboard");
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Voice input is not supported in this browser", "error");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      addToast("Could not capture voice — try typing instead", "error");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const showWelcome = messages.length === 0;

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "fixed z-[120] flex flex-col overflow-hidden border border-green/15 bg-cream shadow-2xl",
              "inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-h-[min(78dvh,680px)]",
              "md:inset-x-auto md:bottom-6 md:right-6 md:h-[min(680px,82dvh)] md:w-[min(420px,calc(100vw-2rem))]"
            )}
            style={{ borderRadius: "2px" }}
            role="dialog"
            aria-label={`${CHAT_ASSISTANT_NAME} chat`}
          >
            <header className="flex items-center justify-between gap-3 border-b border-green/10 bg-green-3 px-4 py-3 text-cream">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="shrink-0 text-gold" />
                  <p className="font-serif text-lg">{CHAT_ASSISTANT_NAME}</p>
                </div>
                <p className="truncate text-xs text-cream/70">
                  Scents · gifts · ingredients · shipping
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton label="Copy last reply" onClick={copyLastAssistant}>
                  <Copy size={16} />
                </IconButton>
                <IconButton label="Clear chat" onClick={clearChat}>
                  <RotateCcw size={16} />
                </IconButton>
                <IconButton label="Close chat" onClick={close}>
                  <X size={18} />
                </IconButton>
              </div>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {enabled === false ? (
                <div className="rounded border border-green/10 bg-white p-4 text-sm text-muted">
                  <p className="font-serif text-green">Chat is setting up</p>
                  <p className="mt-2 leading-relaxed">
                    Our AI concierge will be live shortly. Meanwhile, browse{" "}
                    <Link href="/faq" className="text-terra underline">
                      FAQ
                    </Link>{" "}
                    or{" "}
                    <Link href="/contact" className="text-terra underline">
                      contact us
                    </Link>
                    .
                  </p>
                </div>
              ) : null}

              {showWelcome ? (
                <div className="rounded border border-green/10 bg-white p-4">
                  <ChatMarkdown text={CHAT_WELCOME} />
                  <div className="mt-4">
                    <ChatSuggestions
                      suggestions={suggestions}
                      onSelect={submit}
                      disabled={isLoading || enabled === false}
                    />
                  </div>
                </div>
              ) : null}

              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="rounded border border-green/10 bg-white px-3 py-2">
                    <ChatTypingIndicator />
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="text-xs text-terra">
                  Something went wrong. Please try again or email hello@mvlusciouslather.com.
                </p>
              ) : null}
            </div>

            <div className="border-t border-green/10 bg-white p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  placeholder="Ask about scents, gifts, shipping…"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submit(input);
                    }
                  }}
                  disabled={enabled === false}
                  className="max-h-28 min-h-[2.75rem] flex-1 resize-none border border-green/15 bg-cream px-3 py-2 text-sm text-green outline-none transition-colors focus:border-terra"
                  style={{ borderRadius: "2px" }}
                />
                <FooterIconButton
                  label={listening ? "Stop voice input" : "Voice input"}
                  onClick={toggleVoice}
                  active={listening}
                  disabled={enabled === false}
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </FooterIconButton>
                {isLoading ? (
                  <FooterIconButton label="Stop generating" onClick={stop}>
                    <Square size={16} />
                  </FooterIconButton>
                ) : (
                  <button
                    type="button"
                    disabled={!input.trim() || enabled === false}
                    onClick={() => void submit(input)}
                    className="inline-flex h-11 w-11 items-center justify-center bg-terra text-white transition-colors hover:bg-terra-2 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderRadius: "2px" }}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[0.65rem] text-muted">
                AI guide · Not medical advice ·{" "}
                <Link href="/contact" className="text-terra underline">
                  Talk to our team
                </Link>
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={`Open ${CHAT_ASSISTANT_NAME}`}
        className={cn(
          "fixed z-[120] flex items-center justify-center bg-green-3 text-cream shadow-xl transition-colors hover:bg-green",
          "bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 h-14 w-14 md:bottom-6 md:right-6"
        )}
        style={{ borderRadius: "999px" }}
        whileHover={reduced ? undefined : { scale: 1.04 }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && hasUnread ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-terra ring-2 ring-cream" />
        ) : null}
        {!isOpen && !nudgeShown && !hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
          </span>
        ) : null}
      </motion.button>
    </>
  );
}

function ChatBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const products = getMessageProducts(message);

  if (!text && !products.length) return null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] px-3 py-2.5",
          isUser
            ? "bg-green-3 text-cream"
            : "border border-green/10 bg-white text-green"
        )}
        style={{ borderRadius: "2px" }}
      >
        {text ? <ChatMarkdown text={text} /> : null}
        {!isUser ? <ChatProductCards products={products} /> : null}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center text-cream/80 transition-colors hover:text-cream"
    >
      {children}
    </button>
  );
}

function FooterIconButton({
  children,
  label,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border border-green/15 text-green transition-colors hover:border-terra hover:bg-terra/10 disabled:cursor-not-allowed disabled:opacity-40",
        active && "border-terra bg-terra/10 text-terra"
      )}
      style={{ borderRadius: "2px" }}
    >
      {children}
    </button>
  );
}
