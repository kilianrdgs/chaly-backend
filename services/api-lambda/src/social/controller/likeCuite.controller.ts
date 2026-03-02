// src/cuites/controller/likeCuite.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { likeCuiteService } from "../service/likeCuite.service";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/like:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Aimer une cuite
 *     description: Aime une cuite spécifique.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite à aimer
 *     responses:
 *       200:
 *         description: Cuite aimée avec succès
 *       400:
 *         description: ID invalide
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Cuite non trouvée
 *       500:
 *         description: Erreur serveur
 */
export function likeCuiteController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const cuiteId = Number.parseInt(req.params.cuiteId, 10);
		if (Number.isNaN(cuiteId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await likeCuiteService(deps, cuiteId, userId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}

		res.status(200).json(result);
	};
}
