/**
 * Service: Déconnexion (révoque le refresh token)
 */

import { createError } from "../../utils/errors";
import { invalidateRefreshToken } from "../repositories/invalidateRefreshToken.repo";
import type { LogoutResponse } from "../auth.types";

export async function logoutService(
  refreshToken: string
): Promise<LogoutResponse> {
  try {
    await invalidateRefreshToken(refreshToken);
    return {
      success: true,
      message: "Déconnexion réussie",
    };
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw createError.internalServerError("Erreur lors de la déconnexion");
  }
}
