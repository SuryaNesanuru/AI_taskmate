import { AITaskSuggestion } from '@/lib/types/task';

export class AIService {
  private static readonly API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  private static readonly API_KEY = process.env.AI_API_KEY;
  private static cache = new Map<string, any>();

  static async generateTaskSuggestions(prompt: string, count: number = 3): Promise<AITaskSuggestion[]> {
    const cacheKey = `suggestions_${prompt}_${count}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.API_KEY) {
      throw new Error('AI API key not configured');
    }

    const systemPrompt = `Generate ${count} task suggestions based on the user's request. Return a JSON array of objects with the following structure:
    {
      "title": "Task title",
      "description": "Brief task description",
      "priority": "low|medium|high",
      "tags": ["tag1", "tag2"],
      "estimatedDuration": "e.g. 30 minutes"
    }
    
    User request: ${prompt}`;

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: systemPrompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = this.parseAIResponse(data, count);
      
      // Cache for 5 minutes
      this.cache.set(cacheKey, suggestions);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return suggestions;
    } catch (error) {
      console.error('AI suggestion error:', error);
      throw error;
    }
  }

  static async summarizeText(text: string, maxLength: number = 100): Promise<string> {
    const cacheKey = `summary_${text.slice(0, 50)}_${maxLength}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.API_KEY) {
      throw new Error('AI API key not configured');
    }

    const prompt = `Summarize the following text in approximately ${maxLength} characters:\n\n${text}`;

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: Math.ceil(maxLength * 1.2), // Account for tokens
            temperature: 0.3,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = this.extractSummaryFromResponse(data);
      
      // Cache for 10 minutes
      this.cache.set(cacheKey, summary);
      setTimeout(() => this.cache.delete(cacheKey), 10 * 60 * 1000);
      
      return summary;
    } catch (error) {
      console.error('AI summarization error:', error);
      throw error;
    }
  }

  static generateFallbackSuggestions(prompt: string, count: number): AITaskSuggestion[] {
    const fallbackSuggestions: AITaskSuggestion[] = [
      {
        title: `Plan: ${prompt}`,
        description: `Break down the request into actionable steps`,
        priority: 'medium',
        tags: ['planning'],
        estimatedDuration: '30 minutes'
      },
      {
        title: `Research: ${prompt}`,
        description: `Gather information and resources needed`,
        priority: 'low',
        tags: ['research'],
        estimatedDuration: '1 hour'
      },
      {
        title: `Execute: ${prompt}`,
        description: `Take action on the main objective`,
        priority: 'high',
        tags: ['action'],
        estimatedDuration: '2 hours'
      }
    ];

    return fallbackSuggestions.slice(0, count);
  }

  static generateFallbackSummary(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length + 1 <= maxLength) {
        summary += (summary ? ' ' : '') + sentence.trim();
      } else {
        break;
      }
    }
    
    return summary + (summary.length < text.length ? '...' : '');
  }

  private static parseAIResponse(data: any, count: number): AITaskSuggestion[] {
    try {
      // This would need to be adapted based on the specific AI provider's response format
      let content = '';
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        content = data[0].generated_text;
      } else if (data.generated_text) {
        content = data.generated_text;
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, count);
        }
      }
      
      throw new Error('Could not parse AI response');
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback');
      return this.generateFallbackSuggestions('AI parsing failed', count);
    }
  }

  private static extractSummaryFromResponse(data: any): string {
    try {
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
      } else if (data.generated_text) {
        return data.generated_text.trim();
      }
      
      throw new Error('Could not extract summary from AI response');
    } catch (error) {
      console.warn('Failed to extract AI summary');
      return 'Summary unavailable';
    }
  }
}