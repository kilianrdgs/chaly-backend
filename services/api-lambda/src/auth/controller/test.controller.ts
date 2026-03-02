/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Auth]
 *     summary: Route de test pour Middleware (uniquement en environnement de test)
 *     description: Renvoie un message de test.
 *     responses:
 *       200:
 *         description: Message de test renvoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "testController"
 *       401:
 *         description: Token expiré ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       enum: [TOKEN_EXPIRED]
 *                       example: TOKEN_EXPIRED
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       enum: [TOKEN_INVALID]
 *                       example: TOKEN_INVALID
 *       500:
 *         description: Erreur serveur
 */

import type { RequestHandler } from "express";
import { StatusCode } from "../../globals/http";

export function testController(): RequestHandler {
	return async (_req, res) => {
		res.status(StatusCode.Ok).json({ message: "testController" });
	};
}
