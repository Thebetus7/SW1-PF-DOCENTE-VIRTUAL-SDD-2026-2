# Aplicaciones del Monorepo (`apps/`)

Este directorio contiene las tres aplicaciones desacopladas y 100% autocontenidas del proyecto **SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2**, siguiendo el principio de **cero `packages/`**:

| Aplicación | Tecnología | Puerto / Destino | Descripción |
| :--- | :--- | :--- | :--- |
| **[`backend`](./backend/README.md)** | NestJS + Prisma ORM + Socket.io | `http://localhost:3000` | API REST, WebSocket Gateway, inferencia con GroqCloud LLaMA 3.3 y Stripe Sandbox. |
| **[`web`](./web/README.md)** | React + Vite + TailwindCSS + Three.js | `http://localhost:5173` | Plataforma de aprendizaje para estudiantes y profesores con Docente Virtual 3D interactivo. |
| **[`mobile`](./mobile/README.md)** | React Native + Expo + SQLite | Expo Metro Bundler | Aplicación móvil offline-first de analítica y feedback de fallas pedagógicas para profesores. |

---

## 🚀 Cómo Levantar Todo el Ecosistema

### 1. Iniciar todas las aplicaciones en paralelo (Turborepo)

Desde la raíz del repositorio:
```bash
pnpm dev
```
Esto levantará simultáneamente:
- El backend NestJS en modo observador (`watch`).
- La aplicación web en Vite.
- El servidor de empaquetado Metro de Expo para la app móvil.

### 2. O levantar cada aplicación de forma individual

```bash
# Backend (NestJS)
pnpm --filter @repo/backend dev

# Frontend Web (React + Vite)
pnpm --filter @repo/web dev

# Aplicación Móvil Docente (Expo)
pnpm --filter @repo/mobile start
```

---

## 📚 Documentación Específica por Proyecto

Para consultar los requisitos, variables de entorno, comandos de base de datos y detalles de arquitectura de cada aplicación, revisa sus respectivos archivos:
- 📖 [Documentación de Backend](./backend/README.md)
- 📖 [Documentación de Frontend Web](./web/README.md)
- 📖 [Documentación de App Móvil](./mobile/README.md)
