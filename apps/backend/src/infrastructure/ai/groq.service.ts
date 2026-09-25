import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { z } from 'zod';

export interface StructuredCompletionOptions<T> {
  prompt: string;
  systemPrompt?: string;
  schema: z.ZodSchema<T>;
  model?: string;
  mockResponse?: T;
}

@Injectable()
export class GroqInferenceService {
  private readonly logger = new Logger(GroqInferenceService.name);
  private groqClient: Groq | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== 'mock-key') {
      this.groqClient = new Groq({ apiKey });
    }
  }

  async generateStructuredCompletion<T>(options: StructuredCompletionOptions<T>): Promise<T> {
    const { prompt, systemPrompt, schema, model = 'llama-3.3-70b-versatile', mockResponse } = options;

    // Si se pasa un mock explícito o no hay cliente real configurado
    if (mockResponse) {
      return schema.parse(mockResponse);
    }

    if (!this.groqClient) {
      this.logger.warn('Groq client not initialized (missing GROQ_API_KEY). Using fallback parser.');
      throw new Error('Groq client not configured and no mock provided.');
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await this.groqClient.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: `${systemPrompt || 'You are an educational AI assistant that strictly responds in valid JSON format matching the requested schema.'}\nOutput JSON ONLY. No markdown wrappers, no backticks.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          throw new Error('Empty response received from GroqCloud');
        }

        const parsedJson = JSON.parse(rawContent);
        const validated = schema.parse(parsedJson);
        return validated;
      } catch (error: any) {
        this.logger.warn(`Groq completion attempt ${attempts} failed: ${error.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate valid structured completion after ${maxAttempts} attempts: ${error.message}`);
        }
        // Espera con backoff exponencial
        await new Promise((res) => setTimeout(res, 200 * Math.pow(2, attempts)));
      }
    }

    throw new Error('Unexpected execution end in generateStructuredCompletion');
  }
}
