import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const docText = body.content || "";

    if (!docText || docText.trim().length === 0) {
      return NextResponse.json(
        { statements: [] },
        { status: 200 }
      );
    }

    const fullPrompt = `You are a logical analysis assistant. Analyze the given text for logical inconsistencies, contradictions, or flawed reasoning.

Return your analysis as a valid JSON array of objects. Each object should have:
- "text": a brief quote or reference to the inconsistent statement
- "description": explanation of the logical issue

If there are no logical issues, return an empty array: []

Example format:
[
  {
    "text": "The company grew by 50% while revenue decreased",
    "description": "Contradiction: Growth typically correlates with revenue increase, not decrease"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or explanation.

Text to analyze:
${docText}`;


    // Call Gemini API using gemini-2.5-flash (fast and capable)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return NextResponse.json(
        { error: "Failed to analyze content", statements: [] },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Extract the text from Gemini's response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }
    
    // Parse the JSON response
    let statements = [];
    try {
      statements = JSON.parse(cleanedText);
      if (!Array.isArray(statements)) {
        statements = [];
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedText);
      statements = [];
    }

    return NextResponse.json(
      { statements },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in cross-check endpoint:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request.", statements: [] },
      { status: 500 }
    );
  }
}