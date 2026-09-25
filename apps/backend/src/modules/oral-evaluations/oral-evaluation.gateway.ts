import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OralEvaluationService } from './oral-evaluation.service';
import { ExamFsmState, OralQuestion, StudentTurnAnswer } from './dto/oral-evaluation.dto';
import { AvatarIdentity } from '@prisma/client';
import { Logger } from '@nestjs/common';

interface ActiveSession {
  studentId: string;
  courseId: string;
  conductorAvatar: AvatarIdentity;
  questions: OralQuestion[];
  rubric: any;
  minPassingScore: number;
  currentQuestionIndex: number;
  currentState: ExamFsmState;
  turns: StudentTurnAnswer[];
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OralEvaluationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OralEvaluationGateway.name);
  private activeSessions = new Map<string, ActiveSession>();

  constructor(private readonly oralService: OralEvaluationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to OralExam Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeSessions.delete(client.id);
  }

  @SubscribeMessage('start_exam')
  async handleStartExam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { studentId: string; courseId: string; conductorAvatar?: AvatarIdentity }
  ) {
    const { studentId, courseId, conductorAvatar = AvatarIdentity.PROF_ELENA } = data;

    const { questions, rubric, minPassingScore } = await this.oralService.getExamQuestionsForCourse(courseId);

    const session: ActiveSession = {
      studentId,
      courseId,
      conductorAvatar,
      questions,
      rubric,
      minPassingScore,
      currentQuestionIndex: 0,
      currentState: ExamFsmState.QUESTION_DELIVERY,
      turns: [],
    };

    this.activeSessions.set(client.id, session);

    // Notificar primer estado: QUESTION_DELIVERY
    const currentQ = questions[0];
    client.emit('fsm_state_change', {
      state: ExamFsmState.QUESTION_DELIVERY,
      question: currentQ,
      questionIndex: 0,
      totalQuestions: questions.length,
    });
  }

  @SubscribeMessage('student_recording_start')
  handleStudentRecordingStart(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (!session) return;

    session.currentState = ExamFsmState.STUDENT_RECORDING;
    client.emit('fsm_state_change', {
      state: ExamFsmState.STUDENT_RECORDING,
      questionIndex: session.currentQuestionIndex,
    });
  }

  @SubscribeMessage('submit_student_answer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transcription: string }
  ) {
    const session = this.activeSessions.get(client.id);
    if (!session) return;

    const currentQ = session.questions[session.currentQuestionIndex];

    // Transición a SEMANTIC_ANALYSIS
    session.currentState = ExamFsmState.SEMANTIC_ANALYSIS;
    client.emit('fsm_state_change', {
      state: ExamFsmState.SEMANTIC_ANALYSIS,
    });

    // Evaluar semánticamente con GroqCloud
    const evaluation = await this.oralService.evaluateTurn(
      currentQ.questionText,
      data.transcription,
      session.rubric,
      session.minPassingScore
    );

    const turn: StudentTurnAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.questionText,
      transcription: data.transcription,
      evaluation,
    };
    session.turns.push(turn);

    // Transición a FEEDBACK_DELIVERY
    session.currentState = ExamFsmState.FEEDBACK_DELIVERY;
    client.emit('fsm_state_change', {
      state: ExamFsmState.FEEDBACK_DELIVERY,
      feedbackText: evaluation.feedbackText,
      score: evaluation.score,
      passed: evaluation.passed,
      questionIndex: session.currentQuestionIndex,
    });

    // Verificar si quedan más preguntas
    session.currentQuestionIndex++;
    if (session.currentQuestionIndex < session.questions.length) {
      const nextQ = session.questions[session.currentQuestionIndex];
      // Esperar breve lapso y enviar siguiente pregunta
      setTimeout(() => {
        session.currentState = ExamFsmState.QUESTION_DELIVERY;
        client.emit('fsm_state_change', {
          state: ExamFsmState.QUESTION_DELIVERY,
          question: nextQ,
          questionIndex: session.currentQuestionIndex,
          totalQuestions: session.questions.length,
        });
      }, 3500);
    } else {
      // Concluir examen oral y persistir snapshot inmutable
      setTimeout(async () => {
        session.currentState = ExamFsmState.COMPLETED;
        const snapshot = await this.oralService.persistImmutableAttempt(
          session.studentId,
          session.courseId,
          session.conductorAvatar,
          session.turns
        );

        client.emit('fsm_state_change', {
          state: ExamFsmState.COMPLETED,
          snapshot,
        });

        this.activeSessions.delete(client.id);
      }, 3500);
    }
  }
}
