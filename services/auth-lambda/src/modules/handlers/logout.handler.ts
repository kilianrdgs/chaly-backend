/**
 * Handler: POST /auth/logout
 * Déconnexion (révoque le refresh token)
 */

import { logoutService } from "../services/logout.service";
import { successResponse, handleError } from "../../utils/response";
import type { LogoutInput } from "../auth.schema";

export async function logoutHandler(c: any) {
  try {
    const { refreshToken } = c.req.valid("json") as LogoutInput;
    const result = await logoutService(refreshToken);
    return successResponse(c, result);
  } catch (error) {
    return handleError(c, error);
  }
}
