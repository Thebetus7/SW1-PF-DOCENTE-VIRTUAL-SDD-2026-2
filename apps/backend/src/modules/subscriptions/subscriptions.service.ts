import { Injectable, NotFoundException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AccessLessonResult } from './dto/subscription.dto';
const Stripe = require('stripe');

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: any = null;

  constructor(private readonly prisma: PrismaService) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && !stripeKey.includes('mock')) {
      if (!stripeKey.startsWith('sk_test_')) {
        throw new Error('CONFIGURACIÓN INVÁLIDA: Stripe está restringido exclusivamente a modo desarrollador (sk_test_).');
      }
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-02-24.acacia',
      });
      this.logger.log('Stripe SDK inicializado con éxito exclusivamente en modo desarrollador (Sandbox).');
    }
  }

  /**
   * Intenta acceder a una lección descontando 1 crédito atómicamente si es nueva,
   * permitiendo reapertura gratuita o lanzando 402 Payment Required si no hay balance.
   */
  async accessLesson(userId: string, lessonId: string): Promise<AccessLessonResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // 1. Acceso sin restricción si tiene suscripción activa o rol ADMIN/TEACHER
    if (user.subscriptionStatus === 'ACTIVE_SUBSCRIPTION' || user.role === 'ADMIN' || user.role === 'TEACHER') {
      return {
        canAccess: true,
        reason: 'GRANTED_BY_SUBSCRIPTION',
        deductedCredits: 0,
        remainingCredits: user.creditsBalance,
        lessonId,
      };
    }

    // 2. Verificar si la lección ya fue desbloqueada previamente (Reapertura Gratuita - RF-13, ESC-4)
    const existingUnlock = await this.prisma.lessonUnlock.findUnique({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId,
        },
      },
    });

    if (existingUnlock) {
      return {
        canAccess: true,
        reason: 'REOPENED_FREE',
        deductedCredits: 0,
        remainingCredits: user.creditsBalance,
        lessonId,
      };
    }

    // 3. Si no está desbloqueada y tiene 0 créditos -> Muro de Pago 402 (RF-14, ESC-5)
    if (user.creditsBalance <= 0) {
      throw new HttpException(
        {
          canAccess: false,
          reason: 'CREDITS_EXHAUSTED',
          message: 'Créditos agotados. Suscríbete para continuar accediendo a las lecciones.',
        },
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    // 4. Descontar 1 crédito atómicamente y registrar desbloqueo (RF-12, ESC-3)
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalance: { decrement: 1 },
        },
      });

      await tx.lessonUnlock.create({
        data: {
          studentId: userId,
          lessonId,
        },
      });

      return updatedUser;
    });

    return {
      canAccess: true,
      reason: 'CREDIT_DEDUCTED',
      deductedCredits: 1,
      remainingCredits: result.creditsBalance,
      lessonId,
    };
  }

  /**
   * Crea una sesión de Checkout en Stripe en modo desarrollo/sandbox
   */
  async createCheckoutSession(userId: string, successUrl?: string, cancelUrl?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Si Stripe no está inicializado o en test offline
    if (!this.stripe) {
      return {
        checkoutUrl: `https://checkout.stripe.test/pay/mock_session_${userId}`,
        sessionId: `cs_test_mock_${Date.now()}`,
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Suscripción Mensual LMS con Docente Virtual 3D',
                description: 'Acceso ilimitado a todos los cursos y evaluaciones orales interactivas.',
              },
              unit_amount: 1999, // $19.99 USD
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        success_url: successUrl || 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl || 'http://localhost:5173/catalog',
        metadata: { userId },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (err: any) {
      this.logger.error(`Error creating Stripe checkout session: ${err.message}`);
      // Fallback para desarrollo seguro
      return {
        checkoutUrl: `https://checkout.stripe.test/pay/sandbox_${userId}`,
        sessionId: `cs_test_fallback_${Date.now()}`,
      };
    }
  }

  /**
   * Activa la suscripción para el usuario (usado por Webhook o simulación de tarjeta test 4242)
   */
  async activateSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'ACTIVE_SUBSCRIPTION',
        },
      });

      await tx.subscription.create({
        data: {
          studentId: userId,
          status: 'ACTIVE_SUBSCRIPTION',
          currentPeriodEnd: nextMonth,
        },
      });

      return u;
    });

    return {
      success: true,
      subscriptionStatus: updated.subscriptionStatus,
      userId: updated.id,
    };
  }

  /**
   * Actualiza parámetros del sistema por el ADMIN (HU-05, RF-16, ESC-6)
   */
  async updateSystemSetting(key: string, value: string) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    return setting;
  }

  async getSystemSettings() {
    return this.prisma.systemSetting.findMany();
  }
}
