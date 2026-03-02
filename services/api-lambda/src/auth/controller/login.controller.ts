import type { RequestHandler } from "express";
import { StatusCode } from "../../globals/http";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: login user
 *     description: renvoie AccessToken et RefreshToken
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès
 *       500:
 *         description: Erreur serveur
 */

export function loginController(): RequestHandler {
	return async (_req, res) => {
		const repsonseAccessToken = await generateAccessToken(10);
		const responseRefreshToken = await generateRefreshToken(10);
		res.status(StatusCode.Ok).json({
			accessToken: repsonseAccessToken,
			refreshToken: responseRefreshToken,
		});
	};
}
