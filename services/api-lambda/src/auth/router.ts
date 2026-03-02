import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { loginController } from "./controller/login.controller";
import { logoutController } from "./controller/logout.controller";

import { otpLimiter } from "../middlewares/rateLimiter";
import { refreshTokenController } from "./controller/refreshToken.controller";
import { requestCodeController } from "./controller/requestCode.controller";
import { testController } from "./controller/test.controller";
import { verifyCodeController } from "./controller/verifyCode.controller";
require("dotenv").config();

const authRouter = express.Router();
const ENV = process.env.ENV;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API pour gérer l'authentification (auth v2)
 */

// ROUTES AUTH
authRouter.post("/request-code", otpLimiter, requestCodeController());
authRouter.post("/verify-code", verifyCodeController());
authRouter.post("/login", loginController());
authRouter.post("/refresh-token", refreshTokenController());
authRouter.post("/logout", logoutController());

// Route de test uniquement en environnement de test
if (ENV === "DEV") {
	authRouter.get("/test", authenticateToken, testController());
}
// POST auth/logout

export default authRouter;
