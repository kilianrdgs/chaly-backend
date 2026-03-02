import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { sendDailyChallengeService } from "../service/sendDailyChallenge.service";

/**
 * @swagger
 * /api/challenges/send-daily:
 *   post:
 *     security:
 *       - ApiKeyAuth: []
 *       - ServerKeyAuth: []
 *     tags: [Challenges]
 *     summary: Déclencher l’envoi du défi du jour
 *     description: |
 *       Sélectionne automatiquement un défi aléatoire non encore utilisé récemment,
 *       envoie une notification à tous les utilisateurs, puis marque le défi comme utilisé.
 *       Cette route est prévue pour être appelée par un cron (protégée par une clé API serveur).
 *     responses:
 *       200:
 *         description: Défi envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sent:        { type: integer, description: Nombre de notifications envoyées }
 *                 challengeId: { type: integer, description: ID du défi sélectionné }
 *                 title:       { type: string,  description: Titre du défi choisi }
 *       401: { description: Non autorisé (clé manquante ou invalide) }
 *       404: { description: Aucun défi disponible }
 *       500: { description: Erreur serveur }
 */
export function sendDailyChallengeController(): RequestHandler {
	return async (_req, res) => {
		const result = await sendDailyChallengeService();
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ error: result.Message });
			return;
		}
		res.status(200).json(result);
	};
}
