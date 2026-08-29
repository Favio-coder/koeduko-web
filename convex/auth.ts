import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query } from "./_generated/server";

/**
 * Autenticación por email y contraseña.
 *
 * La tabla `users` que crea @convex-dev/auth guarda solo la credencial. El
 * perfil (rol, carrera, nivel de instrucción) sigue viviendo en `usuario` y se
 * vincula por email, así que quien ya estaba cargado conserva sus datos al
 * registrarse con el mismo correo.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

/**
 * Usuario autenticado con su perfil resuelto.
 *
 * Devuelve null cuando no hay sesión, para que la interfaz distinga "todavía
 * cargando" (undefined) de "no hay nadie autenticado" (null).
 */
export const usuarioActual = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;

    const cuenta = await ctx.db.get(authUserId);
    if (!cuenta?.email) return null;

    // El perfil se busca por email: es lo único que comparten la cuenta de
    // auth y la fila de `usuario` que ya existía antes de tener contraseñas.
    const perfil = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", cuenta.email as string))
      .first();

    if (!perfil) {
      // Cuenta creada sin perfil: puede pasar si alguien se registra con un
      // email que nadie dio de alta en la plataforma. Se informa en vez de
      // fingir que el usuario no existe.
      return {
        _id: null,
        email: cuenta.email,
        nombre: cuenta.name ?? cuenta.email,
        sinPerfil: true as const,
      };
    }

    const rol = await ctx.db.get(perfil.rol_id);

    return {
      _id: perfil._id,
      email: perfil.email,
      nombre: perfil.nombre,
      carrera: perfil.carrera,
      rol_id: perfil.rol_id,
      rol: rol?.nombre ?? null,
      sinPerfil: false as const,
    };
  },
});
