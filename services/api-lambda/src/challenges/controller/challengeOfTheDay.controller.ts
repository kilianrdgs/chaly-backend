import type { RequestHandler } from "express";
import { challengeOfTheDayService } from "../service/challengeOfTheDay.service";

/**
 * @swagger
 * /api/challenges/challenge-of-the-day:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *       - ServerKeyAuth: []
 *     tags: [Challenges]
 *     summary: Récupérer les infos du défi quotidien
 *     description: Retourne le temps restant avant la fin du défi actuel et le nombre de participants.
 *     responses:
 *       200:
 *         description: Infos du défi quotidien récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remainingMs:
 *                   type: integer
 *                   description: Temps restant en millisecondes avant la fin du challenge
 *                   example: 86399999
 *                 participants:
 *                   type: integer
 *                   description: Nombre total d’utilisateurs ayant participé au challenge
 *                   example: 42
 *       404:
 *         description: Aucun challenge en cours trouvé
 *       500:
 *         description: Erreur serveur
 */

export function challengeOfTheDayController(): RequestHandler {
	return async (_req, res) => {
		const result = await challengeOfTheDayService();

		res.status(200).json(result);
	};
}
