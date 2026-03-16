import { RequestHandler } from "express";
import { getStatsService } from "../service/getStats.service";

/**
 * @swagger
 * /api/admin/get-stats:
 *   get:
 *     tags: [Admin]
 *     summary: Récupérer les statistiques d’activité de l’application
 *     description: |
 *       Retourne les principales métriques d’engagement des utilisateurs :
 *       - **DAU** : utilisateurs actifs sur les dernières 24h
 *       - **WAU** : utilisateurs actifs sur les 7 derniers jours
 *       - **MAU** : utilisateurs actifs sur les 30 derniers jours
 *       - **total** : nombre total d’utilisateurs non bannis
 *       - **ratios** : pourcentages calculés (DAU/MAU, WAU/MAU, etc.)
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stats fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Nombre total d’utilisateurs non bannis
 *                       example: 121
 *                     dau:
 *                       type: integer
 *                       description: Utilisateurs actifs sur les dernières 24h
 *                       example: 15
 *                     wau:
 *                       type: integer
 *                       description: Utilisateurs actifs sur les 7 derniers jours
 *                       example: 34
 *                     mau:
 *                       type: integer
 *                       description: Utilisateurs actifs sur les 30 derniers jours
 *                       example: 44
 *                     usersWhoPosted:
 *                       type: integer
 *                       description: Nombre d'utilisateurs différents qui ont posté sur les dernières 24h
 *                       example: 28
 *                     avgLikesPerPhoto:
 *                       type: number
 *                       format: float
 *                       description: Nombre moyen de likes par photo sur les dernières 24h
 *                       example: 3.5
 *                     ratios:
 *                       type: object
 *                       description: Ratios calculés à partir des métriques
 *                       properties:
 *                         dauMau:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d’utilisateurs quotidiens parmi les actifs du mois (DAU/MAU)
 *                           example: 34.1
 *                         wauMau:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d’utilisateurs hebdo parmi les actifs du mois (WAU/MAU)
 *                           example: 77.3
 *                         dauAll:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d’utilisateurs quotidiens parmi tous les inscrits
 *                           example: 12.4
 *                         wauAll:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d’utilisateurs hebdo parmi tous les inscrits
 *                           example: 28.1
 *                         mauAll:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d'utilisateurs mensuels parmi tous les inscrits
 *                           example: 36.4
 *                         usersWhoPostedDau:
 *                           type: number
 *                           format: float
 *                           description: Pourcentage d'utilisateurs qui ont posté parmi les utilisateurs actifs quotidiens (usersWhoPosted/DAU)
 *                           example: 45.5
 *       401:
 *         description: Non authentifié
 *       429:
 *         description: Trop de requêtes
 *       500:
 *         description: Erreur serveur interne
 */

export function getStatsController(): RequestHandler {
  return async (_req, res) => {
    try {
      const result = await getStatsService();

      res.status(200).json({
        success: true,
        message: "Stats fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch stats",
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
    }
  };
}
