import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isChatEnabled, getOpenAIModel } from "@/lib/env";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import { createChatTools } from "@/lib/chat/tools";
import type { ChatPageContext } from "@/lib/chat/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (!isChatEnabled()) {
      return errorResponse("Chat is not configured", 503);
    }

    const ip = getClientIp(request);
    const limited = rateLimit(`chat:${ip}`, 24, 60_000);
    if (!limited.ok) {
      return errorResponse("Too many messages — please wait a moment.", 429);
    }

    const body = (await request.json()) as {
      messages?: UIMessage[];
      pageContext?: ChatPageContext;
    };

    const messages = body.messages ?? [];
    if (messages.length > 40) {
      return errorResponse("Conversation too long — please start fresh.", 400);
    }

    const result = streamText({
      model: openai(getOpenAIModel()),
      system: buildSystemPrompt(body.pageContext),
      messages: await convertToModelMessages(messages),
      tools: createChatTools(),
      stopWhen: stepCountIs(6),
      maxOutputTokens: 900,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[msvee:api:chat]", error);
    return errorResponse("Chat unavailable right now", 500);
  }
}

export async function GET() {
  return jsonResponse({
    enabled: isChatEnabled(),
    assistantName: "Ritual Guide",
  });
}
