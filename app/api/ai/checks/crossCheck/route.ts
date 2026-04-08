import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const docText = body.content || "";

    if (!docText || docText.trim().length === 0) {
      return NextResponse.json({ statements: [] }, { status: 200 });
    }

    const fullPrompt = `You are a logical and lexical analysis assistant. Analyze the given text for:

1. Logical inconsistencies, contradictions, or flawed reasoning.
2. Lexical issues such as incorrect tense, ambiguous phrasing, inconsistent or impossible dates/timelines, and grammatical errors that affect meaning.

Return your analysis as a valid JSON array of objects.

Each object should have:
- "text": a brief quote or reference to the problematic statement
- "description": explanation of the issue (logical or lexical)

If there are no issues, return an empty array: []

Example format:
[
  {
    "text": "The company grew by 50% while revenue decreased",
    "description": "Logical contradiction: Growth typically correlates with revenue increase, not decrease"
  },
  {
    "text": "scheduled to kick off on the 15th august last year",
    "description": "Lexical/temporal inconsistency: 'upcoming project' conflicts with 'last year'"
  }
]

Output format:
Return ONLY a JSON array.

Each object:
{
  "text": "...",
  "description": "..."
}

If no issues exist, return: []

Text to analyze:
${docText}`;

    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    const response = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.1,
        top_p: 1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to analyze content", statements: [] },
        { status: 500 }
      );
    }

    const data = await response.json();

    const generatedText =
      data.choices?.[0]?.message?.content?.trim?.() || "[]";

    let cleanedText = generatedText.trim();

    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    let statements: any[] = [];
    try {
      statements = JSON.parse(cleanedText);
      if (!Array.isArray(statements)) {
        statements = [];
      }
    } catch (parseError) {
      console.error("Failed to parse Groq response:", cleanedText);
      statements = [];
    }

    return NextResponse.json({ statements }, { status: 200 });
  } catch (error) {
    console.error("Error in cross-check endpoint:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request.", statements: [] },
      { status: 500 }
    );
  }
}
