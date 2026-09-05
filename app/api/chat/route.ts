import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { parseLang } from "@/lib/i18n/langs";
import { deskCopy } from "@/lib/i18n/desk";
import { answerLocally } from "@/lib/desk/brain";
import { DESK_DATA_PART } from "@/lib/desk/cards";

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
 * Olive answers from the catalogue, FAQs, prices and routes already on
 * this site. A Vercel OIDC token in `.env.local` is enough for the AI SDK
 * to bill the gateway — that is not this desk, and this route never
 * calls a model.
 */
async function localResponse(text: string, lang: ReturnType<typeof parseLang>, path: string) {
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

  return await localResponse(userText, lang, path);
}
