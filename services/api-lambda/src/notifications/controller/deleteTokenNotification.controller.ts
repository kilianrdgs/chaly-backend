import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { deleteTokenNotificationService } from "../service/deleteTokenNotification.service";

/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags: [Notifications]
 *     summary: Supprime le token de notification de l'utilisateur
 *     description: Permet de supprimer le token de notification lié à l'utilisateur connecté
 *     responses:
 *       200: { description: Token supprimé avec succès }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function deleteTokenNotificationController(
	deps: ServiceDeps,
): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const result = await deleteTokenNotificationService(userId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json();
	};
}
