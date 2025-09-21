import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/utils/ratelimit';
import { validateInput, sanitizeOutput } from '@/lib/utils/validation';
import { AIService } from '@/lib/services/AIService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Input validation
    const validation = validateInput(body, {
      text: { type: 'string', required: true, maxLength: 2000 },
      maxLength: { type: 'number', min: 50, max: 200, default: 100 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    const { text, maxLength } = validation.data;

    // AI processing with fallback
    let summary;
    try {
      summary = await AIService.summarizeText(text, maxLength);
    } catch (aiError) {
      console.warn('AI service failed, using fallback:', aiError);
      summary = AIService.generateFallbackSummary(text, maxLength);
    }

    // Sanitize output
    const sanitizedSummary = sanitizeOutput(summary);

    return NextResponse.json({
      success: true,
      summary: sanitizedSummary,
      originalLength: text.length,
      summaryLength: sanitizedSummary.length
    });

  } catch (error) {
    console.error('AI summarize error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}