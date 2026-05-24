import { NextResponse } from 'next/server';
import AIEngine from '@/lib/AIEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, issues, persona, language, customApiKey, isAlternative, previousRepairedCode } = body;

    if (!code || !issues || !persona) {
      return NextResponse.json({ error: 'Missing required fields (code, issues, persona)' }, { status: 400 });
    }

    const result = await AIEngine.generateRepairedVersion(code, issues, persona, language, customApiKey, isAlternative, previousRepairedCode);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Repair API Error:', error);
    return NextResponse.json({ error: 'Failed to generate repaired version', stack: error.stack, message: error.message }, { status: 500 });
  }
}
