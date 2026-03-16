/**
 * Middleware global de gestion d'erreurs pour Hono
 */

import type { Context } from "hono";
import { AppError } from "../utils/errors";
import { errorResponse } from "../utils/response";

/**
 * Middleware de gestion d'erreurs global
 * À utiliser avec app.onError()
 */
export function errorHandler(err: Error, c: Context) {
  console.error("Error caught by errorHandler:", err);

  // Si c'est une AppError, on renvoie l'erreur formatée
  if (err instanceof AppError) {
    return errorResponse(c, err.statusCode, err.code, err.message, err.details);
  }

  // Pour toutes les autres erreurs, on renvoie une erreur générique
  return errorResponse(
    c,
    500,
    "INTERNAL_SERVER_ERROR",
    "Une erreur inattendue s'est produite"
  );
}
