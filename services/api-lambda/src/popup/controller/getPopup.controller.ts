import type { RequestHandler } from "express";
import { getPopupRepo } from "../repository/getPopup.repo";
import { HttpError, StatusCode } from "../../globals/http";

/**
 * @swagger
 * /api/popup:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Popup]
 *     summary: Récupérer le popup actif pour l’utilisateur
 *     description: |
 *       Retourne le popup actif le plus récent **si l’utilisateur ne l’a jamais vu**.
 *       Retourne `popup: null` si :
 *         - aucun popup actif n’existe
 *         - l’utilisateur a déjà vu le popup actif
 *     responses:
 *       200:
 *         description: Popup récupéré avec succès ou aucun popup à afficher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 popup:
 *                   type: object
 *                   nullable: true
 *                   description: Le popup à afficher ou null
 *                   example:
 *                     Id: 12
 *                     Version: "1.4.0"
 *                     Title: "🔥 Mise à jour 1.4"
 *                     Content:
 *                       sections:
 *                         - type: "text"
 *                           title: "🔥 Nouveautés"
 *                           content: "Voici ce qui change :"
 *                         - type: "list"
 *                           items:
 *                             - "Feed en temps réel"
 *                             - "Corrections de bugs"
 *                             - "Popup dynamique"
 *                     IsActive: true
 *                     CreatedAt: "2025-11-17T17:30:00.000Z"
 *       500:
 *         description: Erreur serveur
 */

export function getPopupController(): RequestHandler {
  return async (_req, res) => {
    try {
      const userId = res.locals.userId;
      console.log("User ID:", userId);
      const popup = await getPopupRepo(userId);

      return res.status(StatusCode.Ok).json({ popup });
    } catch (e) {
      console.error(e);

      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({
          error: e.error,
          message: e.message,
        });
      }

      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({
          error: e.error,
          message: e.message,
        });
      }
    }
  };
}
