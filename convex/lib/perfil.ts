import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/**
 * Perfil del usuario autenticado, resuelto desde el token de sesión.
 *
 * Es la única forma correcta de saber quién hace una llamada. Recibir el email
 * como argumento —como se hacía antes de tener auth— significa creerle al
 * cliente: cualquiera puede abrir la consola y mandar el correo de otra
 * persona. Acá la identidad la establece el servidor a partir del token, que
 * el cliente no puede falsificar.
 */
export async function perfilAutenticado(
  ctx: QueryCtx
): Promise<Doc<"usuario"> | null> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) return null;

  const cuenta = await ctx.db.get(authUserId);
  if (!cuenta || !("email" in cuenta) || !cuenta.email) return null;

  return await ctx.db
    .query("usuario")
    .withIndex("por_email", (q) => q.eq("email", cuenta.email as string))
    .first();
}

/**
 * Igual que perfilAutenticado, pero lanza en vez de devolver null.
 *
 * Para mutations, donde seguir sin identidad significaría escribir datos sin
 * dueño.
 */
export async function requerirPerfil(ctx: QueryCtx): Promise<Doc<"usuario">> {
  const perfil = await perfilAutenticado(ctx);

  if (!perfil) {
    throw new Error(
      "No hay una sesión válida, o tu cuenta todavía no tiene perfil en KoEduko."
    );
  }

  return perfil;
}
