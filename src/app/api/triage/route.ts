import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a support ticket triage assistant for an IT service desk.
Given a ticket's title and description, respond with a JSON object in this exact shape:

{
  "category": "hardware" | "software" | "network" | "access" | "other",
  "urgency": "low" | "medium" | "high" | "critical",
  "suggested_steps": ["step 1", "step 2", "step 3"]
}

Guidelines:
- "critical" means a full outage or a security issue affecting multiple people.
- "suggested_steps" should be 2 to 4 short, concrete first-response diagnostic steps.
- If the ticket is vague, make your best guess rather than refusing.`;

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const GEMINI_TIMEOUT_MS = 20 * 1000;

// Best-effort per-IP rate limit. This is an in-memory map, so it only
// throttles within a single warm serverless instance — it won't stop a
// distributed attack, but it does stop the common case of one script
// looping requests, without adding an external dependency (Upstash/KV)
// this project doesn't otherwise use.
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const requestLog = new Map<string, { windowStart: number; count: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestLog.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestLog.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many classification requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let title: unknown;
  let description: unknown;
  try {
    const body = await request.json();
    title = body?.title;
    description = body?.description;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof title !== "string" || typeof description !== "string" || !title.trim() || !description.trim()) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }
  if (title.length > MAX_TITLE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `title must be ${MAX_TITLE_LENGTH} characters or fewer, description ${MAX_DESCRIPTION_LENGTH} or fewer` },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Title: ${title}\n\nDescription: ${description}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }),
        signal: timeoutController.signal,
      }
    );

    if (!res.ok) {
      const details = await res.text();
      console.error("Gemini API error:", details);
      return NextResponse.json(
        { error: "AI classification failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json(JSON.parse(rawText));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "AI classification timed out" }, { status: 504 });
    }
    console.error("triage error:", error);
    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
