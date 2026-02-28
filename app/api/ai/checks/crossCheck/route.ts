import { Fullscreen } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";
// This is a placeholder route for the crosscheck endpoint. (this particular endpoint is )

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const docText = body.text || "";

    const fullPrompt = `    
    You are a helpful assistant. Analyze the following text for cross-checking purposes (so that the facts and claims are verified, and sections and facts don't contradict with each other): ${docText}
    
    you are to output a JSON object with the following structure:
    {
      statements: [
        {
          text: "The statement text",
          description: "A brief description of 'why' the statement is incorrect, and what is the evidence for that",
        },
      ],
    }
    `;


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
      }),
    });
    return NextResponse.json(await response.json());
  }
  catch (error) {
    console.error("Error in cross-check endpoint:", error);
    return NextResponse.json({ error: "An error occurred while processing the request." }, { status: 500 });
  }    
}