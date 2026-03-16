/**
 * Handler: POST /auth/refresh-token
 * Rafraîchit les tokens
 */

import { refreshTokenService } from "../services/refreshToken.service";
import { successResponse, handleError } from "../../utils/response";
import type { RefreshTokenInput } from "../auth.schema";

export async function refreshTokenHandler(c: any) {
  try {
    const { refreshToken } = c.req.valid("json") as RefreshTokenInput;
    const result = await refreshTokenService(refreshToken);
    return successResponse(c, result);
  } catch (error) {
    return handleError(c, error);
  }
}
