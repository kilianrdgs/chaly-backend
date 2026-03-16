import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { saveTokenNotificationService } from "../service/createTokenNotification.service";

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Notifications]
 *     summary: Enregistre un token de notification
 *     description: Permet d'enregistrer un token de notification d'un utilisateur donné
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: Token de notification push à enregistrer }
 *     responses:
 *       201: { description: Token enregistré avec succès }
 *       400: { description: Requête invalide }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function createTokenNotificationController(): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const tokenNotification = req.body.token as string | undefined;

		if (
			!tokenNotification ||
			typeof tokenNotification !== "string" ||
			tokenNotification.length === 0
		) {
			res.status(400).json({ message: "Requête invalide" });
			return;
		}

		const result = await saveTokenNotificationService(
			userId,
			tokenNotification,
		);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(201).json();
	};
}
