import { NextRequest, NextResponse } from 'next/server';
import AIEngine from '@/lib/AIEngine';
import { validateInput, formatResponseResult } from '@/lib/utils';
import { PersonaId } from '@/lib/personas';

export async function POST(request: NextRequest) {
  try {
    const { code, language, persona, isDemoMode } = await request.json();

    // Validate input
    const validatedCode = validateInput(code);

    // Validate persona
    const validPersonas: PersonaId[] = ['cto', 'security', 'performance', 'faang'];
    const selectedPersona = validPersonas.includes(persona as PersonaId) ? persona : 'cto';

    // Perform analysis
    const rawAnalysis = await AIEngine.analyzePR(validatedCode, selectedPersona, language, isDemoMode);

    if (!rawAnalysis) {
      return NextResponse.json(
        { error: 'Analysis failed - no response from AI engine' },
        { status: 500 }
      );
    }

    // Format the response (assuming formatResponseResult handles it properly)
    const formattedAnalysis = formatResponseResult(rawAnalysis, 'analysis');

    return NextResponse.json(formattedAnalysis);
  } catch (error: any) {
    console.error('Review analysis error:', error);

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}