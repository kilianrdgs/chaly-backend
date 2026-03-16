import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { getMemesListService } from "../service/getMemesList.service";
import type { ServiceDeps } from "../../cuites/service/types";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/social/memes:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Social
 *     summary: Récupérer une liste de memes
 *     description: Récupère une liste paginée de memes avec URLs signées. Optionnellement filtrer par userId pour récupérer les memes d'un utilisateur spécifique.
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de memes à retourner
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *         description: Curseur pour la pagination (ID du dernier meme récupéré)
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur pour filtrer ses memes uniquement
 *     responses:
 *       200:
 *         description: Liste paginée de memes
 *       500:
 *         description: Erreur serveur
 */

export function getMemesListController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const currentUserId = res.locals.userId;
		console.log("(***) - userId", currentUserId);

		const limit = Number.parseInt(req.query.limit as string) || 20;
		const cursor = (req.query.cursor as string) ?? null;
		const filterUserId = req.query.userId
			? Number.parseInt(req.query.userId as string)
			: null;

		try {
			const result = await getMemesListService(limit, cursor, filterUserId);

			if (result instanceof CustomError) {
				res.status(result.StatusCode ?? 500).json(result.Message);
				return;
			}

			// Générer les URLs signées pour les images des memes et les photos de profil
			for (const meme of result.memes) {
				if (meme.ImageUrl) {
					try {
						const key = meme.ImageUrl.split("amazonaws.com/")[1];
						meme.ImageUrl = await deps.s3Service.getSignedImageUrl(
							bucketName,
							key,
						);
					} catch (e) {
						console.error(`Erreur URL signée image meme ${meme.Id}`, e);
					}
				}
				if (meme.User.PhotoUrl) {
					try {
						const ukey = meme.User.PhotoUrl.split("amazonaws.com/")[1];
						meme.User.PhotoUrl = await deps.s3Service.getSignedImageUrl(
							bucketName,
							ukey,
						);
					} catch (e) {
						console.error(`Erreur URL signée photo user ${meme.Id}`, e);
					}
				}
			}

			res.status(200).json(result);
		} catch (error) {
			console.error("Erreur lors de la récupération des memes:", error);
			res
				.status(500)
				.json({ message: "Erreur serveur lors de la récupération des memes" });
		}
	};
}
