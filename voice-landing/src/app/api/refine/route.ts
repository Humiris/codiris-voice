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
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional communication expert. Your task is to take the user's spoken input (which might be messy, informal, or have grammatical errors) and provide a 'good version' of it. The good version should be professional, clear, and concise, while maintaining the original intent. Only return the refined text, nothing else.",
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
