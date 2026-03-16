/**
 * Réponses standardisées pour l'API
 */

import type { Context } from "hono";
import { AppError } from "./errors";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Réponse de succès standardisée
 */
export function successResponse<T>(c: Context, data: T, status: number = 200) {
  return c.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    status as any
  );
}

/**
 * Réponse d'erreur standardisée
 */
export function errorResponse(
  c: Context,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  const errorObj: ApiResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    errorObj.error!.details = details;
  }

  return c.json(errorObj, statusCode as any);
}

/**
 * Gère une AppError et retourne une réponse formatée
 */
export function handleError(c: Context, error: unknown) {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return errorResponse(
      c,
      error.statusCode,
      error.code,
      error.message,
      error.details
    );
  }

  // Erreur inconnue
  return errorResponse(
    c,
    500,
    "INTERNAL_SERVER_ERROR",
    "Une erreur inattendue s'est produite"
  );
}
