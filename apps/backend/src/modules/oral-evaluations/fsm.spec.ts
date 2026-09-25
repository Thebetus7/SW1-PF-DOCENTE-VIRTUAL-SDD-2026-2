import { Test, TestingModule } from '@nestjs/testing';
import { OralEvaluationGateway } from './oral-evaluation.gateway';
import { OralEvaluationService } from './oral-evaluation.service';
import { ExamFsmState } from './dto/oral-evaluation.dto';
import { AvatarIdentity } from '@prisma/client';

describe('OralEvaluationGateway FSM State Machine', () => {
  let gateway: OralEvaluationGateway;
  let oralService: any;
  let mockSocket: any;

  beforeEach(async () => {
    mockSocket = {
      id: 'socket-test-123',
      emit: jest.fn(),
    };

    oralService = {
      getExamQuestionsForCourse: jest.fn().mockResolvedValue({
        questions: [
          { id: 'q-1', questionText: 'Pregunta 1', expectedKeyConcepts: ['test'] },
        ],
        rubric: { passingThreshold: 70 },
        minPassingScore: 70,
      }),
      evaluateTurn: jest.fn().mockResolvedValue({
        score: 85,
        passed: true,
        feedbackText: 'Muy bien respondido.',
        detectedStrengths: ['Claridad'],
        detectedGaps: [],
      }),
      persistImmutableAttempt: jest.fn().mockResolvedValue({
        attemptId: 'snap-1',
        finalScore: 85,
        passed: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OralEvaluationGateway,
        { provide: OralEvaluationService, useValue: oralService },
      ],
    }).compile();

    gateway = module.get<OralEvaluationGateway>(OralEvaluationGateway);
  });

  it('should transition to QUESTION_DELIVERY upon handleStartExam', async () => {
    await gateway.handleStartExam(mockSocket, {
      studentId: 'student-1',
      courseId: 'course-1',
      conductorAvatar: AvatarIdentity.PROF_ELENA,
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'fsm_state_change',
      expect.objectContaining({
        state: ExamFsmState.QUESTION_DELIVERY,
        questionIndex: 0,
      })
    );
  });

  it('should transition to STUDENT_RECORDING when student begins speaking', async () => {
    await gateway.handleStartExam(mockSocket, {
      studentId: 'student-1',
      courseId: 'course-1',
    });

    gateway.handleStudentRecordingStart(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'fsm_state_change',
      expect.objectContaining({
        state: ExamFsmState.STUDENT_RECORDING,
      })
    );
  });

  it('should transition through SEMANTIC_ANALYSIS and FEEDBACK_DELIVERY upon submit answer', async () => {
    await gateway.handleStartExam(mockSocket, {
      studentId: 'student-1',
      courseId: 'course-1',
    });

    await gateway.handleSubmitAnswer(mockSocket, {
      transcription: 'Mi respuesta completa y argumentada...',
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'fsm_state_change',
      expect.objectContaining({
        state: ExamFsmState.SEMANTIC_ANALYSIS,
      })
    );

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'fsm_state_change',
      expect.objectContaining({
        state: ExamFsmState.FEEDBACK_DELIVERY,
        score: 85,
        passed: true,
      })
    );
  });
});
