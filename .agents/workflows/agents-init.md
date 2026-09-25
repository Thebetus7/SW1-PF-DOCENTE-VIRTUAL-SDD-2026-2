---
description: Workflow para inicializar el archivo AGENTS.md como guía de desarrollo, arquitectura, diseño y comandos del proyecto bajo SDD
---

# Workflow: Creación de AGENTS.md (agents-init)

Vamos a generar el archivo central de directrices operativas del proyecto (`AGENTS.md`) para el asistente de IA siguiendo **Spec-Driven Development (SDD)** y estándares profesionales de ingeniería agentic con cableado de red de extremo a extremo y observabilidad obligatoria.

---

### Entrada Inicial
- **Contexto del Proyecto:** [NOMBRE_DEL_PROYECTO o descripción breve del repositorio]

---

### Instrucciones para el Asistente

1. **Ronda de Aclaraciones (Interactivo, de UNA en UNA):**
   - Si no cuentas con toda la información requerida tras analizar el workspace, haz preguntas de **UNA en UNA** para definir:
     - **Stack y arquitectura:** Framework principal, lenguaje, motor de base de datos/persistencia y patrón arquitectónico.
     - **Comandos esenciales:** Dependencias, ejecución local, linters/análisis estático, suite de pruebas y compilación/build.
     - **Preferencia estética o identidad (Opcional):** Si el usuario tiene directrices de marca. *Por defecto, la IA dispone de plena autonomía creativa a nivel visual.*
     - **Reglas del flujo SDD:** Convenciones innegociables para implementar tareas, sincronización con `specs/`, cableado E2E y feedback de errores.
   - Máximo 4 a 5 preguntas breves.

2. **Generación del Documento:**
   - Una vez resueltas las preguntas y con el visto bueno del usuario, genera o actualiza `AGENTS.md` en la raíz del proyecto.
   - Utiliza rigurosamente la siguiente estructura profesional:

```markdown
# AGENTS.md - [NOMBRE_PROYECTO] ([SUBTITULO_O_DESCRIPCION_CORTA])

## [NOMBRE_PROYECTO]
[DESCRIPCION_GENERAL_DEL_SISTEMA: Propósito, problema principal que resuelve, funcionalidades clave y flujo de datos central].

[DESCRIPCION_TECNICA_BASE: Tecnologías principales, framework, lenguaje, arquitectura modular y estrategia de persistencia de datos].

---

## 0. Jerarquía de Verdad y Precedencia
1. **`docs/constitution.md`:** Ley suprema innegociable.
2. **`specs/[NUMERO]/spec.md`:** Contrato funcional inmutable del negocio (QUÉ).
3. **`specs/[NUMERO]/plan.md`:** Arquitectura técnica y contratos de interfaz (CÓMO).
4. **`specs/[NUMERO]/tasks.md`:** Tareas atómicas y estado del avance en disco.
5. **Código Fuente:** Implementación ejecutable.

---

## Comandos Esenciales

### Dependencias e Inicialización
- **Crear / Inicializar el proyecto:**
  ```bash
  [COMANDO_INICIALIZACION]
  ```
- **Obtener o sincronizar dependencias:**
  ```bash
  [COMANDO_DEPENDENCIAS]
  ```

### Ejecución y Desarrollo
- **Ejecutar en modo debug / desarrollo:**
  ```bash
  [COMANDO_EJECUCION_DEV]
  ```
- **Listar dispositivos / entornos disponibles:**
  ```bash
  [COMANDO_LISTAR_ENTORNOS]
  ```

### Verificación y Calidad (Obligatorio en SDD)
- **Análisis estático de código (Linter):**
  ```bash
  [COMANDO_LINTER]
  ```
- **Suite de pruebas automatizadas:**
  ```bash
  [COMANDO_TESTS]
  ```
- **Limpieza de temporales y caché:**
  ```bash
  [COMANDO_CLEAN]
  ```

### Compilación / Build
- **Generar empaquetado para distribución:**
  ```bash
  [COMANDO_BUILD]
  ```

---

## Diseño y Experiencia de Usuario (UX/UI)

### 1. Principio de Libertad Creativa y Visual de la IA
> **Autonomía Visual:** La IA dispone de total libertad creativa a nivel estético. No existen esquemas hiper-prescriptivos que limiten la toma de decisiones visuales. La IA decidirá de forma autónoma la paleta armónica, tipografía, espaciados, layouts, contrastes y micro-interacciones, priorizando una UX moderna, fluida y profesional.

### 2. Lineamientos de Estilo (Orientativos)
- **Filosofía Estética:** `[ENFOQUE_ESTETICO_SUGERIDO: Ej. Dark mode elegante, glassmorphism sutil, clean minimalism, etc.]`
- **Paleta Base:** Primario `[HEX_O_NOMBRE]`, fondos con alto contraste y semántica clara para éxito, advertencia y error.
- **Tipografía:** `[NOMBRE_TIPOGRAFIA_SUGERIDA]` vía `[ORIGEN_FUENTE]`.

---

## Reglas de Desarrollo SDD (Spec-Driven Development)

1. **Cadena Estricta SDD (No Spec, No Code):** Todo cambio en el código debe originarse en una especificación en `specs/` con estado `Aprobada`.
2. **Ciclo de Vida Obligatorio:** Antes de tocar código, es imperativo generar y validar `plan.md` y `tasks.md`.
3. **Protocolo de Enmienda de Specs (Spec Drift Protocol):**
   - Si durante la implementación se detecta que un `RF-x` es técnicamente inviable, ambiguo o incompleto, **queda prohibido alterar el código en silencio**.
   - El agente debe **DETENERSE**, explicar el hallazgo al usuario y proponer una "Enmienda a la Spec". Solo tras la aprobación y actualización de `spec.md` se ajusta el plan y el código.
4. **TASK-UPDATE GATE Innegociable:** Ninguna tarea se considera cerrada sin haber ejecutado la herramienta de edición sobre `tasks.md` mutando `- [ ]` a `- [x]` con tests al 100% en verde.
5. **Separación Estricta de Capas:** La UI jamás realiza llamadas directas a bases de datos o red; interactúa exclusivamente a través de controladores, servicios de API o casos de uso.
6. **Cableado E2E Obligatorio en Vistas (Cero UIs Fantasma):**
   - Todo componente, modal o formulario de interfaz debe implementar su servicio cliente de API tipado y conectarse de forma real y funcional con los endpoints del backend.
   - Queda estrictamente prohibido presentar pantallas con simples `console.log`, callbacks simulados o botones inertes que no desencadenen una petición real.
7. **Estándar Universal de Feedback Visual y Observabilidad (4 Niveles):**
   - **Nivel 1 (Infraestructura):** Monitor/badge visible en tiempo real que refleje la salud del backend y la conexión con la base de datos (PostgreSQL/SQLite), alertando con banners explicativos si el servicio se cae.
   - **Nivel 2 (Negocio/Validación):** Renderizado de errores descriptivos en pantalla ante fallos HTTP (`400` validaciones, `401` credenciales, `402` paywall, `403` permisos, `409` duplicados).
   - **Nivel 3 (Éxito e Información):** Toasts y banners flotantes temporales que confirmen al usuario que sus acciones fueron persistidas con éxito.
   - **Nivel 4 (Estados de Carga):** Deshabilitación inmediata de botones para evitar envíos dobles y despliegue de spinners con texto explicativo durante llamadas asíncronas.

---

## Definición de Hecho Universal (DoD de 5 Pasos)
Antes de presentar cualquier tarea o módulo como finalizado:
1. `[COMANDO_LINTER]` arroja **0 errores y 0 advertencias**.
2. `[COMANDO_TESTS]` pasa en **verde al 100%**.
3. `tasks.md` ha sido mutado físicamente con `[x]` en disco.
4. Cableado E2E y Feedback visual de 4 niveles verificado y operativo en interfaz.
5. Cero residuos temporales (sin prints de depuración, logs sucios ni stubs falsos).
```

3. **Restricciones del Flujo:**
   - Espera la confirmación formal del usuario antes de guardar el archivo en el proyecto.
   - Si se trata de un proyecto existente, audita los archivos para inferir comandos antes de preguntar.
