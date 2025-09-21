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
      prompt: { type: 'string', required: true, maxLength: 500 },
      taskCount: { type: 'number', min: 1, max: 5, default: 3 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    const { prompt, taskCount } = validation.data;

    // AI processing with fallback
    let suggestions;
    try {
      suggestions = await AIService.generateTaskSuggestions(prompt, taskCount);
    } catch (aiError) {
      console.warn('AI service failed, using fallback:', aiError);
      suggestions = AIService.generateFallbackSuggestions(prompt, taskCount);
    }

    // Sanitize output
    const sanitizedSuggestions = suggestions.map(suggestion => 
      sanitizeOutput(suggestion)
    );

    return NextResponse.json({
      success: true,
      suggestions: sanitizedSuggestions,
      source: suggestions === AIService.generateFallbackSuggestions(prompt, taskCount) ? 'fallback' : 'ai'
    });

  } catch (error) {
    console.error('AI suggest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}