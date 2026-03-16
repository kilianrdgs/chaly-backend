/**
 * Service: Rafraîchit les tokens
 */

import { generateTokenPair, verifyToken } from "../../lib/jwt";
import { createError } from "../../utils/errors";
import { isRefreshTokenValid } from "../repositories/isRefreshTokenValid.repo";
import { invalidateRefreshToken } from "../repositories/invalidateRefreshToken.repo";
import type { RefreshTokenResponse } from "../auth.types";

export async function refreshTokenService(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  // Vérifie que le token n'est pas invalidé
  const isValid = await isRefreshTokenValid(refreshToken);
  if (!isValid) {
    throw createError.tokenInvalid("Token révoqué");
  }

  // Vérifie le refresh token et extrait payload
  const payload = verifyToken(refreshToken, true);

  if (payload.tokenType !== "refresh") {
    throw createError.tokenInvalid("Type de token invalide");
  }

  const userId = Number(payload.sub);
  if (Number.isNaN(userId)) {
    throw createError.tokenInvalid("User ID invalide dans le token");
  }

  // Invalide l'ancien refresh token
  try {
    await invalidateRefreshToken(refreshToken);
  } catch (error) {
    console.error("Erreur lors de l'invalidation du refresh token:", error);
    // Ne pas bloquer si l'invalidation échoue
  }

  // Génère de nouveaux tokens
  const tokens = generateTokenPair(userId);

  return tokens;
}
