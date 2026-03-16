/**
 * Routes d'authentification avec Hono
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  requestCodeSchema,
  verifyCodeSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./auth.schema";
import { requestCodeHandler } from "./handlers/requestCode.handler";
import { verifyCodeHandler } from "./handlers/verifyCode.handler";
import { refreshTokenHandler } from "./handlers/refreshToken.handler";
import { logoutHandler } from "./handlers/logout.handler";

export const authRouter = new Hono();

/**
 * POST /auth/request-code
 * Envoie un code OTP par SMS
 */
authRouter.post(
  "/request-code",
  zValidator("json", requestCodeSchema),
  requestCodeHandler
);

/**
 * POST /auth/verify-code
 * Vérifie le code OTP et retourne les tokens
 */
authRouter.post(
  "/verify-code",
  zValidator("json", verifyCodeSchema),
  verifyCodeHandler
);

/**
 * POST /auth/refresh-token
 * Rafraîchit les tokens
 */
authRouter.post(
  "/refresh-token",
  zValidator("json", refreshTokenSchema),
  refreshTokenHandler
);

/**
 * POST /auth/logout
 * Déconnexion (révoque le refresh token)
 */
authRouter.post("/logout", zValidator("json", logoutSchema), logoutHandler);
