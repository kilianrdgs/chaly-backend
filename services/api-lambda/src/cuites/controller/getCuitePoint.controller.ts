// cuites/controller/getCuitePointById.controller.ts
import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { getCuitePointByIdService } from "../service/getCuitePointById.service";
import type { ServiceDeps } from "../service/types";

/**
 * @swagger
 * /api/cuites/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Cuites
 *     summary: Récupérer le point de la cuite
 *     description: Récupère l'emplacement (point) d'une cuite par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuite
 *     responses:
 *       '200':
 *         description: Point de la cuite récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CuitePoint'
 *       '400':
 *         description: Paramètres invalides
 *       '403':
 *         description: Non autorisé
 *       '404':
 *         description: Cuite non trouvée
 *       '500':
 *         description: Erreur serveur
 */
export function getCuitePointByIdController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await getCuitePointByIdService(deps, id);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}

		res.status(200).json(result);
	};
}
