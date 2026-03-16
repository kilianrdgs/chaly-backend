import type { RequestHandler } from "express";
import getAppStateService from "../service/getAppState.service";

/**
 * @swagger
 * /api/app/app-state:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [App]
 *     summary: Récupérer l'état de l'application
 *     description: Récupère les informations sur le défi quotidien en cours, y compris le temps restant et le nombre de participants.
 *     responses:
 *       200:
 *         description: État de l'application récupéré avec succès
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

export function getAppStateController(): RequestHandler {
  return async (req, res) => {
    const userId = res.locals.userId;

    try {
      const result = await getAppStateService(userId);
      console.log("App State récupéré pour l'utilisateur", result);
      res.status(200).json(result);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'état de l'application:",
        error
      );
      res.status(500).json({
        message:
          "Erreur serveur lors de la récupération de l'état de l'application",
      });
    }
  };
}
