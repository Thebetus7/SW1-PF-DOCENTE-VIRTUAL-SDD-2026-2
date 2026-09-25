# @repo/mobile - Aplicación Móvil Docente Offline-First (React Native + Expo)

Aplicación móvil orientada exclusivamente a **Profesores y Administradores (`TEACHER` y `ADMIN`)** del ecosistema educativo **SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2**. Proporciona analíticas de rendimiento estudiantil, notas detalladas de exámenes orales y un módulo inteligente de feedback docente para identificar fallas conceptuales recurrentes sin necesidad de conexión a internet.

---

## 🔒 Restricción Estricta de Audiencia y Plataforma

- **Exclusivo para Profesores (`TEACHER` y `ADMIN`)**:
  - Cuenta con un componente guardia ([`MobileRoleGuard`](file:///c:/EDBERTO/ULTIMO/SW1/PROYECTO%20FINAL/SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2/apps/mobile/src/features/auth/MobileRoleGuard.tsx)) que bloquea de forma inmediata a los usuarios con rol `STUDENT`.
  - Si un estudiante intenta ingresar, se le muestra una pantalla de bloqueo explicativa informándole que la aplicación móvil está reservada para el cuerpo docente y se le instruye a ingresar a la plataforma web.
- **Cero Renderizado 3D ni Avatares**:
  - A diferencia de la versión web, esta aplicación no contiene Three.js, modelos `.glb` ni reconocimiento por voz. Su diseño es liviano, optimizado y enfocado al análisis pedagógico.

---

## 📱 Módulos y Funcionalidades Principales

1. **Dashboard de KPIs Docente (`TeacherDashboardScreen`)**:
   - Monitoreo en tiempo real de cursos activos, estudiantes evaluados, promedio general de notas y porcentaje de completitud.
   - Sincronización automática de datos con el backend.

2. **Detalle de Estudiantes y Notas (`CourseStudentsScreen`)**:
   - Listado de notas obtenidas por los estudiantes en las evaluaciones orales con el Docente Virtual 3D.
   - Acceso a transcripciones completas de las respuestas y desglose por criterios pedagógicos.

3. **Módulo de Feedback Docente y Fallas Recurrentes (`FailureHotspotsScreen`)**:
   - Algoritmo asistido por IA que agrupa y clasifica las preguntas, temas y lecciones donde los estudiantes presentan mayores dificultades conceptuales.
   - Proporciona alertas de brechas de aprendizaje y recomendaciones pedagógicas automáticas para que el profesor refuerce en sus próximas sesiones.

4. **Arquitectura Offline-First de Alta Velocidad**:
   - Implementada con **TanStack React Query** y persistencia local en **`expo-sqlite`**.
   - Garantiza tiempos de respuesta locales inferiores a **300 ms** incluso en ausencia total de conectividad, sincronizando los datos en segundo plano al recuperar la red.

---

## 📋 Requisitos Previos

- **Node.js**: `>= 20.0.0` (Recomendado v22 o v24).
- **pnpm**: `>= 9.0.0`.
- **Expo CLI / Expo Go**:
  - Para dispositivo físico: Instalar la aplicación **Expo Go** desde Google Play Store o Apple App Store.
  - Para emuladores: Android Studio (con emulador AVD configurado) o Xcode (en macOS para simulador de iOS).

---

## 🚀 Inicialización y Puesta en Marcha

### 1. Desde la raíz del monorepo

```bash
# Iniciar el servidor de empaquetado Metro de Expo
pnpm --filter @repo/mobile start
```

### 2. O directamente dentro de `apps/mobile`

```bash
cd apps/mobile

# Iniciar Expo Metro Bundler (Muestra código QR en consola)
pnpm start
```

### Opciones de ejecución:
- **Dispositivo Físico:** Escanea el código QR que aparece en la terminal con la app **Expo Go** (en Android) o con la Cámara (en iOS).
- **Emulador Android:** Presiona la tecla `a` en la terminal o ejecuta directamente:
  ```bash
  pnpm --filter @repo/mobile android
  ```
- **Simulador iOS:** Presiona la tecla `i` en la terminal o ejecuta directamente:
  ```bash
  pnpm --filter @repo/mobile ios
  ```
- **Vista Previa en Navegador Web (Preview rápido):** Presiona la tecla `w` en la terminal o ejecuta:
  ```bash
  pnpm --filter @repo/mobile web
  ```

---

## 👥 Credenciales para Pruebas en Móvil

| Usuario | Contraseña | Rol | Acceso |
| :--- | :--- | :--- | :--- |
| `teacher@edtech.com` | `Password123!` | `TEACHER` | ✅ Acceso Completo al Dashboard Docente |
| `admin@edtech.com` | `Password123!` | `ADMIN` | ✅ Acceso Completo con permisos administrativos |
| `student@edtech.com` | `Password123!` | `STUDENT` | ⛔ Acceso Bloqueado (Muestra pantalla restrictiva de guardia) |

---

## 🧪 Pruebas Automatizadas y Calidad

```bash
# Ejecutar pruebas unitarias (Vitest + React Native Testing Library)
pnpm --filter @repo/mobile test

# Análisis estático de código (ESLint)
pnpm --filter @repo/mobile lint
```

---

## 📂 Estructura de Carpetas

```
apps/mobile/
├── src/
│   ├── features/
│   │   ├── auth/          # MobileRoleGuard (restringe a TEACHER/ADMIN)
│   │   ├── analytics/     # Dashboard de métricas y módulo de hotspots de fallas
│   │   └── offline/       # Caché SQLite con expo-sqlite (< 300 ms de latencia)
│   ├── App.tsx            # Punto de entrada principal y navegación
│   └── index.ts           # Registro de aplicación Expo
├── __tests__/             # Suite de pruebas unitarias
├── eslint.config.mjs      # Configuración de ESLint plano
├── app.json               # Configuración del proyecto Expo
└── package.json           # Dependencias autocontenidas
```
