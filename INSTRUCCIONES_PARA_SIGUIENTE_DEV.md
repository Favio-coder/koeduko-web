# Instrucciones para Siguiente Dev - KOEDUKO

> **Leé esto antes de tocar CUALQUIER cosa.** Te ahorra preguntas.

---

## 🟢 ¿Qué está hecho?

El schema completo en español: **`convex/schema.ts`**

7 tablas definidas con:
- Tipos correctos (`v.string()`, `v.number()`, `v.id()`)
- FK con `v.id("tabla_destino")` en todas las relaciones
- Tabla **Roles** con permisos (instructor, estudiante, peer, admin)
- `usuario.rol_id` → FK **requerida** a `roles`
- Índices en cada FK para queries rápidas
- Campo `metadata: v.optional(v.any())` para extensibilidad
- Comentarios en español

---

## 🔴 ¿Qué tenés que hacer?

### 1. Crear funciones CRUD en Convex

Creá un archivo por tabla en `convex/`:

```
convex/
├── schema.ts          ← YA ESTÁ HECHO
├── roles.ts           ← crear (PRIMERO - usuarios dependen de roles)
├── instruccion.ts     ← crear
├── usuario.ts         ← crear
├── curso.ts           ← crear
├── modulos.ts         ← crear
├── materiales.ts      ← crear
└── matricula.ts       ← crear
```

### 2. Patrón para cada archivo de funciones

```typescript
// convex/usuario.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREAR
export const crear = mutation({
  args: {
    nombre: v.string(),
    genero: v.string(),
    email: v.string(),
    carrera: v.string(),
    es_st: v.optional(v.id("instruccion")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usuario", {
      ...args,
      crea: Date.now(),
    });
  },
});

// OBTENER POR ID
export const obtener = query({
  args: { id: v.id("usuario") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// LISTAR POR ÍNDICE (ejemplo: por email)
export const obtenerPorEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// LISTAR TODOS
export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("usuario").collect();
  },
});

// ACTUALIZAR
export const actualizar = mutation({
  args: {
    id: v.id("usuario"),
    nombre: v.optional(v.string()),
    genero: v.optional(v.string()),
    carrera: v.optional(v.string()),
    es_st: v.optional(v.id("instruccion")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filtrar campos undefined
    const campos = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, campos);
  },
});
```

### 3. Agregar tablas en inglés

Agregá estas tablas al `schema.ts` (NO borres las existentes):

- `sessions` — Sesiones de aprendizaje P2P
- `learning_progress` — Progreso del usuario en módulos/cursos
- `peer_connections` — Conexiones entre pares

---

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias (si no está hecho)
npm install

# Levantar Convex en dev (sincroniza schema automáticamente)
npx convex dev

# En otra terminal, levantar frontend
npm run dev
```

**Dashboard de Convex:** Se abre automáticamente con `npx convex dev` o en [dashboard.convex.dev](https://dashboard.convex.dev)

---

## ⚠️ Notas Importantes

1. **No renombres las tablas existentes** — El frontend ya puede estar conectándose
2. **`crea` siempre es `Date.now()`** — Generalo en la mutación, NO lo recibas del frontend
3. **`es_st` en usuario es OPCIONAL** — Usá `v.optional()` en el args de la mutación
4. **Los índices ya están** — Usá `.withIndex("nombre_indice", ...)` en tus queries
5. **`metadata` es para emergencias** — Si necesitás un campo nuevo rápido, usá metadata en vez de migrar

---

## 📁 Estructura del Proyecto

```
koeduko-web/
├── convex/           ← Backend (Convex)
│   ├── _generated/   ← Auto-generado por Convex (NO TOCAR)
│   └── schema.ts     ← Schema de BD (YA HECHO)
├── src/              ← Frontend (React + Vite)
├── package.json
└── vite.config.ts
```

---

## 🤝 Coordinación

- **Cuando termines las funciones CRUD**, avisá para integrar frontend
- **Si necesitás agregar un campo** a una tabla existente, consultá primero
- **Si algo no compila**, revisá que los nombres de tabla en `v.id()` matcheen con el schema

---

**Contacto:** Estamos en el mismo hackathon, preguntá en persona 😄
