import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import AIEngine from '@/lib/AIEngine';
import { validateInput, formatResponseResult } from '@/lib/utils';
import { PersonaId } from '@/lib/personas';

// Simple in-memory cache to prevent hitting Gemini API rate limits (429) during repeated demo tests
const responseCache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { code, language, persona, isDemoMode, customApiKey } = await request.json();

    // Validate input
    const validatedCode = validateInput(code);

    // Validate persona
    const validPersonas: PersonaId[] = ['cto', 'security', 'performance', 'faang'];
    const selectedPersona = validPersonas.includes(persona as PersonaId) ? persona : 'cto';

    // Create cache key based on inputs (do NOT include apiKey in cache key to avoid collisions/leaks)
    const cacheKey = crypto.createHash('sha256').update(JSON.stringify({ validatedCode, selectedPersona, language, isDemoMode })).digest('hex');
    
    // Return cached response if available
    if (responseCache.has(cacheKey)) {
      console.log(`[Cache Hit] Returning cached analysis for persona: ${selectedPersona}`);
      return NextResponse.json(responseCache.get(cacheKey));
    }

    // Perform analysis
    const rawAnalysis = await AIEngine.analyzePR(validatedCode, selectedPersona, language, isDemoMode, customApiKey);

    if (!rawAnalysis) {
      return NextResponse.json(
        { error: 'Analysis failed - no response from AI engine' },
        { status: 500 }
      );
    }

    // Format the response (assuming formatResponseResult handles it properly)
    const formattedAnalysis = formatResponseResult(rawAnalysis, 'analysis');

    // Only cache successful, non-error responses
    if (!formattedAnalysis.issues?.some((i: any) => i.title.includes('Rate Limit'))) {
      responseCache.set(cacheKey, formattedAnalysis);
    }

    return NextResponse.json(formattedAnalysis);
  } catch (error: any) {
    console.error('Review analysis error:', error);

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}