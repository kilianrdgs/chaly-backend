/**
 * Vérifie un code OTP pour un numéro de téléphone
 * Retourne true si valide, sinon lance une erreur
 */

import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { createError } from "../../utils/errors";

export async function verifyPhoneCode(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  // Bypass pour le compte test (reviews App Store/Play Store)
  if (
    env.ENABLE_TEST_ACCOUNT &&
    phoneNumber === env.TEST_PHONE_NUMBER &&
    code === env.TEST_OTP_CODE
  ) {
    console.log("🧪 [TEST ACCOUNT] Authentification réussie");
    // Supprimer la vérification si elle existe
    await prisma.phoneVerifications.deleteMany({
      where: { Phone: phoneNumber },
    });
    return true;
  }

  try {
    const verification = await prisma.phoneVerifications.findUnique({
      where: { Phone: phoneNumber },
    });

    if (!verification) {
      throw createError.codeNotFound();
    }

    const now = new Date();

    // Vérifier si le code OTP est expiré
    if (verification.ExpiresAt < now) {
      await prisma.phoneVerifications.delete({
        where: { Phone: phoneNumber },
      });
      throw createError.codeExpired();
    }

    // Calculer la date de déblocage
    const unblockAt = new Date(
      verification.CreatedAt.getTime() +
        env.OTP_BLOCK_DURATION_MINUTES * 60 * 1000
    );

    // Si le numéro est bloqué ET que le délai n'est pas expiré → Rejet
    if (verification.Retries >= env.MAX_OTP_RETRIES && now < unblockAt) {
      const remainingMinutes = Math.ceil(
        (unblockAt.getTime() - now.getTime()) / 1000 / 60
      );
      throw createError.tooManyAttempts(
        `Trop de tentatives. Réessayez dans ${remainingMinutes} minute(s)`
      );
    }

    // Si le délai de blocage est expiré → Réinitialiser les tentatives
    if (verification.Retries >= env.MAX_OTP_RETRIES && now >= unblockAt) {
      await prisma.phoneVerifications.update({
        where: { Phone: phoneNumber },
        data: {
          Retries: 0,
          CreatedAt: now,
        },
      });
    }

    if (verification.Code !== code) {
      await prisma.phoneVerifications.update({
        where: { Phone: phoneNumber },
        data: {
          Retries: verification.Retries + 1,
        },
      });
      throw createError.codeInvalid();
    }

    // Code valide, supprimer la vérification
    await prisma.phoneVerifications.delete({
      where: { Phone: phoneNumber },
    });

    return true;
  } catch (error) {
    // Si c'est une AppError, on la relance
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }

    console.error("Erreur dans verifyPhoneCode:", error);
    throw createError.databaseError(
      "Erreur lors de la vérification du code",
      error
    );
  }
}
