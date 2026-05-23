import { NextRequest, NextResponse } from 'next/server';
import AIEngine from '@/lib/AIEngine';

export async function POST(request: NextRequest) {
  try {
    const { code, issue } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const fix = await AIEngine.generateFix(code, issue);

    return NextResponse.json({
      fixed_code: fix.fixed_code,
      explanation: fix.explanation,
      diff: fix.diff
    });
  } catch (error) {
    console.error('Fix generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}