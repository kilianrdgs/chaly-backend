import type { RequestHandler } from "express";
import { createDailyChallengeService } from "../../challenges/service/createDailyChallenge.service";
import { cronDailyService } from "../service/cronDaily.service";

/**
 * @swagger
 * /api/notifications/cron-daily:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Envoie des notifications quotidiennes aux utilisateurs
 *     description: Envoie des notifications push quotidiennes aux utilisateurs pour les informer des nouvelles cuites et activités.
 *     responses:
 *       '200':
 *         description: Point de la cuite récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CuitePoint'
 *       '400':
 *         description: Paramètres invalides
 *       '403':
 *         description: Non autorisé
 *       '404':
 *         description: Cuite non trouvée
 *       '500':
 *         description: Erreur serveur
 */

export function cronDailyController(): RequestHandler {
	return async (req, res) => {
		const result = await createDailyChallengeService();
		cronDailyService();
		res.status(200).json({ message: "Cron daily executed" });
	};
}
