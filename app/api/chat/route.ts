import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  type UIMessage,
} from "ai";
import { parseLang } from "@/lib/i18n/langs";
import { deskCopy } from "@/lib/i18n/desk";
import { answerLocally, deskSystemPrompt } from "@/lib/desk/brain";
import { DESK_DATA_PART } from "@/lib/desk/cards";
import { deskTools } from "@/lib/desk/tools";

export const maxDuration = 60;

function lastUserText(messages: UIMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }
  return "";
}

/**
 * The desk answering from its own content.
 *
 * Streams the prose as text and the tours or routes as a `data-desk` part, so
 * the same cards render whether or not a model was involved. Without this the
 * no-gateway path — every local build, and any deploy missing the key — could
 * only return a paragraph.
 */
async function offlineResponse(text: string, lang: ReturnType<typeof parseLang>, path: string) {
  const answer = await answerLocally(text || "hello", lang, path);
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = "olive-local";
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: answer.text });
      writer.write({ type: "text-end", id });
      if (answer.tours.length || answer.routes.length || answer.followUps.length) {
        writer.write({ type: `data-${DESK_DATA_PART}`, data: answer });
      }
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function hasGateway() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    lang?: string;
    path?: string;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lang = parseLang(body.lang);
  const path = typeof body.path === "string" ? body.path.slice(0, 180) : "";
  const userText = lastUserText(messages);

  if (!userText) {
    return new Response(deskCopy(lang).emptyChat, { status: 400 });
  }

  if (!hasGateway()) {
    return await offlineResponse(userText, lang, path);
  }

  try {
    const result = streamText({
      model: process.env.AI_GATEWAY_MODEL || "openai/gpt-5.4-mini",
      system: deskSystemPrompt(lang, path),
      messages: await convertToModelMessages(messages, { ignoreIncompleteToolCalls: true }),
      tools: deskTools(lang),
      stopWhen: isStepCount(6),
    });
    return result.toUIMessageStreamResponse({
      onError: () => "The desk could not finish that reply. Try WhatsApp.",
    });
  } catch (error) {
    console.error("Desk chat failed", error);
    return await offlineResponse(userText, lang, path);
  }
}
