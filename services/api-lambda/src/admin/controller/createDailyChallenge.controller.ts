import type { RequestHandler } from "express";
import { createDailyChallengeService } from "../../challenges/service/createDailyChallenge.service";

/**
 * @swagger
 * /api/admin/daily-challenge:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un nouveau défi quotidien
 *     description: Crée un nouveau défi quotidien pour la journée courante.
 *                  Cette route ne prend aucun paramètre et force la création
 *                  (ou l'upsert) d'un challenge.
 *     responses:
 *       200:
 *         description: Défi créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Id:
 *                   type: integer
 *                   example: 42
 *                 dateKey:
 *                   type: integer
 *                   example: 20251004
 *                 startsAtUtc:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-04T17:00:00.000Z"
 *                 endsAtUtc:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-05T17:00:00.000Z"
 *                 title:
 *                   type: string
 *                   example: "Défi du 4 octobre"
 *                 prompt:
 *                   type: string
 *                   example: null
 *       500:
 *         description: Erreur serveur
 */

export function createDailyChallengeController(): RequestHandler {
	return async (_req, res) => {
		const result = await createDailyChallengeService();

		res.status(200).json(result);
		return;
	};
}
