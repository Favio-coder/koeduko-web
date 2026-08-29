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
import type * as functions_analysis from "../functions/analysis.js";
import type * as functions_analysis_node from "../functions/analysis_node.js";
import type * as functions_groupings from "../functions/groupings.js";
import type * as functions_plans from "../functions/plans.js";
import type * as functions_realtime from "../functions/realtime.js";
import type * as functions_recordings from "../functions/recordings.js";
import type * as functions_reports from "../functions/reports.js";
import type * as functions_sessions from "../functions/sessions.js";
import type * as functions_transcriptions from "../functions/transcriptions.js";
import type * as functions_vapi_webhook from "../functions/vapi_webhook.js";
import type * as http from "../http.js";
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
  "functions/analysis": typeof functions_analysis;
  "functions/analysis_node": typeof functions_analysis_node;
  "functions/groupings": typeof functions_groupings;
  "functions/plans": typeof functions_plans;
  "functions/realtime": typeof functions_realtime;
  "functions/recordings": typeof functions_recordings;
  "functions/reports": typeof functions_reports;
  "functions/sessions": typeof functions_sessions;
  "functions/transcriptions": typeof functions_transcriptions;
  "functions/vapi_webhook": typeof functions_vapi_webhook;
  http: typeof http;
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
