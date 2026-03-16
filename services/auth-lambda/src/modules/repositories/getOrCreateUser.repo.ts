/**
 * Récupère ou crée un utilisateur par son numéro de téléphone
 */

import { prisma } from "../../lib/prisma";
import { createError } from "../../utils/errors";
import type { UserInfo } from "../auth.types";

export async function getOrCreateUser(
  phoneNumber: string
): Promise<{ user: UserInfo; isNewUser: boolean }> {
  try {
    let user = await prisma.users.findUnique({
      where: { PhoneNumber: phoneNumber },
    });

    let isNewUser = false;

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.users.create({
        data: {
          PhoneNumber: phoneNumber,
          Pseudo: null,
          XpTotal: 0,
        },
      });
      isNewUser = true;
    }

    return {
      user: user as UserInfo,
      isNewUser,
    };
  } catch (error) {
    console.error("Erreur dans getOrCreateUser:", error);
    throw createError.databaseError(
      "Erreur lors de la récupération/création de l'utilisateur",
      error
    );
  }
}
