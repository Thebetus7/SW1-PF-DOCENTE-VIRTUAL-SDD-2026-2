# @repo/backend - API REST & Gateway WebSockets (NestJS)

Monolito Modular con arquitectura limpia (Hexagonal / Clean Architecture) que da soporte al ecosistema educativo inteligente **SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2**. Gestiona la autenticación, catálogo LMS, motor de preevaluación diagnóstica con IA, evaluación semántica de exámenes orales con WebSockets, pasarela de suscripciones en Stripe Sandbox y analíticas docentes.

---

## 🏗️ Arquitectura de Módulos de Dominio

El backend está 100% autocontenido en `apps/backend` (sin dependencias de `packages/`) y estructurado en los siguientes módulos:

- **`iam`**: Autenticación JWT con rotación de tokens (Access Token 15m / Refresh Token 7d), hash seguro con `bcrypt`, control de acceso basado en roles (`RolesGuard`: `STUDENT`, `TEACHER`, `ADMIN`) y autorización basada en propiedad de cursos (`CourseOwnerGuard`).
- **`courses`**: Gestión jerárquica de Cursos ➔ Módulos ➔ Lecciones integradas con YouTube IFrame API, rúbricas pedagógicas y metadatos de aprendizaje.
- **`diagnostics`**: Motor de preevaluación adaptativa de 5 a 15 preguntas generadas dinámicamente con GroqCloud (LLaMA 3.3) y algoritmo determinista de posicionamiento por lección que acredita los 3 créditos de prueba.
- **`oral-evaluations`**: Gateway WebSockets (`Socket.io`) con Máquina de Estados Finita (FSM) para conducir el examen oral final con el Docente Virtual 3D:
  1. `QUESTION_DELIVERY`: Envío de pregunta y sincronización de voz.
  2. `STUDENT_RECORDING`: Recepción de la respuesta transcrita.
  3. `SEMANTIC_ANALYSIS`: Evaluación semántica con GroqCloud frente a rúbricas (umbral de aprobación del 70%).
  4. `FEEDBACK_DELIVERY`: Envío de retroalimentación inmediata.
  5. `COMPLETED`: Persistencia de snapshot inmutable en PostgreSQL.
- **`subscriptions`**: Control atómico de créditos (descuento de 1 crédito por lección nueva, reapertura gratuita para lecciones ya vistas, y excepción `402 Payment Required` si el balance es 0). Integración con **Stripe Checkout** restringida exclusivamente al modo desarrollador (`sk_test_...`) y panel de configuración de créditos para el `ADMIN`.
- **`teacher-analytics`**: Endpoints para la app móvil docente con KPIs de rendimiento y módulo de detección de fallas conceptuales recurrentes asistido por IA.

---

## 📋 Requisitos Previos

- **Node.js**: `>= 20.0.0` (Recomendado v22 o v24).
- **pnpm**: `>= 9.0.0`.
- **PostgreSQL**: Servidor activo en el puerto `5432`.
- **GroqCloud API Key**: Para inferencia semántica con LLaMA 3.3.
- **Stripe Secret Key**: Clave en modo desarrollador con prefijo `sk_test_`.

---

## ⚙️ Variables de Entorno (`.env`)

Crea o verifica el archivo `.env` dentro de `apps/backend/`:

```env
# Conexión a PostgreSQL (Prisma ORM)
DATABASE_URL="postgresql://usuario:password@localhost:5432/cursos-profe-virtual?schema=public"

# Seguridad y Autenticación JWT
JWT_SECRET="tu-jwt-secret-de-desarrollo"
JWT_REFRESH_SECRET="tu-jwt-refresh-secret-de-desarrollo"

# Motor de Inferencia IA (GroqCloud - LLaMA 3.3)
GROQ_API_KEY="gsk_tu_clave_de_groqcloud_aqui"

# Pasarela de Pagos Stripe (Modo desarrollo sandbox sk_test_*)
STRIPE_SECRET_KEY="sk_test_tu_clave_de_stripe_test_aqui"

# Puerto de la API
PORT=3000
```

---

## 🚀 Inicialización y Puesta en Marcha

### 1. Desde la raíz del monorepo

```bash
# Generar cliente de Prisma ORM
pnpm --filter @repo/backend prisma generate

# Aplicar migraciones en PostgreSQL
pnpm --filter @repo/backend prisma migrate dev

# Sembrar datos de prueba (Seed: Cursos, Módulos, Lecciones y Usuarios)
pnpm --filter @repo/backend prisma db seed

# Iniciar servidor en modo desarrollo (Watch mode)
pnpm --filter @repo/backend dev
```

### 2. O directamente dentro de `apps/backend`

```bash
cd apps/backend

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Sembrar la base de datos
npx prisma db seed

# Levantar servidor de desarrollo
pnpm dev
```

El servidor estará escuchando en:
- **API REST**: `http://localhost:3000/api/v1`
- **Gateway WebSockets**: `ws://localhost:3000/oral-evaluations`

---

## 👥 Credenciales de Prueba (Sembradas en BD)

Todas las cuentas vienen preconfiguradas con la contraseña: `Password123!`

| Rol | Email | Créditos Iniciales | Descripción |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@edtech.com` | Ilimitado | Acceso total, configuración de créditos del sistema |
| **`TEACHER`** | `teacher@edtech.com` | Ilimitado | Creador de cursos, acceso a App Móvil y analíticas |
| **`STUDENT`** | `student@edtech.com` | 3 créditos | Estudiante con balance inicial para preevaluación y cursos |

---

## 🧪 Pruebas Automatizadas y Calidad

```bash
# Ejecutar suite de pruebas unitarias (Jest)
pnpm --filter @repo/backend test

# Ejecutar pruebas en modo watch
pnpm --filter @repo/backend test:watch

# Análisis estático de código (ESLint)
pnpm --filter @repo/backend lint
```

---

## 📦 Compilación para Producción

```bash
# Compilar TypeScript a JavaScript optimizado en dist/
pnpm --filter @repo/backend build

# Ejecutar bundle compilado
pnpm --filter @repo/backend start:prod
```
