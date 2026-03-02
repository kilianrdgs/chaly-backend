import type { RequestHandler } from "express";
import { getDailyChallengeWinnersService } from "../service/getDailyChallengeWinners.service";

/**
 * @swagger
 * /api/challenges/{challengeId}/winners:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *       - ServerKeyAuth: []
 *     tags: [Challenges]
 *     summary: Récupérer les gagnants d’un défi
 *     description: Retourne le Top N des gagnants pour un défi finalisé (par défaut Top 3).
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         description: Identifiant du défi (UUID ou ID interne)
 *         schema:
 *           type: string
 *           example: "a6c7b5c0-2a6f-4ab9-9a4e-5e1f6d9f3c12"
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Nombre de gagnants à retourner (par défaut 3)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 3
 *     responses:
 *       200:
 *         description: Gagnants récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challengeId:
 *                   type: string
 *                   description: Identifiant du défi
 *                   example: "a6c7b5c0-2a6f-4ab9-9a4e-5e1f6d9f3c12"
 *                 finalizedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Timestamp de finalisation des résultats (null si non finalisé)
 *                   example: "2025-10-04T17:00:35.000Z"
 *                 version:
 *                   type: integer
 *                   nullable: true
 *                   description: Version des résultats (utile si re-calcul/modération)
 *                   example: 2
 *                 winners:
 *                   type: array
 *                   description: Liste ordonnée des gagnants (Top N)
 *                   items:
 *                     type: object
 *                     required: [rank, photoId, user, score, photoUrl]
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         description: Rang (1 = premier)
 *                         example: 1
 *                       photoId:
 *                         type: string
 *                         description: Identifiant de la photo gagnante
 *                         example: "ph_123"
 *                       user:
 *                         type: object
 *                         required: [id, pseudo]
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "u_42"
 *                           pseudo:
 *                             type: string
 *                             example: "kiks"
 *                           avatarUrl:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                             example: "https://cdn.chaly.app/u_42.png"
 *                       score:
 *                         type: number
 *                         description: Score/points utilisés pour classer
 *                         example: 128
 *                       photoUrl:
 *                         type: string
 *                         format: uri
 *                         description: URL de la photo
 *                         example: "https://cdn.chaly.app/ph_123.jpg"
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Défi non trouvé ou pas encore finalisé
 *       429:
 *         description: Trop de requêtes
 *       500:
 *         description: Erreur serveur
 */

export function getDailyChallengeWinnersController(): RequestHandler {
	return async (_req, res) => {
		const challengeId = _req.params.challengeId;

		const result = await getDailyChallengeWinnersService(challengeId);

		res.status(200).json(result);
	};
}
