import { PrismaClient, UserRole, SubscriptionStatus, AvatarIdentity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Limpiar datos existentes en orden de integridad referencial
  await prisma.oralExamAttempt.deleteMany();
  await prisma.oralExamConfig.deleteMany();
  await prisma.diagnosticAttempt.deleteMany();
  await prisma.lessonUnlock.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. Hash de contraseña unificada
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 3. Crear Configuración del Sistema (Créditos por diagnóstico inicial)
  await prisma.systemSetting.create({
    data: {
      key: 'DEFAULT_DIAGNOSTIC_CREDITS',
      value: '3',
      description: 'Cantidad de créditos gratuitos otorgados tras completar el diagnóstico inicial.',
    },
  });

  // 4. Crear Usuarios Demo
  const admin = await prisma.user.create({
    data: {
      email: 'admin@edtech.com',
      passwordHash,
      fullName: 'Administrador del Sistema',
      role: UserRole.ADMIN,
      creditsBalance: 999,
      subscriptionStatus: SubscriptionStatus.ACTIVE_SUBSCRIPTION,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@edtech.com',
      passwordHash,
      fullName: 'Prof. Roberto Gómez',
      role: UserRole.TEACHER,
      creditsBalance: 999,
      subscriptionStatus: SubscriptionStatus.ACTIVE_SUBSCRIPTION,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@edtech.com',
      passwordHash,
      fullName: 'Carlos Estudiante',
      role: UserRole.STUDENT,
      creditsBalance: 3, // 3 créditos iniciales
      subscriptionStatus: SubscriptionStatus.TRIAL_CREDITS,
      preferredAvatar: AvatarIdentity.PROF_ELENA,
    },
  });

  console.log('👤 Users seeded:');
  console.log(` - Admin: ${admin.email}`);
  console.log(` - Teacher: ${teacher.email}`);
  console.log(` - Student: ${student.email} (Credits: ${student.creditsBalance})`);

  // 5. Crear Curso 1: Inteligencia Artificial
  const course1 = await prisma.course.create({
    data: {
      title: 'Fundamentos de Inteligencia Artificial y Machine Learning',
      description: 'Aprende los principios matemáticos, algoritmos supervisados y redes neuronales desde cero.',
      published: true,
      teacherId: teacher.id,
      oralExamConfig: {
        create: {
          minPassingScore: 70,
          rubricsJson: {
            criteria: [
              { name: 'Claridad Conceptual', weight: 40, description: 'Explica la diferencia entre regresión y clasificación con precisión.' },
              { name: 'Aplicabilidad Práctica', weight: 30, description: 'Menciona casos reales y métricas de error (MSE, F1-score).' },
              { name: 'Profundidad Técnica', weight: 30, description: 'Comprende el ciclo de entrenamiento y sobreajuste.' },
            ],
            passingThreshold: 70,
          },
        },
      },
      modules: {
        create: [
          {
            title: 'Módulo 1: Introducción al Aprendizaje Automático',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: 'Qué es la Inteligencia Artificial',
                  orderIndex: 1,
                  videoResourceId: 'JMUxmLyrhSk',
                  pedagogicalContext: 'Visión general de IA, historia, test de Turing y aprendizaje automático.',
                },
                {
                  title: 'Tipos de Aprendizaje: Supervisado y No Supervisado',
                  orderIndex: 2,
                  videoResourceId: 'aircAruvnKk',
                  pedagogicalContext: 'Diferencias entre aprendizaje con etiquetas (clasificación/regresión) y clustering no supervisado.',
                },
                {
                  title: 'Evaluación de Modelos y Métricas de Rendimiento',
                  orderIndex: 3,
                  videoResourceId: 'ukzFI9rgwfU',
                  pedagogicalContext: 'Matriz de confusión, precisión, recall, F1-score y error cuadrático medio.',
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Redes Neuronales Básicas',
            orderIndex: 2,
            lessons: {
              create: [
                {
                  title: 'El Perceptrón y Funciones de Activación',
                  orderIndex: 4,
                  videoResourceId: 'ILsA4nyG7I0',
                  pedagogicalContext: 'Estructura biológica vs artificial, suma ponderada, bias y funciones ReLU y Sigmoid.',
                },
                {
                  title: 'Descenso de Gradiente y Backpropagation',
                  orderIndex: 5,
                  videoResourceId: 'Ilg3gGewQ5U',
                  pedagogicalContext: 'Optimización de pesos mediante gradiente descendente y regla de la cadena.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Crear Curso 2: Arquitectura de Software
  const course2 = await prisma.course.create({
    data: {
      title: 'Arquitectura de Software y Patrones de Diseño Modernos',
      description: 'Diseño de sistemas distribuidos, Clean Architecture, Hexagonal y patrones tácticos de DDD.',
      published: true,
      teacherId: teacher.id,
      oralExamConfig: {
        create: {
          minPassingScore: 70,
          rubricsJson: {
            criteria: [
              { name: 'Separación de Responsabilidades', weight: 40, description: 'Diferencia claramente dominio, aplicación e infraestructura.' },
              { name: 'Principios SOLID', weight: 30, description: 'Aplica inversión de dependencias y sustitución de Liskov.' },
              { name: 'Escalabilidad y Acoplamiento', weight: 30, description: 'Justifica desacoplamiento mediante contratos e interfaces.' },
            ],
            passingThreshold: 70,
          },
        },
      },
      modules: {
        create: [
          {
            title: 'Módulo 1: Fundamentos de Arquitectura Limpia',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: 'Monolitos vs Microservicios vs Monolitos Modulares',
                  orderIndex: 1,
                  videoResourceId: 'vyOzD-6fQ_8',
                  pedagogicalContext: 'Ventajas del monolito modular y cuándo migrar a servicios distribuidos.',
                },
                {
                  title: 'Clean y Hexagonal Architecture en la Práctica',
                  orderIndex: 2,
                  videoResourceId: 'CnamLnP9XkM',
                  pedagogicalContext: 'Puertos y adaptadores, regla de dependencia hacia el núcleo de dominio.',
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Patrones de Diseño Esenciales',
            orderIndex: 2,
            lessons: {
              create: [
                {
                  title: 'Patrones Creacionales: Factory y Singleton en NestJS',
                  orderIndex: 3,
                  videoResourceId: 'E43oPjR_O0M',
                  pedagogicalContext: 'Ciclo de vida de instancias e inversión de control en NestJS.',
                },
                {
                  title: 'Inyección de Dependencias y Principio IoC',
                  orderIndex: 4,
                  videoResourceId: 'OmsT8jYjE3M',
                  pedagogicalContext: 'Cómo desacoplar componentes y facilitar pruebas unitarias con mocks.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('📚 Courses seeded:');
  console.log(` - Course 1: ${course1.title} (${course1.id})`);
  console.log(` - Course 2: ${course2.title} (${course2.id})`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
