/**
 * Vérifie si un refresh token est valide (non révoqué)
 */

import { prisma } from "../../lib/prisma";

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  try {
    const invalidated = await prisma.invalid_Tokens.findUnique({
      where: { Token: token },
    });
    return invalidated === null;
  } catch (error) {
    console.error("Erreur dans isRefreshTokenValid:", error);
    return false;
  }
}
