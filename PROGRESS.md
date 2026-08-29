# KOEDUKO Backend - Progress Report

## Status: [FASE 2/3] - Schema Completo (Español + Inglés) ✅

---

### ✅ Completado

- [x] `convex/schema.ts` con **12 tablas** (7 español + 5 inglés)
- [x] Tabla **Roles** (instructor, estudiante, peer, admin)
- [x] FK configuradas con `v.id()` — todas apuntando a nombres correctos en minúscula
- [x] Índices de performance en TODAS las FK
- [x] Tablas en inglés: tracking, P2P, evaluación
- [x] Campo `metadata` extensible en tablas core
- [x] Documentación para siguiente dev

### ⏳ Próximo

- [ ] Crear funciones Convex para CRUD de cada tabla
- [ ] Validación de datos en mutaciones
- [ ] Testing de funciones en Convex Dashboard
- [ ] Integración con autenticación de Convex
- [ ] Integración frontend (`useQuery`, `useMutation`)
- [ ] Testing end-to-end
- [ ] Preparar demo

---

### 📊 Tablas Creadas (12 total)

#### Tablas en Español (7)

| # | Tabla | Propósito | Índices |
|---|-------|-----------|---------|
| 1 | `roles` | Permisos (instructor, estudiante, peer, admin) | `por_nombre` |
| 2 | `instruccion` | Niveles educativos | `por_nombre` |
| 3 | `usuario` | Datos de usuarios con rol asignado | `por_email`, `por_rol_id`, `por_es_st` |
| 4 | `curso` | Cursos disponibles | `por_c_grado` |
| 5 | `modulos` | Contenido por curso | `por_c_curso` |
| 6 | `materiales` | Recursos educativos | `por_c_mod` |
| 7 | `matricula` | Inscripción usuario ↔ curso | `por_c_usuario`, `por_c_curso` |

#### Tablas en Inglés (5)

| # | Tabla | Propósito | Índices |
|---|-------|-----------|---------|
| 8 | `learning_progress` | Progreso del usuario en un curso | `by_user`, `by_course` |
| 9 | `peer_profile` | Perfil P2P (bio, skills, disponibilidad) | `by_user` |
| 10 | `peer_connections` | Conexiones entre pares | `by_from`, `by_to` |
| 11 | `study_sessions` | Sesiones de estudio P2P | `by_connection` |
| 12 | `course_evaluation_criteria` | Criterios de evaluación por curso | `by_course` |

### 🔗 Relaciones Clave

```
roles
  └── usuario.rol_id (REQUERIDO)

instruccion
  ├── usuario.es_st (OPCIONAL)
  └── curso.c_grado

curso
  ├── modulos.c_curso
  ├── matricula.c_curso
  ├── learning_progress.courseId
  └── course_evaluation_criteria.courseId

modulos
  └── materiales.c_mod

usuario
  ├── matricula.c_usuario
  ├── learning_progress.userId
  ├── peer_profile.userId
  ├── peer_connections.userId_from
  └── peer_connections.userId_to

peer_connections
  └── study_sessions.connectionId
```

### 🏗️ Campos Críticos para Frontend

| Operación Frontend | Tabla | Índice |
|---------------------|-------|--------|
| Login / buscar usuario | `usuario` | `por_email` |
| Listar usuarios por rol | `usuario` | `por_rol_id` |
| Cursos por nivel | `curso` | `por_c_grado` |
| Módulos de un curso | `modulos` | `por_c_curso` |
| Materiales de un módulo | `materiales` | `por_c_mod` |
| Cursos de un usuario | `matricula` | `por_c_usuario` |
| Progreso del usuario | `learning_progress` | `by_user` |
| Perfil P2P | `peer_profile` | `by_user` |
| Conexiones del usuario | `peer_connections` | `by_from` / `by_to` |
| Sesiones de una conexión | `study_sessions` | `by_connection` |
| Criterios de un curso | `course_evaluation_criteria` | `by_course` |

### ⏱️ Tiempo empleado: ~45 min
### ⏱️ Tiempo restante: ~11.2 horas

---

**Próximo paso:** Crear funciones CRUD para las 12 tablas
**Deadline:** Backend completo en 3.5 horas
**Demo:** Preparar en últimas 2 horas
