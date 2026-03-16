import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { getUsersGlobalPostService } from "../service/getUsersGlobalPost.service";

/**
 * @swagger
 * /api/users/global-posts:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     tags: [Users]
 *     summary: Récupère le classement global des utilisateurs
 *     description: Retourne une liste paginée des utilisateurs ayant posté le plus de cuites, triée par nombre de cuites décroissant.
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, default: 9 }
 *         description: Nombre maximum d’éléments à retourner
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema: { type: string }
 *         description: Curseur de pagination pour récupérer la page suivante
 *     responses:
 *       200: { description: Cuite globales récupérées avec succès }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function getUserGlobalPostController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const limit = Number.parseInt(req.query.limit as string, 10) || 9;
		const cursor = (req.query.cursor as string) || null;

		const result = await getUsersGlobalPostService(deps, limit, cursor);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json(result);
	};
}
