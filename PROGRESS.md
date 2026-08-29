# KOEDUKO Backend - Progress Report

## Status: [FASE 1/3] - Schema Español Completado ✅

---

### ✅ Completado

- [x] `convex/schema.ts` con 7 tablas en español
- [x] Tabla **Roles** creada (instructor, estudiante, peer, admin)
- [x] Foreign keys configuradas con `v.id()` en todas las relaciones
- [x] `usuario.rol_id` → FK requerida a `roles`
- [x] Índices de performance en TODAS las FK
- [x] Campo `metadata: v.optional(v.any())` en todas las tablas para extensibilidad
- [x] Comentarios en español documentando cada tabla y campo
- [x] Documentación para siguiente dev

### ⏳ Próximo (Otro Dev)

- [ ] Crear funciones Convex para CRUD (crear, leer, actualizar, eliminar)
- [ ] Agregar tablas en inglés (`Learning_Progress`, `Peer_Profile`, `Peer_Connections`, `Study_Sessions`, `Course_Evaluation_Criteria`)
- [ ] Validación de datos en mutaciones
- [ ] Testing de funciones en Convex Dashboard
- [ ] Integración con autenticación de Convex

### 🚫 Pendiente (Ambos Devs)

- [ ] Integración frontend con hooks de Convex (`useQuery`, `useMutation`)
- [ ] Testing end-to-end
- [ ] Preparar demo

---

### 📊 Tablas Creadas (7 total)

| # | Tabla | Propósito | Índices |
|---|-------|-----------|---------|
| 1 | `roles` | Definición de permisos (instructor, estudiante, peer, admin) | `por_nombre` |
| 2 | `instruccion` | Gestión de niveles educativos | `por_nombre` |
| 3 | `usuario` | Datos de usuarios con rol asignado | `por_email`, `por_rol_id`, `por_es_st` |
| 4 | `curso` | Cursos disponibles con nivel asociado | `por_c_grado` |
| 5 | `modulos` | Contenido desglosado por curso | `por_c_curso` |
| 6 | `materiales` | Recursos educativos por módulo | `por_c_mod` |
| 7 | `matricula` | Relación usuario ↔ curso (inscripción) | `por_c_usuario`, `por_c_curso` |

### 🔗 Relaciones Clave

```
roles
  └── usuario.rol_id (REQUERIDO - define permisos del user)

instruccion
  ├── usuario.es_st (nivel educativo del user, OPCIONAL)
  └── curso.c_grado (nivel requerido del curso)

curso
  ├── modulos.c_curso (módulos dentro del curso)
  └── matricula.c_curso (inscripciones al curso)

modulos
  └── materiales.c_mod (recursos del módulo)

usuario
  └── matricula.c_usuario (cursos del usuario)
```

### 🏗️ Campos Críticos para Frontend

| Operación Frontend | Tabla | Campo/Índice a usar |
|---------------------|-------|---------------------|
| Login / buscar usuario | `usuario` | `por_email` |
| Listar usuarios por rol | `usuario` | `por_rol_id` |
| Listar cursos por nivel | `curso` | `por_c_grado` |
| Mostrar módulos de un curso | `modulos` | `por_c_curso` |
| Materiales de un módulo | `materiales` | `por_c_mod` |
| Cursos de un usuario | `matricula` | `por_c_usuario` |
| Usuarios en un curso | `matricula` | `por_c_curso` |
| Buscar rol por nombre | `roles` | `por_nombre` |

### 💡 Notas para Siguiente Dev

- Las tablas en inglés deben manejar: **sesiones P2P**, **progreso de aprendizaje**, **peer connections**
- Las funciones Convex deben seguir el patrón: `crear`, `obtenerPorId`, `listarPor[FK]`, `actualizar`, `eliminar`
- **No hay autenticación en el schema** → Convex la maneja automáticamente con `ctx.auth`
- El campo `metadata` en cada tabla permite agregar propiedades ad-hoc sin migrar schema
- Los timestamps (`crea`) se generan con `Date.now()` en las mutaciones
- **`rol_id` es REQUERIDO** en usuario — hay que crear los roles antes de crear usuarios

### ⏱️ Tiempo empleado: ~35 min
### ⏱️ Tiempo restante: ~11.4 horas

---

**Próximo paso:** Otro dev crea funciones CRUD + tablas en inglés
**Deadline:** Todo backend listo en 4 horas max
**Demo:** Preparar en últimas 2 horas
