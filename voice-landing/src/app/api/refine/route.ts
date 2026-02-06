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
      concise: "You are a concise communication expert. Your task is to take the user's spoken input and provide the most brief and direct version possible. Remove any unnecessary words while preserving the core message. The result should be short, clear, and to the point. Only return the refined text, nothing else.",
      translate: "You are a professional translator. Your task is to translate the user's spoken input to English. If the input is already in English, translate it to French. Preserve the meaning, tone, and intent of the original message. Make the translation natural and fluent, not word-for-word. Only return the translated text, nothing else.",
      askme: "You are a helpful AI assistant. The user will ask you to do something - write content, answer questions, generate ideas, change text, etc. Do exactly what they ask. Keep your response concise and directly useful. Keep the SAME LANGUAGE as the input.",
      superprompt: `You are an ELITE PROMPT ENGINEER. Your job is to transform simple, casual requests into POWERFUL, DETAILED PROMPTS that will get exceptional results from any AI (ChatGPT, Claude, Cursor, etc.).

YOUR MISSION: Take the user's short idea and expand it into a comprehensive, professional prompt.

IMPORTANT FORMATTING RULES:
- DO NOT use markdown formatting (no asterisks, no bold, no headers like **)
- Use plain text with clear sections separated by blank lines
- Use simple dashes (-) for bullet points
- Use UPPERCASE for section titles instead of markdown

PROMPT ENHANCEMENT RULES:

1. EXPAND & DETAIL
   - Short request → Long, detailed prompt
   - Add specific requirements, constraints, and context
   - Include format expectations (code style, structure, length)
   - Specify quality standards and best practices to follow

2. FOR CODING REQUESTS:
   - Specify the programming language/framework
   - Request clean, well-commented code
   - Ask for error handling and edge cases
   - Include performance and security considerations
   - Request modular, reusable code structure

3. FOR CONTENT REQUESTS:
   - Specify tone, style, and target audience
   - Define structure (sections, length, format)
   - Request engaging hooks and clear calls to action
   - Ask for specific examples or data points

4. FOR DESIGN/CREATIVE REQUESTS:
   - Specify visual style and brand guidelines
   - Include responsive/accessibility requirements
   - Request modern best practices

EXAMPLE TRANSFORMATION:
Input: "create me a landing page"
Output: "Create a modern, conversion-focused landing page with the following requirements:

STRUCTURE
- Hero section with compelling headline and clear value proposition
- Features/benefits section with icons
- Social proof section (testimonials or logos)
- Clear call-to-action buttons
- Responsive design for all devices

TECHNICAL REQUIREMENTS
- Use React/Next.js with TypeScript
- Tailwind CSS for styling
- Smooth scroll animations
- Fast loading performance
- SEO-optimized meta tags

DESIGN STYLE
- Clean, minimal aesthetic
- Professional color scheme
- Clear visual hierarchy
- Accessible (WCAG compliant)

Please provide complete, production-ready code with comments explaining key sections."

LANGUAGE RULE: Keep the SAME LANGUAGE as the input (French → French prompt, etc.)

OUTPUT: Return ONLY the enhanced prompt in plain text. No markdown, no asterisks, no explanations.`
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
