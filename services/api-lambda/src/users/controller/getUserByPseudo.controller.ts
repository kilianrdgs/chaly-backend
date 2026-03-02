import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { getUserByPseudoService } from "../service/getUserByPseudo.service";

/**
 * @swagger
 * /api/users/{pseudo}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Récupère les informations d'un utilisateur par son pseudo
 *     description: Permet de récupérer les informations d'un utilisateur en fonction de son pseudo
 *     parameters:
 *       - in: path
 *         name: pseudo
 *         required: true
 *         schema: { type: string }
 *         description: Pseudo de l'utilisateur à récupérer
 *     responses:
 *       200:
 *         description: Informations utilisateur récupérées avec succès
 *       400: { description: Pseudo invalide ou non trouvé }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function getUserByPseudoController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const pseudo = req.params.pseudo;
		const result = await getUserByPseudoService(deps, pseudo);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json(result);
	};
}
