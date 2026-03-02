import type { RequestHandler } from "express";
import { cronDailyService } from "../service/cronDaily.service";
import { cronNotificationService } from "../service/cronNotification.service";

/**
 * @swagger
 * /api/notifications/cron-notification:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Déclenche l'envoi de notifications planifiées
 *     description: >
 *       Point d'entrée admin pour déclencher des campagnes de notifications (ex: kickoff du défi à 19h,
 *       rappel "last call" le lendemain). Action **non idempotente** côté envoi, protégée par clé API.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type de campagne à déclencher
 *                 enum: [challenge_kickoff, challenge_lastcall]
 *               override:
 *                 type: boolean
 *                 description: Force l’envoi même si un log d’envoi existe (bypass anti-spam). À utiliser avec précaution.
 *                 default: false
 *               payload:
 *                 type: object
 *                 description: Données spécifiques à la campagne (réservé pour extensions futures)
 *           examples:
 *             kickoff:
 *               summary: Kickoff du défi (19:00)
 *               value:
 *                 type: challenge_kickoff
 *             lastcall:
 *               summary: Rappel de dernière chance (J+1 ~14:00)
 *               value:
 *                 type: challenge_lastcall
 *     responses:
 *       '200':
 *         description: Campagne déclenchée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 type:
 *                   type: string
 *                   example: challenge_kickoff
 *                 challengeId:
 *                   type: integer
 *                   nullable: true
 *                   description: Identifiant du défi concerné (si applicable)
 *       '400':
 *         description: Requête invalide (type manquant/invalide)
 *       '401':
 *         description: Non authentifié (clé API absente/invalide)
 *       '403':
 *         description: Non autorisé (IP non autorisée / permissions insuffisantes)
 *       '429':
 *         description: Limite de requêtes atteinte (rate limit)
 *       '500':
 *         description: Erreur serveur
 */

export function cronNotificationController(): RequestHandler {
	return async (req, res) => {
		const { type } = req.body ?? {};
		if (!type) return res.status(400).json({ message: "Type is required" });

		await cronNotificationService(type);
		return res
			.status(200)
			.json({ message: "Cron notification executed", type });
	};
}
