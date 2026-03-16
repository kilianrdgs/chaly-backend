import { RequestHandler } from "express";
import { sendNotificationTestService } from "../service/sendNotificationTest.service";

/**
 * @swagger
 * /api/admin/send-notification:
 *   post:
 *     tags: [Admin]
 *     summary: Envoie une notification de test
 *     description: |
 *       Endpoint de test pour vérifier le bon fonctionnement du système de notifications push.
 *       **Disponible uniquement en environnement DEV.**
 *     parameters:
 *       - in: query
 *         name: multiple
 *         schema:
 *           type: boolean
 *           default: false
 *         description: |
 *           Si `true`, envoie une notification groupée (multiple).
 *           Si `false`, envoie une notification push simple (unique).
 *       - in: query
 *         name: tokenPush
 *         schema:
 *           type: string
 *         description: |
 *           Token push du destinataire (requis uniquement si `multiple=false`).
 *           Si non fourni en mode unique, utilise le token de test par défaut.
 *         example: "20d7552116f70b3150fdb7b92c1ac5ca77c18d7b0cfced52926147053af03eff"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la notification
 *                 example: "🎉 Nouveau challenge"
 *               description:
 *                 type: string
 *                 description: Description de la notification
 *                 example: "Ton ami t'a lancé un nouveau défi !"
 *               postId:
 *                 type: integer
 *                 description: ID du post vers lequel rediriger
 *                 example: 2893
 *     responses:
 *       200:
 *         description: Notification de test envoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     resultMultiple:
 *                       type: object
 *                       description: Résultat de l'envoi multiple (si multiple=true)
 *                     singleNotificationSent:
 *                       type: boolean
 *                       description: Indique si une notification unique a été envoyée (si multiple=false)
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur interne
 */
export function sendNotificationTestController(): RequestHandler {
  return async (req, res) => {
    try {
      const { title, description, postId } = req.body;
      const { multiple, tokenPush } = req.query;

      if (!title || !description) {
        res.status(400).json({
          error: "INVALID_PARAMETERS",
          message: "Les champs 'title' et 'description' sont requis",
        });
        return;
      }

      const isMultiple = multiple === "true";
      const token = (tokenPush as string) || undefined;

      const result = await sendNotificationTestService(
        title,
        description,
        isMultiple,
        token,
        postId
      );

      res.status(200).json(result);
      return;
    } catch (error) {
      console.error("Error in sendNotificationTest:", error);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  };
}
