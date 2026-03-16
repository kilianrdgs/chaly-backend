import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { unblockUserService } from "../service/unblockUser.service";

/**
 * @swagger
 * /api/social/users/{userId}/block:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Débloquer un utilisateur
 *     description: Débloquer un utilisateur pr�c�demment bloqu�.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de l'utilisateur � d�bloquer
 *     responses:
 *       200:
 *         description: Utilisateur d�bloqu� avec succ�s
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Aucun blocage trouv�
 *       500:
 *         description: Erreur serveur
 */
export const unblockUserController: RequestHandler = async (req, res) => {
  const blockerId = res.locals.userId;
  const blockedId = Number.parseInt(req.params.userId, 10);

  if (Number.isNaN(blockedId)) {
    res.status(400).json({ error: "ID invalide" });
    return;
  }

  const result = await unblockUserService(blockerId, blockedId);
  if (result instanceof CustomError) {
    res.status(result.StatusCode ?? 500).json(result.Message);
    return;
  }

  res.status(200).json(result);
};
