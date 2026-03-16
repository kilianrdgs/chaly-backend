import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { blockUserService } from "../service/blockUser.service";

/**
 * @swagger
 * /api/social/users/{userId}/block:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Bloquer un utilisateur
 *     description: Bloque un utilisateur spécifique.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de l'utilisateur à bloquer
 *     responses:
 *       200:
 *         description: Utilisateur bloqué avec succès
 *       400:
 *         description: ID invalide ou tentative de se bloquer soi-même
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
export const blockUserController: RequestHandler = async (req, res) => {
	const blockerId = res.locals.userId;
	const blockedId = Number.parseInt(req.params.userId, 10);

	if (Number.isNaN(blockedId)) {
		res.status(400).json({ error: "ID invalide" });
		return;
	}

	const result = await blockUserService(blockerId, blockedId);
	if (result instanceof CustomError) {
		res.status(result.StatusCode ?? 500).json(result.Message);
		return;
	}

	res.status(200).json(result);
};
