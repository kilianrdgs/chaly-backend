// cuites/controller/deleteCuite.controller.ts
import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { deleteCuiteService } from "../service/deleteCuite.service";
import type { ServiceDeps } from "../service/types";

/**
 * @swagger
 * /api/cuites/{id}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Cuites
 *     summary: Supprime une cuite
 *     description: Supprime une cuite spécifique.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuite
 *     responses:
 *       202:
 *         description: Accepted
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur serveur
 */
export function deleteCuiteController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await deleteCuiteService(deps, id, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}

		res.status(202).json(result);
	};
}
