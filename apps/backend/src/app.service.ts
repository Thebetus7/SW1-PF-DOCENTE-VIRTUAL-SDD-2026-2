import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async getHealth(): Promise<{
    status: string;
    backend: string;
    database: string;
    timestamp: string;
    error?: string;
  }> {
    let databaseStatus = 'disconnected';
    let errorMessage: string | undefined = undefined;

    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch (err: any) {
        databaseStatus = 'disconnected';
        errorMessage = err.message || 'Error de conexión con PostgreSQL';
      }
    } else {
      databaseStatus = 'unknown';
    }

    return {
      status: databaseStatus === 'connected' ? 'ok' : 'degraded',
      backend: 'online',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
      ...(errorMessage ? { error: errorMessage } : {}),
    };
  }
}
