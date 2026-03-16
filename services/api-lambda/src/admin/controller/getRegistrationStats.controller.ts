import { Request, Response, RequestHandler } from "express";
import { getRegistrationStatsService } from "../service/getRegistrationStats.service";

interface GetRegistrationStatsBody {
  startDate?: string;
  endDate?: string;
}

/**
 * @swagger
 * /api/admin/registration/stats:
 *   post:
 *     tags: [Admin]
 *     summary: Récupérer les statistiques d'inscription des utilisateurs
 *     description: |
 *       Retourne les statistiques d'inscription sur une période donnée :
 *       - Série temporelle jour par jour avec nouveaux utilisateurs et total cumulé
 *       - Statistiques de croissance sur les 7 derniers jours vs les 7 jours précédents
 *
 *       Par défaut, retourne les stats des 30 derniers jours
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date de début de la période (format YYYY-MM-DD, optionnel, défaut = 30 jours avant aujourd'hui)
 *                 example: "2025-10-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Date de fin de la période (format YYYY-MM-DD, optionnel, défaut = aujourd'hui)
 *                 example: "2025-12-02"
 *     responses:
 *       200:
 *         description: Statistiques d'inscription récupérées avec succès
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
 *                   example: Registration stats fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-10-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-12-02"
 *                     timeseries:
 *                       type: array
 *                       description: Série temporelle des inscriptions jour par jour
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-10-01"
 *                           newUsers:
 *                             type: integer
 *                             description: Nombre de nouveaux utilisateurs ce jour
 *                             example: 3
 *                           totalUsers:
 *                             type: integer
 *                             description: Nombre total cumulé d'utilisateurs
 *                             example: 3
 *                     growth:
 *                       type: object
 *                       description: Statistiques de croissance (période actuelle vs période précédente de même durée)
 *                       properties:
 *                         currentPeriod:
 *                           type: integer
 *                           description: Nombre d'inscriptions durant la période sélectionnée
 *                           example: 14
 *                         previousPeriod:
 *                           type: integer
 *                           description: Nombre d'inscriptions durant la période précédente (même durée)
 *                           example: 8
 *                         growthFactor:
 *                           type: number
 *                           description: Facteur de croissance (currentPeriod / previousPeriod)
 *                           example: 1.75
 *       400:
 *         description: Paramètres invalides (format de date incorrect)
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur interne
 */

export function getRegistrationStatsController(): RequestHandler {
  return async (req: Request<{}, {}, GetRegistrationStatsBody>, res: Response) => {
    try {
      const { startDate: startDateStr, endDate: endDateStr } = req.body;

      // Dates par défaut : 30 derniers jours
      const now = new Date();
      let endDate = new Date(now);
      let startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);

      // Parse startDate si fourni
      if (startDateStr) {
        let normalizedStartDate = startDateStr;

        // Si format ISO → extraire uniquement la partie YYYY-MM-DD
        if (startDateStr.includes("T")) {
          normalizedStartDate = startDateStr.split("T")[0];
        }

        // Vérifier format final YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedStartDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate format. Expected YYYY-MM-DD",
          });
        }

        const [year, month, day] = normalizedStartDate.split("-").map(Number);
        startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate format. Expected YYYY-MM-DD",
          });
        }
      }

      // Parse endDate si fourni
      if (endDateStr) {
        let normalizedEndDate = endDateStr;

        // Si format ISO → extraire uniquement la partie YYYY-MM-DD
        if (endDateStr.includes("T")) {
          normalizedEndDate = endDateStr.split("T")[0];
        }

        // Vérifier format final YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedEndDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate format. Expected YYYY-MM-DD",
          });
        }

        const [year, month, day] = normalizedEndDate.split("-").map(Number);
        endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate format. Expected YYYY-MM-DD",
          });
        }
      }

      // Appel du service
      const result = await getRegistrationStatsService({
        startDate,
        endDate,
      });

      // Réponse
      res.status(200).json({
        success: true,
        message: "Registration stats fetched",
        data: result,
      });
    } catch (error) {
      console.error("❌ Error fetching registration stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch registration stats",
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
    }
  };
}
