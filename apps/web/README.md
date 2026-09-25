# @repo/web - Plataforma Web Educativa Adaptativa (React + Vite + Three.js)

Aplicación web para estudiantes y profesores del ecosistema **SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2**. Incluye catálogo de cursos interactivo, reproductor de lecciones en video, cuestionario diagnóstico sin avatar, sistema de paywall con Stripe Sandbox y el **Docente Virtual 3D interactivo** para exámenes orales finales con modulación labial sincrónica.

---

## ✨ Características y Módulos Principales

La aplicación es 100% autocontenida en `apps/web` y cuenta con las siguientes funcionalidades:

1. **Catálogo y Reproductor LMS (`LessonPlayer` & `CourseView`)**:
   - Navegación jerárquica de Cursos ➔ Módulos ➔ Lecciones.
   - Integración fluida con la API de YouTube IFrame.
   - Botón directo para saltar al **Examen Oral Final con el Docente Virtual 3D** una vez completadas las lecciones o para fines de evaluación inmediata.

2. **Preevaluación Diagnóstica Inicial (`DiagnosticQuiz`)**:
   - Cuestionario dinámico de 5 a 15 preguntas generadas por IA a partir de las lecciones existentes.
   - **Estrictamente sin presencia de avatar 3D** en esta etapa.
   - Al finalizar, posiciona adaptativamente al estudiante en el curso y lección exacta que le corresponde y le otorga sus 3 créditos gratuitos.

3. **Muro de Pago y Suscripciones (`PaywallModal`)**:
   - Se activa ante balance de créditos agotado (`HTTP 402 Payment Required`).
   - Permite desbloquear el acceso ilimitado mediante la simulación de pago en **Stripe Sandbox** utilizando la tarjeta de prueba: `4242 4242 4242 4242`.

4. **Docente Virtual 3D Interactivo (`TeacherAvatarCanvas` & `OralExamHUD`)**:
   - **Renderizado 3D**: Construido con **Three.js** y **@react-three/fiber**, empleando modelos Ready Player Me (`.glb`) en plano medio (*half-body*) sobre fondo limpio y estética premium.
   - **Selector de Docente**: Alternancia dinámica entre la **Profesora Elena** y el **Profesor David**.
   - **4 Estados de Gesticulación**: Sincronización visual con el Gateway de WebSockets (`QUESTION_DELIVERY`, `STUDENT_RECORDING`, `SEMANTIC_ANALYSIS`, `FEEDBACK_DELIVERY`).
   - **Lip-Sync Sincrónico**: Modulación en tiempo real del morph target `jawOpen` a través de la **Web Audio API** y síntesis de voz con **Web Speech API** (`SpeechSynthesis`).
   - **Captura Verbal**: Transcripción de voz en tiempo real con **Web Speech API** (`SpeechRecognition`).

---

## 📋 Requisitos Previos

- **Node.js**: `>= 20.0.0` (Recomendado v22 o v24).
- **pnpm**: `>= 9.0.0`.
- **Backend Activo**: Debe estar ejecutándose en `http://localhost:3000` con el prefijo `/api/v1` y WebSocket en el puerto 3000.
- **Navegador Compatible**: Google Chrome, Microsoft Edge o navegadores modernos basados en Chromium con soporte para **Web Speech API** y **WebGL**.

---

## 🚀 Inicialización y Puesta en Marcha

### 1. Desde la raíz del monorepo

```bash
# Iniciar servidor de desarrollo con Vite
pnpm --filter @repo/web dev
```

### 2. O directamente dentro de `apps/web`

```bash
cd apps/web

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible de inmediato en:
👉 **`http://localhost:5173`**

---

## 🧪 Pruebas Automatizadas y Calidad

El proyecto incluye tests con **Vitest** y **React Testing Library** que cubren el ciclo de vida de los componentes, hooks de lip-sync y gesticulación del avatar:

```bash
# Ejecutar suite de pruebas unitarias
pnpm --filter @repo/web test

# Análisis estático de código (ESLint)
pnpm --filter @repo/web lint
```

---

## 📦 Compilación para Producción

```bash
# Verificar tipos de TypeScript y generar bundle optimizado en dist/
pnpm --filter @repo/web build

# Previsualizar el bundle de producción localmente
pnpm --filter @repo/web preview
```

---

## 📂 Estructura de Carpetas

```
apps/web/
├── src/
│   ├── features/
│   │   ├── auth/              # Modal de login y registro con selección de roles
│   │   ├── courses/           # Catálogo, reproductor de lecciones y vista de curso
│   │   ├── diagnostics/       # Cuestionario diagnóstico adaptativo sin avatar
│   │   ├── oral-evaluation/   # Canvas Three.js, Lip-Sync (jawOpen), HUD y selector 3D
│   │   └── subscriptions/     # Modal de muro de pago y Stripe Sandbox
│   ├── App.tsx                # Orquestador visual y routing de la plataforma
│   ├── index.css              # Sistema de estilos y tokens con TailwindCSS
│   └── main.tsx               # Punto de entrada de React 18
├── eslint.config.mjs          # Configuración independiente de ESLint 9
├── vite.config.ts             # Configuración de Vite y Vitest
└── package.json               # Dependencias autocontenidas
```
