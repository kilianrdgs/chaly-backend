/**
 * Utilitaires JWT pour génération et vérification de tokens
 */

import jwt, { type Secret, type JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { createError } from "../utils/errors";

export interface TokenPayload extends JwtPayload {
  tokenType: "access" | "refresh";
  sub: string; // userId
  jti: string; // unique token ID
}

/**
 * Génère un Access Token
 */
export function generateAccessToken(userId: number): string {
  const jti = uuidv4();
  return jwt.sign(
    {
      tokenType: "access",
      jti,
      sub: String(userId),
    } as TokenPayload,
    env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

/**
 * Génère un Refresh Token
 */
export function generateRefreshToken(userId: number): string {
  const jti = uuidv4();
  return jwt.sign(
    {
      tokenType: "refresh",
      jti,
      sub: String(userId),
    } as TokenPayload,
    env.REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
}

/**
 * Génère une paire de tokens (access + refresh)
 */
export function generateTokenPair(userId: number) {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

/**
 * Vérifie et décode un token (Access ou Refresh)
 */
export function verifyToken(
  token: string,
  isRefreshToken = false
): TokenPayload {
  const secret: Secret = isRefreshToken
    ? (env.REFRESH_TOKEN_SECRET as Secret)
    : (env.ACCESS_TOKEN_SECRET as Secret);

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (err: unknown) {
    const error = err as Error;

    if (error.name === "TokenExpiredError") {
      throw createError.tokenExpired();
    }

    if (error.name === "JsonWebTokenError") {
      throw createError.tokenInvalid();
    }

    throw createError.tokenInvalid("Erreur lors de la vérification du token");
  }
}

/**
 * Extrait le userId d'un token vérifié
 */
export function extractUserId(token: string, isRefreshToken = false): number {
  const payload = verifyToken(token, isRefreshToken);
  const userId = Number(payload.sub);

  if (Number.isNaN(userId)) {
    throw createError.tokenInvalid("User ID invalide dans le token");
  }

  return userId;
}
