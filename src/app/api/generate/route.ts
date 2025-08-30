import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function ensureApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
  return key;
}

function stripFences(text: string): string {
  // Remove common Markdown code fences if the model sends them anyway
  const fenceRegex = /^```[\s\S]*?\n([\s\S]*?)\n```\s*$/;
  const match = text.match(fenceRegex);
  if (match && match[1]) {
    return match[1];
  }
  return text;
}

export async function POST(request: Request) {
  try {
    const { prompt, language } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(ensureApiKey());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemHint =
      "You are a coding assistant. Respond with ONLY raw code, no markdown, no explanations, no comments. If the user asks for modifications, return the full updated code. Language: " +
      (language || "unspecified") +
      ".";

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemHint }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });

    const response = await result.response;
    let text = response.text();
    text = stripFences(text).trim();

    return NextResponse.json({ code: text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error generating code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


