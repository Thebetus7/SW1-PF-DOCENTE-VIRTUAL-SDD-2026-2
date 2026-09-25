# Workflow: Plan Técnico de Arquitectura e Implementación (SDD)

Guía formal para la elaboración del Plan Técnico (`plan.md`) bajo la metodología **Spec-Driven Development (SDD)**. Transforma la especificación funcional (`spec.md`) en una arquitectura ejecutable, robusta, trazable y conectada de extremo a extremo.

---

## 🎯 Objetivo del Plan Técnico

Definir el **CÓMO** técnico a partir del **QUÉ** funcional, garantizando que ninguna pantalla, componente o módulo quede aislado, sin cablear a sus endpoints reales, ni desprovisto de mecanismos visibles de feedback para el usuario ante caídas o fallas del sistema.

---

## 📐 Principios Arquitectónicos Innegociables

### 1. Principio de Cableado E2E Obligatorio (Cero UIs Fantasma)
- **Prohibición de Stubs Ciegos:** Queda terminantemente prohibido que un slice de frontend sea diseñado o aprobado con simples `console.log`, callbacks simulados o botones inertes que no desencadenen una llamada real.
- **Capa de Transporte de Red (Client API Services):** Cada vista o flujo de interfaz debe planificar explícitamente su archivo de servicio de API (`services/api.ts` o módulo equivalente), detallando el método HTTP, la URL del endpoint, los headers y el contrato de payload/respuesta tipado con TypeScript.
- **Handshake Verificable:** Todo endpoint expuesto por el backend debe contar con su correspondiente cliente consumidor en el frontend, documentado en el plan técnico antes de la fase de codificación.

### 2. Estándar Universal de Feedback Visual y Observabilidad (4 Niveles)
El plan técnico debe especificar de manera obligatoria cómo la aplicación comunicará el estado de las operaciones al usuario final a través de cuatro niveles estandarizados:

1. **Nivel 1 - Errores de Infraestructura y Desconexión (Banner/Badge Global):**
   - Detección activa de caídas del backend (HTTP 500+, `ECONNREFUSED`, timeout) o desconexión de la base de datos (PostgreSQL, SQLite, etc.).
   - Muestra obligatoria de un **Monitor o Badge de Estado en tiempo real** (indicando si la API y la BD están Online/Offline, con latencia y botón de reintento).
   - En caso de fallo crítico de red, despliegue de un banner superior visible con diagnóstico comprensible para el usuario.

2. **Nivel 2 - Errores de Negocio y Validación (Alertas Contextuales):**
   - Manejo explícito de códigos HTTP de cliente:
     - `400 Bad Request`: Mensajes de validación específicos por campo.
     - `401 Unauthorized`: *"Credenciales inválidas. Verifica tu correo y contraseña."*
     - `402 Payment Required`: Muro de pago explicativo con opciones de suscripción.
     - `403 Forbidden`: Mensaje claro de restricción de permisos o rol.
     - `409 Conflict`: *"Ya existe un registro con estos datos."*
   - Los errores deben renderizarse dentro del contexto visual del usuario (alerta destacada dentro del formulario o modal), nunca silenciados ni limitados a la consola.

3. **Nivel 3 - Notificaciones de Éxito e Información (Toasts / Banners Flotantes):**
   - Confirmación inmediata tras mutaciones exitosas (registro, inicio de sesión, guardado de avance, envío de evaluaciones).
   - Notificaciones temporales (3 a 5 segundos) no intrusivas que confirmen que la acción fue procesada y persistida satisfactoriamente.

4. **Nivel 4 - Estados de Carga (Loading States & Anti-Double Submission):**
   - Al disparar cualquier petición asíncrona, el botón de acción debe deshabilitarse de inmediato para evitar envíos duplicados.
   - Debe exhibirse un indicador animado (spinner/loader) acompañado de texto contextual descriptivo (ej: *"Guardando en la base de datos..."*, *"Iniciando sesión en el backend..."*).

---

## 📋 Estructura Obligatoria de `plan.md`

Todo documento `specs/[NUMERO]/plan.md` debe contener las siguientes secciones:

```markdown
# Plan Técnico - [NOMBRE_DEL_PROYECTO_O_MODULO]

## 1. Arquitectura Técnica y Stack
- Tecnologías seleccionadas y justificación técnica.
- Diagrama de componentes o capas (Monolito Modular, Microservicios, SPA, etc.).

## 2. Modelado de Datos y Persistencia
- Esquema de base de datos (Prisma Schema, migraciones, tablas, índices).
- Definición de tipos inmutables, auditoría y snapshots.

## 3. Matriz de Endpoints y Contratos de API
| Método | Endpoint | DTO Entrada | Respuesta HTTP | Roles Permitidos |
| :--- | :--- | :--- | :--- | :--- |
| POST | /api/v1/auth/register | RegisterDto | 201 Created / AuthResponse | Público |
| GET  | /api/v1/health        | Ninguno      | 200 OK / HealthStatus     | Público |

## 4. Capa de Integración Cliente-Servidor (Client API & Cableado E2E)
- Módulos de servicios HTTP en frontend (`src/services/api.ts`).
- Estrategia de manejo de URLs base y variables de entorno.
- Cableado directo entre cada componente de interfaz y su endpoint correspondiente.

## 5. Estrategia de Observabilidad, Errores y Feedback Visual
- Mecanismo de Health Check continuo (Backend + BD en tiempo real).
- Manejo de los 4 niveles de feedback (Infraestructura, Negocio, Toasts de Éxito, Loading States).
- Componentes de UI designados para alertas y badges de conexión.

## 6. Vertical Slices de Implementación
- Desglose secuencial de Vertical Slices atómicos, asegurando que cada slice cubra desde la BD hasta el cableado final en pantalla.

## 7. Estrategia de Testing (Pirámide de Pruebas)
- Pruebas Unitarias (Servicios, Reducers, Hooks).
- Pruebas de Integración (Controladores con BD, Componentes con API real/mockeada).
- Pruebas E2E de Flujo Completo en Navegador/Móvil.
```

---

## 🛑 Compuerta de Verificación (Plan Review Gate)

Antes de dar por aprobado el `plan.md`:
1. ¿Cada pantalla o formulario tiene asignado su endpoint y servicio de red consumidor? (Sí / No)
2. ¿Se diseñó cómo el usuario sabrá si el backend o la base de datos están caídos? (Sí / No)
3. ¿Todos los botones de acción asíncrona contemplan su estado de carga y bloqueo? (Sí / No)
4. ¿Los errores HTTP tienen un mensaje amigable y localizado para el usuario en pantalla? (Sí / No)

*Si cualquiera de estas respuestas es "No", el plan técnico debe ser corregido antes de redactar `tasks.md`.*
