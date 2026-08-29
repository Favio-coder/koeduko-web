/**
 * Configuración del proveedor de identidad.
 *
 * Si este archivo falta o apunta mal, la app queda permanentemente
 * "no autenticada" sin lanzar ningún error: las queries simplemente ven un
 * usuario nulo. Es el fallo más difícil de diagnosticar del auth de Convex,
 * porque no hay nada roto que mirar.
 *
 * CONVEX_SITE_URL la define el propio deployment; no hay que configurarla.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
