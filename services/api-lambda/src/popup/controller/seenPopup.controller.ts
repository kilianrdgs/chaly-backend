import { RequestHandler } from "express";
import { HttpError, StatusCode } from "../../globals/http";
import { markPopupSeenRepo } from "../repository/markPopupSeen.repo";

/**
 * @swagger
 * /api/popup/seen:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Popup]
 *     summary: Marquer un popup comme vu par l’utilisateur
 *     description: |
 *       Enregistre que l’utilisateur a vu le popup, afin d’éviter qu’il soit affiché de nouveau.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - popupId
 *             properties:
 *               popupId:
 *                 type: integer
 *                 description: Identifiant du popup à marquer comme vu
 *                 example: 12
 *     responses:
 *       200:
 *         description: Popup marqué comme vu avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Requête invalide (popupId manquant ou invalide)
 *       404:
 *         description: Popup non trouvé
 *       500:
 *         description: Erreur serveur
 */

export function seenPopupController(): RequestHandler {
  return async (req, res) => {
    try {
      const userId = res.locals.userId;
      const { popupId } = req.body;

      if (!popupId) {
        return res.status(400).json({
          error: "popupId_missing",
          message: "Le champ popupId est requis",
        });
      }

      await markPopupSeenRepo(userId, popupId);

      return res.status(StatusCode.Ok).json({ success: true });
    } catch (e) {
      console.error(e);

      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({
          error: e.error,
          message: e.message,
        });
      }

      return res.status(500).json({ error: "server_error" });
    }
  };
}
