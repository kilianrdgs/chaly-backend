// src/cuites/controller/getComments.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { getCommentsService } from "../service/getComments.service";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/comments:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Récupérer les commentaires d'une cuite
 *     description: Récupère les commentaires associés à une cuite spécifique avec leurs images signées S3.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite
 *     responses:
 *       200:
 *         description: Liste des commentaires de la cuite
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id: { type: integer }
 *                   Comment: { type: string }
 *                   CreatedAt: { type: string, format: date-time }
 *                   UserPseudo: { type: string }
 *                   UserPicture:
 *                     type: string
 *                     nullable: true
 *                     description: URL signée de la photo de profil de l'utilisateur
 *                   ImageUrl:
 *                     type: string
 *                     nullable: true
 *                     description: URL signée de l'image du commentaire
 *                   Mentions:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     nullable: true
 *                     description: Liste des IDs des utilisateurs mentionnés dans le commentaire
 *       400: { description: ID invalide }
 *       403: { description: Non autorisé }
 *       404: { description: Cuite non trouvée }
 *       500: { description: Erreur serveur }
 */
export function getCommentsController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const cuiteId = Number.parseInt(req.params.cuiteId, 10);
		if (Number.isNaN(cuiteId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await getCommentsService(cuiteId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ error: result.Message });
			return;
		}

		for (const comment of result) {
			if (comment.UserPicture) {
				try {
					const key = comment.UserPicture.split("amazonaws.com/")[1];
					comment.UserPicture = await deps.s3Service.getSignedImageUrl(
						bucketName,
						key,
					);
				} catch (e) {
					console.error(
						`Erreur lors de la génération de l'URL signée UserPicture (comment ${comment.Id})`,
						e,
					);
				}
			}
			if (comment.ImageUrl) {
				try {
					const key = comment.ImageUrl.split("amazonaws.com/")[1];
					comment.ImageUrl = await deps.s3Service.getSignedImageUrl(
						bucketName,
						key,
					);
				} catch (e) {
					console.error(
						`Erreur lors de la génération de l'URL signée ImageUrl (comment ${comment.Id})`,
						e,
					);
				}
			}
		}

		res.status(200).json(result);
	};
}
