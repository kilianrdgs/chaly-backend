// src/cuites/controller/likeDelete.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { likeDeleteService } from "../service/likeDelete.service";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/like:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Supprimer like
 *     description: Supprime le like d'une cuite spécifique.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite à retirer le like
 *     responses:
 *       200:
 *         description: Like supprimé avec succès
 *       400:
 *         description: ID invalide
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Cuite non trouvée
 *       500:
 *         description: Erreur serveur
 */
export function unlikeCuiteController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const cuiteId = Number.parseInt(req.params.cuiteId, 10);
		if (Number.isNaN(cuiteId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await likeDeleteService(cuiteId, userId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}

		res.status(200).json(result);
	};
}
