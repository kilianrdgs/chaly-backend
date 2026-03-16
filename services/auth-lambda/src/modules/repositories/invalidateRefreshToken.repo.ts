/**
 * Invalide un refresh token
 */

import { prisma } from "../../lib/prisma";

export async function invalidateRefreshToken(token: string): Promise<void> {
  try {
    await prisma.invalid_Tokens.create({
      data: {
        Token: token,
        Created_At: new Date(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'invalidation du refresh token:", error);
    // Ne pas bloquer le flux si l'invalidation échoue
  }
}
