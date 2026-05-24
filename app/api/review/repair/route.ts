import { NextResponse } from 'next/server';
import AIEngine from '@/lib/AIEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, issues, persona, language, customApiKey } = body;

    if (!code || !issues || !persona) {
      return NextResponse.json({ error: 'Missing required fields (code, issues, persona)' }, { status: 400 });
    }

    const result = await AIEngine.generateRepairedVersion(code, issues, persona, language, customApiKey);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Repair API Error:', error.message);
    return NextResponse.json({ error: 'Failed to generate repaired version' }, { status: 500 });
  }
}
