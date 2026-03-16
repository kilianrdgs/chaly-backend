/**
 * Middleware de rate limiting pour Hono
 * Note: Pour une solution production, utiliser Redis ou un service externe
 */

import type { Context, Next } from "hono";
import { createError } from "../utils/errors";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// Store en mémoire (pour dev/simple use case)
// En production, utiliser Redis
const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes
  keyGenerator?: (c: Context) => string; // Fonction pour générer la clé
}

/**
 * Middleware de rate limiting
 * Par défaut, limite par IP
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (c: Context) => {
      // Par défaut, utilise l'IP du client
      return (
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown"
      );
    },
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Initialise ou récupère les données de rate limit
    if (!store[key] || store[key].resetAt < now) {
      store[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
    } else {
      store[key].count++;
    }

    // Vérifie si la limite est atteinte
    if (store[key].count > maxRequests) {
      const resetIn = Math.ceil((store[key].resetAt - now) / 1000);
      throw createError.tooManyRequests(
        `Trop de requêtes. Réessayez dans ${resetIn} secondes`
      );
    }

    await next();
  };
}

/**
 * Rate limiter spécifique pour les OTP
 * Limite par numéro de téléphone
 */
export function otpRateLimiter() {
  return rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 requêtes max
    keyGenerator: (c) => {
      const body = c.req.json();
      // @ts-expect-error - body sera validé par le schema après
      return body.phone || "unknown";
    },
  });
}

/**
 * Nettoie les entrées expirées du store
 * À appeler périodiquement (ex: toutes les heures)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}
