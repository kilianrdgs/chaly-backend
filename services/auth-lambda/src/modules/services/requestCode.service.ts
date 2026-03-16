/**
 * Service: Génère un code OTP et retourne les données pour l'envoi SMS
 */

import { createPhoneVerification } from "../repositories/createPhoneVerification.repo";
import { env } from "../../config/env";
import type { RequestCodeResponse } from "../auth.types";

export async function requestCodeService(
  phoneNumber: string
): Promise<RequestCodeResponse> {
  const otpCode = await createPhoneVerification(phoneNumber);

  // Pour le compte test, on ne retourne pas le code (pas besoin d'envoyer de SMS)
  const isTestAccount = env.ENABLE_TEST_ACCOUNT && phoneNumber === env.TEST_PHONE_NUMBER;

  return {
    success: true,
    message: isTestAccount
      ? "Compte test - Utilisez le code 1234"
      : "Code généré avec succès",
    phoneNumber,
    codeOtp: isTestAccount ? undefined : otpCode, // Ne pas envoyer le code pour le compte test
  };
}
