/**
 * Crée ou met à jour une vérification de téléphone avec un code OTP
 */

import { randomInt } from "node:crypto";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { createError } from "../../utils/errors";

export async function createPhoneVerification(
  phoneNumber: string
): Promise<string> {
  // Valide le format du numéro
  if (!phoneNumber || !phoneNumber.startsWith("+")) {
    throw createError.phoneFormatInvalid();
  }

  try {
    const parsedPhone = parsePhoneNumberWithError(phoneNumber);
    if (!parsedPhone.isValid()) {
      throw createError.phoneInvalid();
    }
  } catch (error) {
    throw createError.phoneInvalid();
  }

  // Génère un code OTP
  let otpCode = randomInt(1000, 9999).toString();

  // Compte test pour reviews App Store/Play Store
  if (env.ENABLE_TEST_ACCOUNT && phoneNumber === env.TEST_PHONE_NUMBER) {
    otpCode = env.TEST_OTP_CODE;
    console.log("🧪 [TEST ACCOUNT] Code OTP généré:", otpCode);
  }

  try {
    const existing = await prisma.phoneVerifications.findUnique({
      where: { Phone: phoneNumber },
    });

    const now = new Date();

    if (existing) {
      // Calculer la date de déblocage (CreatedAt + durée de blocage)
      const unblockAt = new Date(
        existing.CreatedAt.getTime() +
          env.OTP_BLOCK_DURATION_MINUTES * 60 * 1000
      );

      // Si le numéro est bloqué ET que le délai n'est pas expiré → Rejet
      if (existing.Retries >= env.MAX_OTP_RETRIES && now < unblockAt) {
        const remainingMinutes = Math.ceil(
          (unblockAt.getTime() - now.getTime()) / 1000 / 60
        );
        throw createError.tooManyAttempts(
          `Numéro bloqué. Réessayez dans ${remainingMinutes} minute(s)`
        );
      }

      // Si le délai de blocage est expiré OU si le code OTP est expiré → Réinitialisation
      const shouldReset =
        (existing.Retries >= env.MAX_OTP_RETRIES && now >= unblockAt) ||
        existing.ExpiresAt < now;

      // Mettre à jour avec un nouveau code
      await prisma.phoneVerifications.update({
        where: { Phone: phoneNumber },
        data: {
          Code: otpCode,
          Retries: shouldReset ? 0 : existing.Retries + 1,
          CreatedAt: shouldReset ? now : existing.CreatedAt, // Reset CreatedAt si déblocage
          ExpiresAt: new Date(
            Date.now() + env.OTP_EXPIRATION_MINUTES * 60 * 1000
          ),
        },
      });
    } else {
      // Créer une nouvelle entrée
      await prisma.phoneVerifications.create({
        data: {
          Phone: phoneNumber,
          Code: otpCode,
          Retries: 0,
          CreatedAt: now,
          ExpiresAt: new Date(
            Date.now() + env.OTP_EXPIRATION_MINUTES * 60 * 1000
          ),
        },
      });
    }

    return otpCode;
  } catch (error) {
    console.error("Erreur lors de la création de PhoneVerification:", error);
    throw createError.databaseError(
      "Erreur lors de la création de la vérification",
      error
    );
  }
}
