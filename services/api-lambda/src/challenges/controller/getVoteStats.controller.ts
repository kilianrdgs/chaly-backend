import type { RequestHandler } from "express";
import { getVoteStatsService } from "../service/getVoteStats.service";

/**
 * @swagger
 * /api/challenges/{challengeId}/votes/stats:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Challenges]
 *     summary: Récupérer les statistiques de votes d’un challenge
 *     description: |
 *       Retourne les statistiques complètes des votes pour un challenge donné :
 *       - nombre total de votes
 *       - détail des votes (quel utilisateur a voté pour quelle photo)
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         description: Identifiant du challenge
 *         schema:
 *           type: number
 *           example: "81"
 *     responses:
 *       200:
 *         description: Statistiques de votes récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [challengeId, totalVotes, votes]
 *               properties:
 *                 challengeId:
 *                   type: string
 *                   description: Identifiant du challenge
 *                   example: "a6c7b5c0-2a6f-4ab9-9a4e-5e1f6d9f3c12"
 *                 totalVotes:
 *                   type: integer
 *                   description: Nombre total de votes enregistrés pour ce challenge
 *                   example: 42
 *                 votes:
 *                   type: array
 *                   description: Liste détaillée des votes
 *                   items:
 *                     type: object
 *                     required: [voter, photoId, votedAt]
 *                     properties:
 *                       voter:
 *                         type: object
 *                         required: [id, pseudo]
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Identifiant de l’utilisateur votant
 *                             example: "u_12"
 *                           pseudo:
 *                             type: string
 *                             description: Pseudo de l’utilisateur votant
 *                             example: "chalyman"
 *                           avatarUrl:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                             example: "https://cdn.chaly.app/u_12.png"
 *                       photoId:
 *                         type: string
 *                         description: Identifiant de la photo votée
 *                         example: "ph_987"
 *                       votedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date du vote
 *                         example: "2025-12-20T18:42:11.000Z"
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Challenge introuvable
 *       429:
 *         description: Trop de requêtes
 *       500:
 *         description: Erreur serveur
 */

export function getVoteStatsController(): RequestHandler {
  return async (req, res) => {
    const challengeId = Number(req.params.challengeId);
    const result = await getVoteStatsService(challengeId);
    return res.status(200).json(result);
  };
}
