import type { RequestHandler } from "express";
import { prisma } from "../../globals/bdd";

/**
 * @swagger
 * /api/admin/popup:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un nouveau popup
 *     description: |
 *       Crée un popup dynamique pour afficher une mise à jour, une info ou tout autre message.
 *       Le champ `Content` est un JSON libre, permettant d'organiser des sections structurées
 *       (text, liste, CTA, sous-sections...).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Title
 *               - Content
 *             properties:
 *               Version:
 *                 type: string
 *                 nullable: true
 *                 example: "1.4.0"
 *               Title:
 *                 type: string
 *                 example: "🔥 Mise à jour 1.4"
 *               Content:
 *                 type: object
 *                 description: Structure JSON libre utilisée par l'app pour rendre le popup.
 *                 example:
 *                   sections:
 *                     - type: "list"
 *                       items:
 *                         - icon: "⚡"
 *                           title: "Feed plus rapide"
 *                           description: "Vois ce qui se passe à l'instant"
 *                         - icon: "✨"
 *                           title: "Animations améliorées"
 *                           description: "Expérience plus fluide et clean"
 *               IsActive:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Popup créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Id:
 *                   type: integer
 *                   example: 12
 *                 Version:
 *                   type: string
 *                   example: "1.4.0"
 *                 Title:
 *                   type: string
 *                   example: "🔥 Mise à jour 1.4"
 *                 Content:
 *                   type: object
 *                   example:
 *                     sections:
 *                       - type: "list"
 *                         items:
 *                           - icon: "⚡"
 *                             title: "Feed plus rapide"
 *                             description: "Vois ce qui se passe à l'instant"
 *                           - icon: "✨"
 *                             title: "Animations améliorées"
 *                             description: "Expérience plus fluide et clean"
 *                 IsActive:
 *                   type: boolean
 *                   example: false
 *                 CreatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-17T17:30:00.000Z"
 *       500:
 *         description: Erreur serveur
 */

export function createPopupController(): RequestHandler {
  return async (req, res) => {
    try {
      const { Version, Title, Content, IsActive } = req.body;

      const popup = await prisma.popup.create({
        data: {
          Version,
          Title,
          Content,
          IsActive: IsActive ?? false,
        },
      });

      return res.status(200).json(popup);
    } catch (err) {
      console.error("❌ Erreur create popup:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  };
}
