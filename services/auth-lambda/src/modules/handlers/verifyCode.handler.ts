/**
 * Handler: POST /auth/verify-code
 * Vérifie le code OTP et retourne les tokens
 */

import { verifyCodeService } from "../services/verifyCode.service";
import { successResponse, handleError } from "../../utils/response";
import type { VerifyCodeInput } from "../auth.schema";

export async function verifyCodeHandler(c: any) {
  try {
    const { phone, code } = c.req.valid("json") as VerifyCodeInput;
    const result = await verifyCodeService(phone, code);

    // Status 201 si nouvel utilisateur, 200 sinon
    return successResponse(c, result, result.isNewUser ? 201 : 200);
  } catch (error) {
    return handleError(c, error);
  }
}
