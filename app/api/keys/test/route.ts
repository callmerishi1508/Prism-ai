import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 });
    }

    // Attempt a lightweight request to validate the key
    const ai = new GoogleGenAI({ apiKey });
    
    // Using a very low token count request to verify auth works
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with "OK"',
      config: {
        maxOutputTokens: 5,
        temperature: 0,
      }
    });

    if (response.text) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Validation failed' }, { status: 401 });
    }
  } catch (error: any) {
    // Ensure we do NOT log the custom API key here
    return NextResponse.json(
      { error: 'Invalid API Key' },
      { status: 401 }
    );
  }
}
