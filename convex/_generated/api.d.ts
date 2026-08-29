/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as curso from "../curso.js";
import type * as instruccion from "../instruccion.js";
import type * as materiales from "../materiales.js";
import type * as matricula from "../matricula.js";
import type * as modulos from "../modulos.js";
import type * as roles from "../roles.js";
import type * as seed from "../seed.js";
import type * as usuario from "../usuario.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  curso: typeof curso;
  instruccion: typeof instruccion;
  materiales: typeof materiales;
  matricula: typeof matricula;
  modulos: typeof modulos;
  roles: typeof roles;
  seed: typeof seed;
  usuario: typeof usuario;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
