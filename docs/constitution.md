# Constitución: SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2

## 0. Jerarquía Suprema de Verdad
1. **Constitución (`docs/constitution.md`):** Ley suprema innegociable.
2. **Especificación (`specs/[NUMERO]/spec.md`):** Contrato funcional inmutable (QUÉ).
3. **Plan Técnico (`specs/[NUMERO]/plan.md`):** Arquitectura y contratos de interfaz (CÓMO).
4. **Código Fuente y Tests:** Derivados ejecutables del plan y la spec.

---

## Principios Innegociables

1. **Simplicidad Radical y Anti-Sobreingeniería (KISS / YAGNI):** Cero dependencias superfluas; priorizar librerías nativas y código estándar probado.
2. **Anclaje Estricto a la Spec (No Spec, No Code):** Cero líneas de código sin un `RF-x` aprobado en `specs/`. Prohibido inventar comportamientos.
3. **Cero Deuda Oculta y Falsos Positivos:** Prohibidos mocks vacíos, `TODOs` o retornos dummy para forzar tests en verde. Todo test valida lógica real.
4. **Aislamiento de Capas y Plataformas:** La UI jamás toca la BD directamente. El Avatar 3D opera exclusivamente en el examen oral final web (prohibido en preevaluación). La app móvil es exclusiva para `TEACHER`/`ADMIN` (cero 3D).
5. **Integridad Transaccional y Snapshots Inmutables:** Evaluaciones e intentos congelan su estado en snapshots inmutables. Mutaciones atómicas con soft delete global.
6. **Seguridad y Cero Secretos:** Credenciales, JWT secrets y API keys gestionadas vía variables de entorno. Prohibido hardcodear secretos o credenciales.
7. **Calidad Determinista (DoD de 4 Pasos):** `pnpm lint` en 0 warnings y 0 errors. Cobertura de pruebas al 100% en verde antes de mutar `tasks.md` a `[x]`.
8. **Convención Idiomática:** Código, identificadores, commits y ramas estrictamente en **inglés**. UI, textos de usuario y documentación en **español**.
