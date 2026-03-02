import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { sendNotifService } from "../service/sendNotification.service";

/**
 * @swagger
 * /api/notifications/send-notification:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Notifications]
 *     summary: Envoie une notification push à un utilisateur
 *     description: Envoie une notification push personnalisée à un utilisateur donné
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pseudo, type]
 *             properties:
 *               pseudo: { type: string, description: Pseudo de l'utilisateur cible }
 *               type: { type: integer, description: Type de notification }
 *     responses:
 *       200: { description: Notification envoyée avec succès }
 *       400: { description: Pseudo ou type invalide }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function sendNotificationController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const { pseudo, type } = req.body as { pseudo?: string; type?: number };

		if (
			!pseudo ||
			typeof pseudo !== "string" ||
			!type ||
			typeof type !== "number"
		) {
			res.status(400).json({ message: "Pseudo ou type invalide" });
			return;
		}

		const result = await sendNotifService(deps, userId, pseudo, type);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ message: result.Message });
			return;
		}
		res.status(200).json();
	};
}
