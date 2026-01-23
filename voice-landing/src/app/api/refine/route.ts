import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { text, style = "professional", customPrompt } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const stylePrompts: Record<string, string> = {
      professional: "You are a professional communication expert. Your task is to take the user's spoken input (which might be messy, informal, or have grammatical errors) and provide a professional, clear, and polished version. The result should be formal, well-structured, and suitable for business communication. Only return the refined text, nothing else.",
      casual: "You are a friendly communication expert. Your task is to take the user's spoken input and provide a casual, conversational version. The result should be friendly, approachable, and natural-sounding while still being clear and grammatically correct. Only return the refined text, nothing else.",
      concise: "You are a concise communication expert. Your task is to take the user's spoken input and provide the most brief and direct version possible. Remove any unnecessary words while preserving the core message. The result should be short, clear, and to the point. Only return the refined text, nothing else."
    };

    // Use custom prompt if provided, otherwise use predefined style
    const systemPrompt = customPrompt || stylePrompts[style] || stylePrompts.professional;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const refinedText = response.choices[0].message.content;

    return NextResponse.json({ refinedText });
  } catch (error: any) {
    console.error("Refinement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine text" },
      { status: 500 }
    );
  }
}
