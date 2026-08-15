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

export async function POST(request: NextRequest) {
  const { title, description } = await request.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
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
    console.error("triage error:", error);
    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 502 }
    );
  }
}