import { Test, TestingModule } from '@nestjs/testing';
import { GroqInferenceService } from './groq.service';
import { z } from 'zod';

describe('GroqInferenceService', () => {
  let service: GroqInferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroqInferenceService],
    }).compile();

    service = module.get<GroqInferenceService>(GroqInferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate and parse structured output with mockResponse', async () => {
    const schema = z.object({
      status: z.string(),
      score: z.number().min(0).max(100),
      items: z.array(z.string()),
    });

    const mockData = {
      status: 'success',
      score: 85,
      items: ['alpha', 'beta'],
    };

    const result = await service.generateStructuredCompletion({
      prompt: 'Test prompt',
      schema,
      mockResponse: mockData,
    });

    expect(result).toEqual(mockData);
    expect(result.score).toBe(85);
  });

  it('should throw validation error when schema does not match', async () => {
    const schema = z.object({
      requiredField: z.string(),
      positiveNumber: z.number().positive(),
    });

    const invalidMockData = {
      requiredField: 'ok',
      positiveNumber: -10, // Invalid: must be positive
    };

    await expect(
      service.generateStructuredCompletion({
        prompt: 'Test prompt',
        schema,
        mockResponse: invalidMockData as any,
      })
    ).rejects.toThrow();
  });
});
