import { NextResponse } from "next/server";
import { z } from "zod";
import { getBindings, getDbOrNull } from "@/lib/db";
import { buildChatSystemPrompt, isAiConfigured, streamAiChat, AiUpstreamError } from "@/lib/ai";
import { buildGrounding } from "@/lib/planner";
import { getAlerts } from "@/lib/queries";
import { checkRateLimit, clientKey, isSameOrigin } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const bodySchema = z.object({
  lang: z.enum(["en", "bn"]).default("en"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(12),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const limited = await checkRateLimit(await clientKey(request, "chat"), 30, 60 * 60);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached for the AI agent. Please try again later." },
      { status: 429, headers: { "retry-after": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "That message could not be read. Please try again." }, { status: 422 });
  }

  const bindings = await getBindings();
  if (!isAiConfigured(bindings)) {
    return NextResponse.json(
      {
        code: "ai_not_configured",
        message:
          "BanglaVoyage AI needs an AI_API_KEY secret. Everything else — destinations, districts, the planner and the budget calculator — works without it.",
        setup: [
          "Add an AI_API_KEY secret in your hosting environment (Cloudflare secret or .dev.vars locally).",
          "Optionally set AI_BASE_URL for an OpenAI-compatible endpoint and AI_MODEL to choose the model.",
          "Redeploy and reload this page.",
        ],
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const db = await getDbOrNull();
  if (!db) {
    return NextResponse.json(
      { error: "The destination database is not connected, so the assistant has no grounding data." },
      { status: 503 },
    );
  }

  try {
    const [grounding, alerts] = await Promise.all([buildGrounding(db), getAlerts(db)]);
    const system = buildChatSystemPrompt(
      {
        ...grounding,
        alerts: alerts.map((alert) => ({
          title: alert.title,
          body: alert.body,
          severity: alert.severity,
          source: alert.sourceUrl,
        })),
        capabilities: {
          canBook: false,
          note: "This assistant cannot book, pay for or confirm anything.",
        },
      },
      parsed.data.lang,
    );

    const stream = await streamAiChat({
      bindings,
      messages: [
        { role: "system", content: system },
        ...parsed.data.messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      maxTokens: 900,
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AiUpstreamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The AI service is unavailable right now." }, { status: 502 });
  }
}
