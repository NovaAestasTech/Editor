import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const isStream = url.searchParams.get('stream') === '1';
    const pathSegments = url.pathname.replace('/api/ai/', '').split('/');
    const action = pathSegments.join('/'); // e.g., "text/prompt", "text/extend"
    
    console.log('=== AI API Request ===');
    console.log('URL:', url.pathname);
    console.log('Action:', action);
    console.log('Stream:', isStream);
    console.log('Body:', JSON.stringify(body, null, 2));
    
    // Extract text and options from the request body
    // Tiptap sends: { text, tone, language, format, ...textOptions }
    const { text, tone, language, format, ...textOptions } = body;
    
    // Build a system prompt based on the action
    let systemPrompt = 'You are a helpful writing assistant. ';
    
    if (action.includes('prompt')) {
      systemPrompt += 'Follow the user\'s instructions exactly. ';
    } else if (action.includes('extend')) {
      systemPrompt += 'Expand and elaborate on the given text while maintaining its style and meaning. ';
    } else if (action.includes('shorten')) {
      systemPrompt += 'Make the text more concise while preserving key information. ';
    } else if (action.includes('fix')) {
      systemPrompt += 'Fix any spelling and grammar errors in the text. Keep the same meaning and style. ';
    } else if (action.includes('simplify')) {
      systemPrompt += 'Simplify the text to make it easier to understand. ';
    } else if (action.includes('summarize')) {
      systemPrompt += 'Provide a clear and concise summary of the text. ';
    } else if (action.includes('complete')) {
      systemPrompt += 'Complete the sentence or paragraph naturally. ';
    } else if (action.includes('translate')) {
      systemPrompt += `Translate the text to ${language || 'English'}. `;
    } else if (action.includes('tone')) {
      systemPrompt += `Rewrite the text with a ${tone || 'professional'} tone. `;
    }
    
    if (tone && !action.includes('tone')) {
      systemPrompt += `Use a ${tone} tone. `;
    }
    
    if (format === 'rich-text') {
      systemPrompt += 'You may use basic HTML formatting like <strong>, <em>, <p>, <ul>, <li>, <ol> when appropriate. ';
    } else {
      systemPrompt += 'Return plain text only, no HTML or markdown formatting. ';
    }
    
    // Construct the full prompt
    const fullPrompt = text ? `${systemPrompt}\n\nText to work with:\n${text}` : `${systemPrompt}\n\n${textOptions.prompt || ''}`;
    
    // Call Gemini API using gemini-2.5-flash (fast and capable)
    const geminiUrl = isStream 
      ? `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`
      : `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });
    
    console.log('Gemini response status:', response.status);
    console.log('Gemini response headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle streaming response - return ReadableStream<Uint8Array>
    if (isStream) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            let fullResponse = '';
            
            // Read the entire response first (Gemini streams JSON array chunks)
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;
              fullResponse += decoder.decode(value, { stream: true });
            }
            
            // Parse the complete JSON array from Gemini
            try {
              // Gemini returns an array of response objects
              const jsonArray = JSON.parse(fullResponse);
              
              // Extract and stream text from each chunk
              for (const chunk of jsonArray) {
                const textContent = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textContent) {
                  controller.enqueue(encoder.encode(textContent));
                }
              }
            } catch (parseError) {
              console.error('Failed to parse Gemini response:', parseError);
              console.log('Raw response:', fullResponse.substring(0, 500));
              
              // Try to extract text using regex as fallback
              const textMatches = fullResponse.match(/"text"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g);
              if (textMatches) {
                for (const match of textMatches) {
                  const textContent = match.replace(/"text"\s*:\s*"/, '').replace(/"$/, '');
                  // Unescape the JSON string
                  const unescaped = JSON.parse(`"${textContent}"`);
                  controller.enqueue(encoder.encode(unescaped));
                }
              }
            }
            
            controller.close();
          } catch (error) {
            console.error('Stream processing error:', error);
            controller.error(error);
          }
        }
      });
      
      // Return response.body as ReadableStream<Uint8Array> (what Tiptap expects)
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        }
      });
    }
    
    // Handle non-streaming response
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    return NextResponse.json({ result });
    
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}