import { Request, Response, RequestHandler } from "express";
import { getAnalyticsStatsService } from "../service/getAnalyticsStats.service";

interface GetAnalyticsStatsBody {
  date: string;
  actionTypes?: string[];
}

/**
 * @swagger
 * /api/admin/analytics/stats:
 *   post:
 *     tags: [Admin]
 *     summary: Récupérer les statistiques de fréquentation pour une journée
 *     description: |
 *       Retourne les statistiques de fréquentation pour une journée spécifique :
 *       - Pic d'utilisateurs actifs (heure de pointe)
 *       - Distribution des utilisateurs actifs par heure (00-23) en heure de Paris
 *
 *       Par défaut, filtre sur les actions ACTIVITY (ouvertures d'app) pour mesurer la fréquentation réelle.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date de la journée à analyser (format YYYY-MM-DD)
 *                 example: "2025-11-29"
 *               actionTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [ACTIVITY, POST_CUITE, DELETE_CUITE, LIKE, UNLIKE, COMMENT, DELETE_COMMENT]
 *                 description: Types d'actions à filtrer (optionnel, recommandé ["ACTIVITY"] pour la fréquentation)
 *                 example: ["ACTIVITY"]
 *     responses:
 *       200:
 *         description: Statistiques de fréquentation récupérées avec succès
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
 *                   example: Analytics stats fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-11-29"
 *                     peakActiveUsers:
 *                       type: integer
 *                       description: Pic d'utilisateurs actifs (heure de pointe)
 *                       example: 31
 *                     byHour:
 *                       type: array
 *                       description: Utilisateurs actifs uniques par heure (00-23) en heure de Paris, triés chronologiquement
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: string
 *                             example: "00"
 *                           activeUsers:
 *                             type: integer
 *                             example: 3
 *       400:
 *         description: Paramètres invalides (dates manquantes ou types d'actions invalides)
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur interne
 */

export function getAnalyticsStatsController(): RequestHandler {
  return async (req: Request<{}, {}, GetAnalyticsStatsBody>, res: Response) => {
    try {
      const { date, actionTypes } = req.body;

      // Vérif présence date
      if (!date) {
        return res.status(400).json({
          success: false,
          message: "date is required",
        });
      }

      // Normalisation de la date : supporter YYYY-MM-DD ou ISO
      let normalizedDate = date;

      // Si format ISO → extraire uniquement la partie YYYY-MM-DD
      if (date.includes("T")) {
        normalizedDate = date.split("T")[0];
      }

      // Vérifier format final YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Expected YYYY-MM-DD",
        });
      }

      // Créer les dates pour couvrir toute la journée en timezone Paris
      // Calculer l'offset de Paris par rapport à UTC pour cette date spécifique
      const [year, month, day] = normalizedDate.split("-").map(Number);

      // Créer une date test à midi pour déterminer l'offset (gère DST)
      const testDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      const parisTestStr = testDate.toLocaleString("en-US", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        hour12: false,
      });
      const utcHour = 12;
      const parisHour = parseInt(parisTestStr);
      const offsetHours = parisHour - utcHour;

      // Créer les dates UTC qui correspondent à 00:00:00 et 23:59:59 Paris
      // Si Paris est UTC+1, alors 00:00 Paris = 23:00 UTC (jour précédent)
      // Si Paris est UTC+2, alors 00:00 Paris = 22:00 UTC (jour précédent)
      const startDate = new Date(Date.UTC(year, month - 1, day, -offsetHours, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 23 - offsetHours, 59, 59, 999));

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Expected YYYY-MM-DD",
        });
      }

      // Appel du service
      const result = await getAnalyticsStatsService({
        startDate,
        endDate,
        actionTypes,
      });

      const dayStats = result.days[0];

      // Réponse
      res.status(200).json({
        success: true,
        message: "Analytics stats fetched successfully",
        data: dayStats || {
          date,
          peakActiveUsers: 0,
          byHour: Array.from({ length: 24 }, (_, h) => ({
            hour: h.toString().padStart(2, "0"),
            activeUsers: 0,
          })),
        },
      });
    } catch (error) {
      console.error("❌ Error fetching analytics stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics stats",
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
    }
  };
}
