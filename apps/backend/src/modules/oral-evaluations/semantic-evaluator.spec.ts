import { Test, TestingModule } from '@nestjs/testing';
import { SemanticEvaluatorService } from './semantic-evaluator.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';

describe('SemanticEvaluatorService', () => {
  let service: SemanticEvaluatorService;
  let groq: any;

  beforeEach(async () => {
    groq = {
      generateStructuredCompletion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemanticEvaluatorService,
        { provide: GroqInferenceService, useValue: groq },
      ],
    }).compile();

    service = module.get<SemanticEvaluatorService>(SemanticEvaluatorService);
  });

  it('should approve student answer when score >= 70 threshold', async () => {
    groq.generateStructuredCompletion.mockResolvedValue({
      score: 85,
      passed: true,
      feedbackText: 'Excelente explicación de la arquitectura limpia y desacoplamiento.',
      detectedStrengths: ['Claridad en inversión de dependencias', 'Uso correcto de puertos y adaptadores'],
      detectedGaps: [],
    });

    const result = await service.evaluateAnswer(
      '¿Qué es la arquitectura limpia?',
      'Es un enfoque de diseño que separa el núcleo de negocio de la infraestructura mediante la regla de dependencia...',
      { criteria: [{ name: 'Separación', weight: 100 }], passingThreshold: 70 },
      70
    );

    expect(result.score).toBe(85);
    expect(result.passed).toBe(true);
    expect(result.feedbackText).toContain('Excelente');
    expect(result.detectedStrengths.length).toBeGreaterThan(0);
  });

  it('should reject student answer when score < 70 threshold', async () => {
    groq.generateStructuredCompletion.mockResolvedValue({
      score: 55,
      passed: false,
      feedbackText: 'La respuesta no explica el concepto central de inversión de dependencias.',
      detectedStrengths: ['Intención'],
      detectedGaps: ['Falta de rigor conceptual'],
    });

    const result = await service.evaluateAnswer(
      '¿Qué es la inyección de dependencias?',
      'Es cuando usas dependencias en tu código...',
      { criteria: [{ name: 'IoC', weight: 100 }], passingThreshold: 70 },
      70
    );

    expect(result.score).toBe(55);
    expect(result.passed).toBe(false);
    expect(result.detectedGaps.length).toBeGreaterThan(0);
  });
});
