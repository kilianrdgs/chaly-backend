/**
 * Service: Vérifie le code OTP et retourne les tokens + user info
 */

import { generateTokenPair } from "../../lib/jwt";
import { verifyPhoneCode } from "../repositories/verifyPhoneCode.repo";
import { getOrCreateUser } from "../repositories/getOrCreateUser.repo";
import { userHasPseudo } from "../repositories/userHasPseudo.repo";
import type { VerifyCodeResponse } from "../auth.types";

export async function verifyCodeService(
  phoneNumber: string,
  code: string
): Promise<VerifyCodeResponse> {
  // Vérifie le code OTP
  await verifyPhoneCode(phoneNumber, code);

  // Récupère ou crée l'utilisateur
  const { user, isNewUser } = await getOrCreateUser(phoneNumber);

  // Sécurité : s'assure que l'ID utilisateur est présent
  if (!user?.Id) {
    throw new Error("User ID missing after OTP verification");
  }

  // Vérifie si l'utilisateur a un pseudo
  const userHasValidPseudo =
    !isNewUser && !!user.Pseudo && (await userHasPseudo(user.Pseudo));

  // Génère les tokens
  const tokens = generateTokenPair(user.Id);

  return {
    ...tokens,
    isNewUser,
    requiresPseudo: isNewUser || !userHasValidPseudo,
  };
}
