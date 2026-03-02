import type { RequestHandler } from "express";
import { HttpError, StatusCode } from "../../globals/http";
import { refreshTokenService } from "../service/refreshToken.service";
import { verifyToken } from "../utils/tokens";

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: refresh RefreshToken
 *     description: renvoie un nouveau AccessToken et RefreshToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *     responses:
 *       200:
 *         description: Nouveaux tokens générés avec succès
 *       400:
 *         description: RefreshToken manquant
 *       401:
 *         description: RefreshToken invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */

export function refreshTokenController(): RequestHandler {
	return async (req, res, next) => {
		try {
			const { refreshToken } = req.body ?? {};
			if (!refreshToken) {
				res.status(StatusCode.Unauthorized).json({ error: "TOKEN_INVALID" });
				return;
			}
			const tokens = await refreshTokenService(refreshToken);
			res.status(StatusCode.Ok).json(tokens);
			return;
		} catch (err: unknown) {
			if (err instanceof HttpError) {
				res.status(err.statusCode).json({ error: err.error });
				return;
			}
			// Cas par défaut (erreur inattendue)
			res.status(StatusCode.Unauthorized).json({ error: "TOKEN_INVALID" });
			return;
		}
	};
}
