// src/cuites/controller/getLikes.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { getLikesService } from "../service/getLikes.service";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/likes:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Récupérer les likes d’une cuite
 *     description: Retourne le nombre total de likes et la liste des utilisateurs qui ont liké.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuite
 *     responses:
 *       200:
 *         description: Liste des likes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLikes:
 *                   type: integer
 *                   description: Nombre total de likes
 *                 users:
 *                   type: array
 *                   description: Liste des utilisateurs ayant liké la cuite
 *                   items:
 *                     type: object
 *                     properties:
 *                       UserId:
 *                         type: integer
 *                         description: ID de l'utilisateur
 *                       Pseudo:
 *                         type: string
 *                         description: Pseudo de l'utilisateur
 *                       UserPicture:
 *                         type: string
 *                         description: URL de la photo de profil de l'utilisateur (signée)
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Cuite non trouvée
 *       500:
 *         description: Erreur serveur
 */
export function getLikesController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const cuiteId = Number.parseInt(req.params.cuiteId, 10);
		if (Number.isNaN(cuiteId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await getLikesService(cuiteId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}

		try {
			for (const user of result.users) {
				if (user.UserPicture) {
					const key = user.UserPicture.split("amazonaws.com/")[1];
					if (key) {
						user.UserPicture = await deps.s3Service.getSignedImageUrl(
							bucketName,
							key,
						);
					}
				}
			}
		} catch (e) {
			// On log mais on ne bloque pas la réponse si la signature d'URL échoue
			console.error("Erreur génération URL signée (likes):", e);
		}

		res.status(200).json(result);
	};
}
