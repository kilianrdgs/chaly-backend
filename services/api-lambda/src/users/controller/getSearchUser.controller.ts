import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { searchUsersService } from "../service/searchUsers.service";

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Recherche d'utilisateurs par préfixe
 *     description: Retourne les 10 utilisateurs les plus récemment actifs dont le pseudo commence par le préfixe donné (par exemple, '@k' retourne les utilisateurs dont le pseudo commence par 'k')
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
 *         description: Préfixe de recherche (peut commencer par '@' ou non). Si vide ou '@', retourne tous les utilisateurs actifs
 *         example: k
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: number, default: 10 }
 *         description: Nombre maximum d'utilisateurs à retourner
 *     responses:
 *       200:
 *         description: Liste des utilisateurs trouvés, triés par activité récente (LastActiveAt)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id: { type: number }
 *                   Pseudo: { type: string }
 *                   PhotoUrl: { type: string, nullable: true }
 *                   XpTotal: { type: number }
 *                   IsVerified: { type: boolean }
 *                   IsCertified: { type: boolean }
 *       400: { description: Paramètre de recherche manquant ou invalide }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function getSearchUserController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		let searchQuery = (req.query.q as string) || "";
		const limitParam = req.query.limit as string | undefined;

		// Supprimer le '@' si présent au début
		if (searchQuery.startsWith("@")) {
			searchQuery = searchQuery.substring(1);
		}

		const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

		const result = await searchUsersService(deps, searchQuery, limit);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json(result);
	};
}
