# AGENTS.md - SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2 (Plataforma LMS Adaptativa con Tutoría Virtual 3D e IA)

## SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2
Ecosistema educativo inteligente de vanguardia diseñado para hiper-personalizar la formación académica del estudiante mediante rutas formativas dinámicas, gamificación con créditos/suscripción y evaluación del dominio conceptual a través de un **Docente Virtual 3D interactivo**. El sistema integra gestión académica LMS, diagnóstico de entrada dinámico sin avatar, posicionamiento adaptativo por lección, exámenes orales con gesticulación sincrónica (*lip-sync*) al término de cada curso, monetización mediante Stripe (sandbox de desarrollo) y una aplicación móvil analítica offline-first para retroalimentación docente sobre fallas estudiantiles recurrentes.

---

### Arquitectura Técnica Base (Monorepo Turborepo + pnpm)

#### 1. `apps/backend` (Monolito Modular con Clean/Hexagonal Architecture en NestJS)
- **Patrón Arquitectónico:** Monolito Modular con separación estricta por módulos de dominio:
  - `iam`: Autenticación JWT (Access/Refresh tokens), RBAC (`STUDENT`, `TEACHER`, `ADMIN`), PBAC (`CourseOwnerGuard`) y políticas de seguridad.
  - `courses`: Gestión jerárquica de Cursos ➔ Módulos ➔ Lecciones (YouTube IFrame API), metadatos pedagógicos y rúbricas.
  - `diagnostics`: Motor de preevaluación dinámica (5-15 preguntas generadas por IA) y algoritmo de posicionamiento por lección.
  - `learning-paths`: Generación, actualización y persistencia de rutas de aprendizaje adaptativas.
  - `oral-evaluations`: Gateway WebSockets (Socket.io) y Máquina de Estados Finita (FSM) para el examen oral con el avatar 3D y evaluación semántica.
  - `subscriptions`: Gestión de créditos gratuitos de acceso (3 cursos iniciales, configurable por ADMIN), control de paywall y suscripción mensual integrada con **Stripe** en modo desarrollo/sandbox (tarjeta de prueba `4242 4242 4242 4242`).
  - `teacher-analytics`: Agregación de métricas de rendimiento, análisis de notas y módulo de **Feedback Docente** para detección de fallas conceptuales recurrentes.
- **Persistencia de Datos:** **PostgreSQL** con **Prisma ORM**. Uso intensivo de tipos `JSONB` con índices `GIN` para rúbricas, estructuras de exámenes, snapshots inmutables de intentos y rutas dinámicas.
- **Motor de Inferencia Semántica (IA):** **GroqCloud (LLaMA 3)** con salida en **JSON Schema estricto (JSON mode)**, validado en backend con **Zod**, incorporando políticas de reintento con *exponential backoff* y *circuit breaker*.

#### 2. `apps/web` (Aplicación Web para Estudiantes y Profesores en React + Vite + TailwindCSS)
- **LMS Core:** Navegación jerárquica, seguimiento de progreso por lección y reproductor de video de YouTube.
- **Preevaluación Diagnóstica Inicial:**
  - Cuestionario web estructurado de 5 a 15 preguntas generadas dinámicamente por la IA a partir de los cursos y lecciones existentes en la BD.
  - **Sin presencia de avatar 3D** en esta etapa.
  - Evalúa las respuestas del estudiante y determina su punto de partida exacto (asignando el curso y la lección específica donde debe comenzar, ej. Curso 1 - Lección 3).
- **Sistema de Créditos y Suscripciones (Stripe Test):**
  - Otorga 3 créditos gratuitos al estudiante tras el diagnóstico para acceder a los siguientes 3 cursos (valor de créditos editable exclusivamente por el `ADMIN`).
  - Al agotar los créditos, activa un muro de pago para suscripción mensual procesado mediante Stripe Checkout/Elements en modo desarrollo.
- **Docente Virtual 3D Interactivo:**
  - Renderizado en **Three.js** y **@react-three/fiber** utilizando modelos Ready Player Me (`.glb`).
  - Opera **exclusivamente al finalizar cada curso** para conducir el examen oral final.
  - Orquestación mediante WebSockets (Socket.io) con los siguientes estados:
    1. `QUESTION_DELIVERY`: El avatar formula la pregunta mediante voz sintetizada (**Web Speech API - SpeechSynthesis**) con sincronización labial (*lip-sync*) en el morph target `jawOpen` vía **Web Audio API**.
    2. `STUDENT_RECORDING`: El estudiante responde verbalmente por micrófono, capturado y transcrito en tiempo real con **Web Speech API - SpeechRecognition**.
    3. `SEMANTIC_ANALYSIS`: El backend evalúa semánticamente la respuesta con GroqCloud (LLaMA 3) frente a la rúbrica pedagógica (umbral de tolerancia del 70%).
    4. `FEEDBACK_DELIVERY`: El avatar brinda retroalimentación hablada inmediata y registra el snapshot inmutable del intento.

#### 3. `apps/mobile` (Aplicación Móvil Docente en React Native con Expo)
- **Audiencia y Restricción Estricta:** Dirigida **únicamente a PROFESORES (roles `TEACHER` y `ADMIN`)**. Los estudiantes tienen el acceso restringido y son redirigidos a la plataforma web.
- **Cero Renderizado 3D:** No contiene Three.js, avatares ni interacción por voz.
- **Dashboard Analítico y Módulo de Feedback Docente:**
  - Tasas de completitud de cursos, promedios de notas en evaluaciones orales y listado detallado de estudiantes con transcripciones completas.
  - **Identificación Automática de Brechas:** Algoritmo impulsado por IA que categoriza y destaca los temas, conceptos y preguntas donde los alumnos presentan mayores fallas y errores conceptuales recurrentes, sirviendo como insumo pedagógico para el profesor.
- **Arquitectura Offline-First:** Implementada con **TanStack React Query** y persistencia en **`expo-sqlite`**, permitiendo consultar analíticas previas sin conexión y sincronizar cambios en segundo plano al recuperar conectividad.

#### 4. Principio de Autocontención (Cero `packages/`)
- **Separación Estricta:** No existe la carpeta `packages/`. Cada una de las aplicaciones (`apps/backend`, `apps/web`, `apps/mobile`) es 100% autocontenida, gestionando de forma local sus propios tipos TypeScript, contratos DTO, esquemas de validación, dependencias y configuraciones de linter/build.

---

## 0. Jerarquía de Verdad y Precedencia
1. **`docs/constitution.md`:** Ley suprema innegociable del repositorio.
2. **`specs/[NUMERO]/spec.md`:** Contrato funcional inmutable del negocio (QUÉ).
3. **`specs/[NUMERO]/plan.md`:** Arquitectura técnica, diagramas y contratos de interfaz (CÓMO).
4. **`specs/[NUMERO]/tasks.md`:** Tareas atómicas, checklists y estado del avance en disco.
5. **Código Fuente:** Implementación ejecutable en `apps/`.

---

## Comandos Esenciales (Monorepo Turborepo + pnpm)

### Dependencias e Inicialización
- **Instalar o sincronizar dependencias del monorepo:**
  ```bash
  pnpm install
  ```
- **Generar cliente de Prisma ORM:**
  ```bash
  pnpm --filter @repo/backend prisma generate
  ```
- **Aplicar migraciones a la base de datos (PostgreSQL):**
  ```bash
  pnpm --filter @repo/backend prisma migrate dev
  ```

### Ejecución y Desarrollo
- **Levantar todo el ecosistema (Backend + Web + Mobile):**
  ```bash
  pnpm dev
  ```
- **Ejecutar únicamente Backend (NestJS):**
  ```bash
  pnpm --filter @repo/backend dev
  ```
- **Ejecutar únicamente Frontend Web (React + Vite):**
  ```bash
  pnpm --filter @repo/web dev
  ```
- **Ejecutar únicamente Aplicación Móvil Docente (Expo):**
  ```bash
  pnpm --filter @repo/mobile start
  ```

### Verificación y Calidad (Obligatorio en SDD)
- **Análisis estático de código (Linter global con ESLint):**
  ```bash
  pnpm lint
  ```
- **Verificación de formateo con Prettier:**
  ```bash
  pnpm format:check
  ```
- **Suite de pruebas automatizadas completa:**
  ```bash
  pnpm test
  ```
- **Pruebas unitarias/integración por aplicación:**
  ```bash
  pnpm --filter @repo/backend test
  pnpm --filter @repo/web test
  ```
- **Limpieza de caché y artefactos de compilación:**
  ```bash
  pnpm clean
  ```

### Compilación / Build
- **Generar empaquetado para distribución en todo el monorepo:**
  ```bash
  pnpm build
  ```

---

## Diseño y Experiencia de Usuario (UX/UI)

### 1. Principio de Libertad Creativa y Visual de la IA
> **Autonomía Visual:** La IA dispone de total libertad creativa a nivel estético. No existen esquemas hiper-prescriptivos que limiten la toma de decisiones visuales. La IA decidirá de forma autónoma la paleta armónica, tipografía, espaciados, layouts, contrastes y micro-interacciones, priorizando una UX moderna, fluida y profesional.

### 2. Lineamientos de Estilo (Orientativos)
- **Filosofía Estética:** Fusión entre *Clean EdTech* (claridad estructural, alta legibilidad inspirada en Notion/Coursera) y modernidad visual interactiva (detalles en *glassmorphism*, bordes pulidos y micro-interacciones suaves).
- **Tema & Accesibilidad:** Soporte dual (Light / Dark mode persistente) con contrastes estrictos compatibles con WCAG AA.
- **Paleta Base:** Fondos neutros de alto contraste, acentos primarios en Índigo/Violeta Eléctrico, acentos secundarios en Cyan/Turquesa, y estados semánticos claros para éxito, advertencia y error.
- **Tipografía:** *Inter* / *Plus Jakarta Sans* vía Google Fonts.

---

## Reglas de Desarrollo SDD (Spec-Driven Development)

1. **Cadena Estricta SDD (No Spec, No Code):** Ninguna funcionalidad, endpoint ni componente de negocio se codifica sin una especificación previa en `specs/` con estado `Aprobada`.
2. **Ciclo de Vida Obligatorio:** Antes de tocar código ejecutable, es imperativo generar y validar `plan.md` y `tasks.md`.
3. **Protocolo de Enmienda de Specs (Spec Drift Protocol):**
   - Si durante la implementación se detecta que un requerimiento funcional (`RF-x`) es técnicamente inviable, ambiguo o incompleto, **queda prohibido alterar el código en silencio**.
   - El agente debe **DETENERSE**, explicar el hallazgo al usuario y proponer una "Enmienda a la Spec". Solo tras la aprobación y actualización de `spec.md` se ajusta el plan y el código.
4. **TASK-UPDATE GATE Innegociable:** Ninguna tarea se considera cerrada sin haber ejecutado la herramienta de edición sobre `tasks.md` mutando `- [ ]` a `- [x]` con tests al 100% en verde.
5. **Separación Estricta de Capas:** La UI jamás realiza llamadas directas a bases de datos o red; interactúa exclusivamente a través de controladores, servicios de API o casos de uso.
6. **Delimitación de Roles y Plataformas:**
   - La aplicación móvil está restringida a los roles `TEACHER` y `ADMIN` para monitoreo pedagógico y analíticas de fallas. Los estudiantes realizan su preevaluación, cursos y exámenes orales 3D en la plataforma web.
   - El avatar 3D no debe inicializarse en la preevaluación ni en lecciones cotidianas, activándose exclusivamente en la etapa de examen oral final de cada curso.
8. **Cableado E2E Obligatorio en Vistas (Cero UIs Fantasma):**
   - Todo slice o componente de interfaz debe implementar su servicio cliente de API tipado y conectarse de forma real y funcional con los endpoints del backend.
   - Queda estrictamente prohibido presentar pantallas o modales con simples `console.log`, callbacks simulados o botones inertes que no desencadenen una petición real.
9. **Estándar Universal de Feedback Visual y Observabilidad (4 Niveles):**
   - **Nivel 1 (Infraestructura):** Monitor/badge visible en tiempo real que refleje la salud del backend y la conexión con la base de datos (PostgreSQL/SQLite), alertando con banners explicativos si el servicio se cae.
   - **Nivel 2 (Negocio/Validación):** Renderizado de errores descriptivos en pantalla ante fallos HTTP (`400` validaciones, `401` credenciales, `402` paywall, `403` permisos, `409` duplicados).
   - **Nivel 3 (Éxito e Información):** Toasts y banners flotantes temporales que confirmen al usuario que sus acciones fueron persistidas con éxito.
   - **Nivel 4 (Estados de Carga):** Deshabilitación inmediata de botones para evitar envíos dobles y despliegue de spinners con texto explicativo durante llamadas asíncronas.

---

## Definición de Hecho Universal (DoD de 5 Pasos)
Antes de presentar cualquier tarea o módulo como finalizado:
1. `pnpm lint` arroja **0 errores y 0 advertencias**.
2. `pnpm test` pasa en **verde al 100%**.
3. `tasks.md` ha sido mutado físicamente con `[x]` en disco.
4. Cableado E2E y Feedback visual de 4 niveles verificado y operativo en interfaz.
5. Cero residuos temporales (sin prints de depuración, logs sucios ni stubs falsos).
