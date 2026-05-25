import { NextRequest, NextResponse } from 'next/server';
import { detectFileLanguage } from '@/lib/languageDetector';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'GitHub PR URL is required' }, { status: 400 });
    }

    // Parse the URL: https://github.com/owner/repo/pull/123
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const match = url.match(regex);

    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123' }, { status: 400 });
    }

    const [, owner, repo, pullNumber] = match;

    // Fetch PR files from GitHub API
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;
    
    // Use a public PAT if available in env, otherwise rely on unauthenticated rate limits (60/hr)
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PRISM-AI-Hackathon'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      if (response.status === 403) {
         return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.' }, { status: 403 });
      }
      if (response.status === 404) {
         return NextResponse.json({ error: 'PR not found. Make sure the repository is public.' }, { status: 404 });
      }
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const files = await response.json();

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files modified in this PR.' }, { status: 400 });
    }

    // Track languages for dominant fallback
    const langCounts: Record<string, number> = {};
    const parsedFiles = [];

    for (const file of files) {
      if (!file.patch) continue;
      
      const extMatch = file.filename.match(/\.([^.]+)$/);
      const extension = extMatch ? extMatch[1].toLowerCase() : '';
      
      const diff = `--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch}\n`;
      
      const detectedLanguage = detectFileLanguage(file.filename, diff, 'plaintext');
      
      if (detectedLanguage !== 'plaintext') {
        langCounts[detectedLanguage] = (langCounts[detectedLanguage] || 0) + 1;
      }

      parsedFiles.push({
        filename: file.filename,
        extension,
        detectedLanguage,
        diff
      });
      
      if (parsedFiles.length > 50) {
        // Cap at 50 files to avoid massive payloads
        break;
      }
    }

    let dominantLanguage = 'plaintext';
    let maxCount = 0;
    for (const [lang, count] of Object.entries(langCounts)) {
      if (count > maxCount) {
        dominantLanguage = lang;
        maxCount = count;
      }
    }

    return NextResponse.json({
      owner,
      repo,
      pullNumber,
      dominantLanguage,
      files: parsedFiles
    });

  } catch (error: any) {
    console.error('GitHub fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PR data from GitHub' },
      { status: 500 }
    );
  }
}
