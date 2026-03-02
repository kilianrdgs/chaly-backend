import type { RequestHandler } from "express";
import { StatusCode } from "../../globals/http";
import { logoutService } from "../service/logout.service";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: Déconnecte l'utilisateur en invalidant son RefreshToken
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
 *         description: Utilisateur déconnecté avec succès
 *       400:
 *         description: RefreshToken manquant
 *       500:
 *         description: Erreur serveur
 */

export function logoutController(): RequestHandler {
	return async (req, res) => {
		const { refreshToken } = req.body ?? {};
		const response = await logoutService(refreshToken);
		res.status(StatusCode.Ok).json(response);
	};
}
