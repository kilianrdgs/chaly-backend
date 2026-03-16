/**
 * Handler: POST /auth/request-code
 * Envoie un code OTP par SMS
 */

import { requestCodeService } from "../services/requestCode.service";
import { successResponse, handleError } from "../../utils/response";
import type { RequestCodeInput } from "../auth.schema";

export async function requestCodeHandler(c: any) {
  try {
    const { phone } = c.req.valid("json") as RequestCodeInput;
    const result = await requestCodeService(phone);
    return successResponse(c, result);
  } catch (error) {
    return handleError(c, error);
  }
}
