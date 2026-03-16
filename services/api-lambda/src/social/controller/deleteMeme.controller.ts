import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { deleteMemeService } from "../service/deleteMeme.service";
import type { ServiceDeps } from "../../cuites/service/types";

/**
 * @swagger
 * /api/social/memes/{memeId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Social
 *     summary: Supprime un meme
 *     description: Supprime un meme spécifique (image S3 + entrée BDD). L'utilisateur doit être le propriétaire du meme ou modérateur.
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du meme
 *     responses:
 *       202:
 *         description: Meme supprimé avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Meme non trouvé
 *       500:
 *         description: Erreur serveur
 */
export function deleteMemeController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const memeId = Number.parseInt(req.params.memeId, 10);
		if (Number.isNaN(memeId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await deleteMemeService(deps, memeId, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ message: result.Message });
			return;
		}

		res.status(202).json(result);
	};
}
