/**
 * Vérifie qu'un pseudo existe pour un utilisateur
 */

import { prisma } from "../../lib/prisma";

export async function userHasPseudo(pseudo: string): Promise<boolean> {
  try {
    const user = await prisma.users.findFirst({
      where: { Pseudo: pseudo },
    });
    return user !== null;
  } catch (error) {
    console.error("Erreur dans userHasPseudo:", error);
    return false;
  }
}
