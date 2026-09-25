# Tareas de Implementación: Plataforma LMS Adaptativa con Tutoría Virtual 3D e IA (Spec 01)

> 🛑 **PROTOCOLO TASK-UPDATE GATE:**
> Ninguna tarea puede marcarse como completada (`- [x]`) únicamente en el texto de respuesta del chat.
> El agente DEBE invocar la herramienta de edición sobre este archivo físico para mutar `- [ ]` a `- [x]` 
> únicamente tras verificar que los tests asociados y el linter finalicen con 0 errores y 100% de aserciones en verde.

---

## Resumen de Trazabilidad
- **Especificación Funcional:** [specs/01-plataforma-lms-adaptativa/spec.md](file:///c:/EDBERTO/ULTIMO/SW1/PROYECTO%20FINAL/SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2/specs/01-plataforma-lms-adaptativa/spec.md)
- **Plan Técnico:** [specs/01-plataforma-lms-adaptativa/plan.md](file:///c:/EDBERTO/ULTIMO/SW1/PROYECTO%20FINAL/SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2/specs/01-plataforma-lms-adaptativa/plan.md)
- **Total Tareas:** 35 | **Pendientes:** 0 | **Completadas:** 35 (100% COMPLETADO)

---

## Fase 1: Inicialización del Monorepo y Tooling (Slice 1)
> *Objetivo: Establecer el monorepo Turborepo + pnpm con configuración autocontenida por aplicación (sin `packages/`).*

- [x] 1.1: Inicializar la raíz del monorepo con `pnpm-workspace.yaml` (configurado en `apps/*`), `turbo.json` y `package.json` raíz
  - **Cubre:** Requerimiento base de infraestructura y comandos unificados (`AGENTS.md`).
  - **Depende de:** Ninguna (Tarea inicial).
  - **Precondición:** Workspace limpio y Node.js/pnpm disponible en el entorno.
  - **Hecho cuando:** `pnpm install` en la raíz finalice con código de salida 0.

- [x] 1.2: Inicializar el scaffolding de `apps/backend` (NestJS CLI con TypeScript estricto, ESLint y Vitest/Jest local)
  - **Cubre:** Arquitectura base de backend autocontenida.
  - **Depende de:** `1.1`
  - **Precondición:** Raíz del monorepo configurada.
  - **Hecho cuando:** `pnpm --filter @repo/backend test` ejecute y pase en verde el test de sanidad inicial.

- [x] 1.3: Inicializar el scaffolding de `apps/web` (React + Vite + TailwindCSS con TypeScript y ESLint local)
  - **Cubre:** Arquitectura base de frontend web autocontenida.
  - **Depende de:** `1.1`
  - **Precondición:** Raíz del monorepo configurada.
  - **Hecho cuando:** `pnpm --filter @repo/web build` compile exitosamente sin errores de tipos.

- [x] 1.4: Inicializar el scaffolding de `apps/mobile` (Expo React Native con TypeScript y ESLint local)
  - **Cubre:** Arquitectura base de aplicación móvil autocontenida.
  - **Depende de:** `1.1`
  - **Precondición:** Raíz del monorepo configurada.
  - **Hecho cuando:** `pnpm --filter @repo/mobile lint` arroje 0 errores y 0 advertencias.

---

## Fase 2: Módulo IAM, Autenticación y Seguridad (Slice 2)
> *Objetivo: Implementar el registro con selección de roles, autenticación JWT con refresh tokens, RBAC/PBAC y soft delete.*

- [x] 2.1: Configurar Prisma ORM en `apps/backend` con modelos `User`, enums (`UserRole`, `SubscriptionStatus`) y soft delete (`deletedAt`)
  - **Cubre:** `RF-01`, `RF-05`, `ESC-1`
  - **Depende de:** `1.2`
  - **Precondición:** Contenedor o instancia de PostgreSQL accesible en `DATABASE_URL`.
  - **Hecho cuando:** `pnpm --filter @repo/backend prisma generate` genere el cliente sin errores.

- [x] 2.2: Implementar servicio de hashing seguro y generación de tokens JWT (Access de 15m y Refresh de 7d)
  - **Cubre:** `RF-01`, `RF-02`, `ESC-1`
  - **Depende de:** `2.1`
  - **Precondición:** Modelo `User` generado en Prisma.
  - **Hecho cuando:** Tests unitarios en `apps/backend/src/modules/iam/auth.service.spec.ts` validen registro, login y refresco de tokens al 100%.

- [x] 2.3: Implementar endpoints REST de IAM (`/api/v1/auth/register`, `/login`, `/refresh`, `/me`) con validación de DTOs
  - **Cubre:** `RF-01`, `RF-02`, `ESC-1`
  - **Depende de:** `2.2`
  - **Precondición:** Servicio de autenticación implementado.
  - **Hecho cuando:** Tests de integración `apps/backend/test/iam/auth.e2e-spec.ts` verifiquen códigos HTTP 201 y 200 en registro y login.

- [x] 2.4: Implementar `RolesGuard` (RBAC) y `CourseOwnerGuard` (PBAC) para protección de rutas docentes
  - **Cubre:** `RF-03`, `RF-04`, `ESC-9`
  - **Depende de:** `2.3`
  - **Precondición:** Estrategia JWT Passport activa.
  - **Hecho cuando:** Tests unitarios `apps/backend/src/modules/iam/guards/roles.guard.spec.ts` y `course-owner.guard.spec.ts` pasen en verde.

- [x] 2.5: Construir pantallas de Registro y Login en `apps/web` con selector de roles y gestión de tokens en cliente
  - **Cubre:** `HU-01`, `RF-02`, `ESC-1`
  - **Depende de:** `1.3`, `2.3`
  - **Precondición:** Endpoints de autenticación operativos.
  - **Hecho cuando:** `pnpm --filter @repo/web test` valide el flujo del formulario de autenticación sin fallos.

---

## Fase 3: LMS Core, Gestión de Contenidos y Salto Demostrativo (Slice 3)
> *Objetivo: Habilitar la creación jerárquica de cursos, módulos y lecciones con YouTube y la opción de salto demostrativo.*

- [x] 3.1: Modelar en Prisma y migrar entidades `Course`, `Module` y `Lesson` con ordenamiento e índices GIN
  - **Cubre:** `RF-06`, `RF-07`
  - **Depende de:** `2.1`
  - **Precondición:** Esquema Prisma base funcional.
  - **Hecho cuando:** `pnpm --filter @repo/backend prisma migrate dev` aplique la migración de contenidos.

- [x] 3.2: Implementar módulo `courses` en NestJS (CRUD de Cursos, Módulos y Lecciones con `CourseOwnerGuard`)
  - **Cubre:** `HU-08`, `RF-04`, `RF-06`
  - **Depende de:** `3.1`, `2.4`
  - **Precondición:** Modelos y guards de propiedad listos.
  - **Hecho cuando:** Tests `apps/backend/src/modules/courses/courses.service.spec.ts` validen creación jerárquica y denegación a no propietarios.

- [x] 3.3: Implementar seeder automatizado (`prisma/seed.ts`) con cursos y lecciones de prueba y usuarios demo
  - **Cubre:** Facilidad de pruebas integrales y verificación de datos.
  - **Depende de:** `3.2`
  - **Precondición:** Modelos de usuarios y cursos operativos.
  - **Hecho cuando:** `pnpm --filter @repo/backend prisma db seed` pueble la base de datos con 2 cursos completos y lecciones demo.

- [x] 3.4: Construir en `apps/web` el Catálogo de Cursos, vista jerárquica y Reproductor de Lecciones con YouTube IFrame
  - **Cubre:** `HU-08`, `RF-07`
  - **Depende de:** `3.2`, `1.3`
  - **Precondición:** Endpoints de cursos disponibles.
  - **Hecho cuando:** Componente `LessonPlayer.tsx` renderice el iframe de YouTube y capture el evento de completitud.

- [x] 3.5: Implementar el botón de acción "Saltar al examen oral final" en el visor de curso web
  - **Cubre:** `HU-07`, `RF-08`, `ESC-9`
  - **Depende de:** `3.4`
  - **Precondición:** Vista de curso renderizando lecciones.
  - **Hecho cuando:** Test en `apps/web/src/features/courses/CourseView.test.tsx` confirme que el botón redirige directamente a la evaluación oral sin validar lecciones previas.

- [x] 3.6: Construir en `apps/web` el panel de gestión docente `TeacherCourseManager.tsx` (creación jerárquica de cursos, módulos y lecciones asociadas a YouTube) con cableado E2E a `/api/v1/courses`
  - **Cubre:** `HU-08`, `HU-13`, `RF-06`, `ESC-13`
  - **Depende de:** `3.2`, `1.3`
  - **Precondición:** Endpoints de cursos protegidos por rol `TEACHER` disponibles en backend.
  - **Hecho cuando:** El componente permita al docente registrar cursos y añadir módulos/lecciones consumiendo la API sin UIs simuladas.

- [x] 3.7: Implementar segmentación condicional de interfaz por rol en `apps/web/src/App.tsx`, presentando el Gestor de Cursos al rol `TEACHER` y excluyendo de su vista la Preevaluación Diagnóstica y el Docente Virtual 3D
  - **Cubre:** `HU-13`, `RF-04`, `ESC-13`
  - **Depende de:** `3.6`, `2.5`
  - **Precondición:** Estado de autenticación de usuario con atributo `role` accesible en cliente.
  - **Hecho cuando:** Un usuario logueado con rol `TEACHER` vea su gestor de cursos y no tenga acceso ni visualización de las tarjetas de diagnóstico ni avatar 3D.

- [x] 3.8: Crear suite de pruebas unitarias para `TeacherCourseManager` y validación de segmentación por rol en `apps/web`
  - **Cubre:** `HU-13`, `RF-04`, `RF-06`, `ESC-13`
  - **Depende de:** `3.6`, `3.7`
  - **Precondición:** Componentes creados y cableados.
  - **Hecho cuando:** `pnpm --filter @repo/web test` ejecute con 100% de aserciones en verde para la vista del docente.

---

## Fase 4: Preevaluación Diagnóstica Dinámica y Posicionamiento Adaptativo (Slice 4)
> *Objetivo: Generar cuestionario web de 5 a 15 preguntas dinámicas vía IA (sin avatar 3D), posicionar por lección y otorgar 3 créditos.*

- [x] 4.1: Implementar cliente de GroqCloud (`GroqInferenceService`) con modelo LLaMA 3, JSON mode estricto y fallback mock para tests
  - **Cubre:** `RF-09`, `RNF-1`
  - **Depende de:** `1.2`
  - **Precondición:** API Key de GroqCloud en variables de entorno o mock activado.
  - **Hecho cuando:** Test `apps/backend/src/infrastructure/ai/groq.service.spec.ts` valide la extracción de esquemas JSON estructurados.

- [x] 4.2: Implementar generador de preevaluación diagnóstica (5-15 preguntas en base a las lecciones existentes en BD)
  - **Cubre:** `RF-09`, `RF-10`, `ESC-1`
  - **Depende de:** `4.1`, `3.1`
  - **Precondición:** Cursos y lecciones sembrados en BD.
  - **Hecho cuando:** `apps/backend/src/modules/diagnostics/diagnostics.service.spec.ts` retorne un arreglo de 5 a 15 preguntas tipadas.

- [x] 4.3: Implementar algoritmo de posicionamiento que evalúe respuestas, asigne curso/lección exacta y acredite 3 créditos
  - **Cubre:** `HU-02`, `RF-11`, `ESC-2`
  - **Depende de:** `4.2`
  - **Precondición:** Servicio de diagnósticos activo.
  - **Hecho cuando:** Test `apps/backend/test/diagnostics/positioning.spec.ts` verifique asignación a lección específica (ej. Lección 3) y balance en 3 créditos.

- [x] 4.4: Construir pantalla web de Preevaluación Diagnóstica estructurada **sin avatar 3D** en `apps/web`
  - **Cubre:** `HU-02`, `RF-10`, `ESC-1`
  - **Depende de:** `4.3`, `1.3`
  - **Precondición:** Endpoints de preevaluación operativos.
  - **Hecho cuando:** `apps/web/src/features/diagnostics/DiagnosticQuiz.test.tsx` confirme ausencia de canvas 3D y renderizado del cuestionario.

---

## Fase 5: Sistema de Créditos por Lección y Suscripción Stripe en Sandbox (Slice 5)
> *Objetivo: Descuento atómico de créditos por lección nueva, reapertura gratuita, muro de pago y suscripción con tarjeta de prueba.*

- [x] 5.1: Implementar modelo `LessonUnlock` y endpoint de acceso a lecciones con lógica atómica de deducción de créditos
  - **Cubre:** `HU-03`, `RF-12`, `RF-13`, `ESC-3`, `ESC-4`
  - **Depende de:** `3.1`, `2.1`
  - **Precondición:** Lecciones y usuarios generados.
  - **Hecho cuando:** Tests en `apps/backend/src/modules/subscriptions/lesson-access.spec.ts` validen descuento de 1 crédito en lección nueva y 0 créditos en reapertura.

- [x] 5.2: Implementar detección de balance agotado y respuesta `402 Payment Required` (Muro de Pago)
  - **Cubre:** `RF-14`, `ESC-5`
  - **Depende de:** `5.1`
  - **Precondición:** Deducción de créditos funcional.
  - **Hecho cuando:** Petición con 0 créditos y sin suscripción devuelva `{ canAccess: false, reason: 'CREDITS_EXHAUSTED' }`.

- [x] 5.3: Integrar pasarela de Stripe en modo desarrollo con simulación de tarjeta de prueba `4242 4242 4242 4242` y webhooks
  - **Cubre:** `HU-04`, `RF-15`, `ESC-5`
  - **Depende de:** `5.2`
  - **Precondición:** Servicio de suscripciones configurado con Stripe SDK y mock para tests.
  - **Hecho cuando:** Tests en `apps/backend/src/modules/subscriptions/stripe.service.spec.ts` simulen webhook y muten estado a `ACTIVE_SUBSCRIPTION`.

- [x] 5.4: Implementar endpoint administrativo para modificación de créditos iniciales (`SystemSetting`)
  - **Cubre:** `HU-12`, `RF-16`
  - **Depende de:** `5.1`
  - **Precondición:** Modelo `SystemSetting` migrado.
  - **Hecho cuando:** Test `apps/backend/test/admin/settings.e2e-spec.ts` verifique actualización del balance inicial solo para ADMIN.

- [x] 5.5: Construir en `apps/web` el Modal de Muro de Pago y checkout de suscripción con tarjeta de prueba
  - **Cubre:** `HU-04`, `RF-14`, `RF-15`, `ESC-5`
  - **Depende de:** `5.3`, `1.3`
  - **Precondición:** Endpoint de checkout de suscripción activo.
  - **Hecho cuando:** Componente `PaywallModal.test.tsx` en `apps/web` confirme desbloqueo inmediato tras ingresar la tarjeta test `4242`.

---

## Fase 6: Docente Virtual 3D y Examen Oral Interactivo (Slice 6)
> *Objetivo: Renderizado Split-Screen 60/40, selector Elena/David, gesticulación en 4 estados, Web Speech API (lip-sync), FSM WebSockets y snapshots.*

- [x] 6.1: Implementar Gateway de WebSockets (`OralEvaluationGateway`) en NestJS con FSM de estados del examen
  - **Cubre:** `RF-17`, `RF-20`, `RF-24`
  - **Depende de:** `1.2`, `2.4`
  - **Precondición:** `@nestjs/platform-socket.io` instalado y autenticación por handshake activa.
  - **Hecho cuando:** Tests en `apps/backend/test/oral-evaluations/fsm.spec.ts` validen la transición de estados sin bloqueos.

- [x] 6.2: Implementar evaluador semántico con GroqCloud contrastando respuestas con la rúbrica pedagógica (umbral 70%)
  - **Cubre:** `RF-21`, `RF-22`, `ESC-7`, `ESC-8`
  - **Depende de:** `6.1`, `4.1`
  - **Precondición:** Servicio de inferencia GroqCloud configurado.
  - **Hecho cuando:** Test `apps/backend/src/modules/oral-evaluations/semantic-evaluator.spec.ts` califique respuestas en escala 0-100 y apruebe con >= 70.

- [x] 6.3: Implementar persistencia inmutable del `OralExamAttempt` con snapshot completo de preguntas, audios y transcripciones
  - **Cubre:** `RF-24`, `RF-25`, `ESC-8`
  - **Depende de:** `6.2`
  - **Precondición:** Modelo `OralExamAttempt` migrado en Prisma.
  - **Hecho cuando:** Test de integración verifique que el intento guardado no admite mutación ni borrado.

- [x] 6.4: Configurar en `apps/web` el canvas Three.js / `@react-three/fiber` con carga de modelos Ready Player Me (`.glb`)
  - **Cubre:** `HU-05`, `RF-17`, `ESC-6`
  - **Depende de:** `1.3`
  - **Precondición:** Modelos `.glb` de Elena y David ubicados en `apps/web/public/models/`.
  - **Hecho cuando:** `TeacherAvatarCanvas.test.tsx` monte el canvas con fondo plano sin advertencias de WebGL.

- [x] 6.5: Implementar selector previo de docente (Prof. Elena con voz femenina / Prof. David con voz masculina) en `apps/web`
  - **Cubre:** `HU-06`, `RF-18`, `ESC-6`
  - **Depende de:** `6.4`
  - **Precondición:** Ambos modelos 3D disponibles.
  - **Hecho cuando:** Test verifique que la elección del alumno altera el modelo renderizado y el perfil de voz TTS en cliente.

- [x] 6.6: Implementar el sistema de gesticulación en 4 estados (Idle con respiración/parpadeo, Habla, Escucha y Feedback reactivo)
  - **Cubre:** `RF-19`, `ESC-7`, `ESC-8`
  - **Depende de:** `6.4`
  - **Precondición:** Modelo de avatar con blendshapes de Ready Player Me.
  - **Hecho cuando:** Hook `useAvatarGestures.test.ts` verifique transiciones entre `idle`, `talking`, `listening` y `feedback`.

- [x] 6.7: Implementar sincronización labial (*lip-sync*) en `jawOpen` vía Web Audio API y síntesis de voz (Web Speech API)
  - **Cubre:** `RF-19`, `RF-20`, `ESC-7`
  - **Depende de:** `6.6`
  - **Precondición:** `AudioContext` y morph target `jawOpen` vinculados.
  - **Hecho cuando:** Hook `useLipSync.test.ts` confirme modulación de apertura de boca acorde al volumen del audio.

- [x] 6.8: Construir el HUD interactivo lateral (40% de pantalla) con barra de progreso, tarjeta de pregunta, onda de audio y transcripción en vivo
  - **Cubre:** `RF-17`, `RF-20`, `RF-21`, `ESC-7`
  - **Depende de:** `6.1`, `6.7`
  - **Precondición:** Conexión Socket.io con backend activa.
  - **Hecho cuando:** Componente `OralExamHud.test.tsx` visualice onda de micrófono, subtítulos en vivo y botón de envío.

---

## Fase 7: Aplicación Móvil Docente Offline-First y Módulo de Feedback (Slice 7)
> *Objetivo: App Expo exclusiva para profesores con TanStack Query + SQLite, analítica y detección de fallas recurrentes.*

- [x] 7.1: Implementar guardia estricto de login móvil denegando el acceso a usuarios con rol `STUDENT`
  - **Cubre:** `HU-10`, `RF-03`, `ESC-10`
  - **Depende de:** `1.4`, `2.3`
  - **Precondición:** Endpoint de login disponible.
  - **Hecho cuando:** Test `apps/mobile/__tests__/auth/mobile-role-guard.test.tsx` valide bloqueo a `STUDENT` y acceso a `TEACHER`/`ADMIN`.

- [x] 7.2: Implementar módulo `teacher-analytics` en NestJS (cálculo de KPIs de curso y agregación de notas de exámenes orales)
  - **Cubre:** `HU-10`, `RF-26`
  - **Depende de:** `6.3`
  - **Precondición:** Intentos de exámenes orales persistidos en BD.
  - **Hecho cuando:** `teacher-analytics.service.spec.ts` devuelva promedios y tasas de completitud de los cursos del profesor.

- [x] 7.3: Implementar algoritmo impulsado por IA para detección y recomendación pedagógica sobre fallas conceptuales recurrentes
  - **Cubre:** `HU-10`, `RF-27`, `RF-28`, `ESC-11`
  - **Depende de:** `7.2`, `4.1`
  - **Precondición:** Datos de transcripciones y notas reprobadas (< 70%) disponibles.
  - **Hecho cuando:** Endpoint `/api/v1/analytics/courses/:id/failure-hotspots` retorne conceptos fallados y recomendación cualitativa.

- [x] 7.4: Configurar capa Offline-First en `apps/mobile` con TanStack React Query y persistencia local en `expo-sqlite`
  - **Cubre:** `HU-11`, `RF-29`, `ESC-12`, `RNF-4`
  - **Depende de:** `1.4`
  - **Precondición:** `expo-sqlite` instalado y configurado en el proyecto móvil.
  - **Hecho cuando:** Test `apps/mobile/__tests__/offline/sqlite-cache.test.ts` valide lectura de métricas sin conexión en < 300 ms.

- [x] 7.5: Construir pantallas móviles: `TeacherDashboardScreen`, `CourseStudentsScreen` y `FailureHotspotsScreen`
  - **Cubre:** `HU-10`, `HU-11`, `RF-26`, `RF-27`, `RF-28`, `ESC-11`, `ESC-12`
  - **Depende de:** `7.3`, `7.4`
  - **Precondición:** Capa offline y endpoints de analítica docentes operativos.
  - **Hecho cuando:** Tests de componentes en `apps/mobile/__tests__/screens/FailureHotspotsScreen.test.tsx` rendericen las alertas de brechas.

---

## Fase 8: QA Integral, Verificación y Cierre (DoD Universal)
> *Objetivo: Ejecutar la auditoría estricta de calidad para garantizar 0 errores de linter y 100% de tests en verde en todo el monorepo.*

- [x] 8.1: Ejecutar verificación estricta de análisis estático (`pnpm lint`) en todo el monorepo
  - **Cubre:** Principio 7 de `docs/constitution.md` y DoD de 4 pasos.
  - **Depende de:** Todas las tareas previas (`1.1` a `7.5`).
  - **Precondición:** Código implementado en `apps/backend`, `apps/web` y `apps/mobile`.
  - **Hecho cuando:** `pnpm lint` finalice con exactamente **0 errores y 0 advertencias**.

- [x] 8.2: Ejecutar la suite completa de pruebas unitarias y de integración del monorepo (`pnpm test`)
  - **Cubre:** Principio 3 de `docs/constitution.md` y DoD de 4 pasos.
  - **Depende de:** `8.1`
  - **Precondición:** Linter en 0 errores.
  - **Hecho cuando:** `pnpm test` ejecute todas las suites de prueba en verde al **100%**.

- [x] 8.3: Auditoría final de limpieza de residuos, logs y confirmación física de cierre en `tasks.md`
  - **Cubre:** Principio 3 y Protocolo TASK-UPDATE GATE.
  - **Depende de:** `8.2`
  - **Precondición:** Tests al 100% en verde.
  - **Hecho cuando:** Todas las casillas `- [ ]` en `tasks.md` hayan mutado a `- [x]` físicamente en disco y el repositorio esté listo para demostración.
