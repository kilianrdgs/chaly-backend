import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { getCuiteByIdService } from "../service/getCuiteById.service";
import type { ServiceDeps } from "../service/types";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/cuites/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Cuites
 *     summary: Récupérer une cuite par son ID
 *     description: Récupère les détails d'une cuite spécifique avec ses likes et commentaires
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuite
 *     responses:
 *       200:
 *         description: Détails de la cuite
 *       404:
 *         description: Cuite introuvable
 *       500:
 *         description: Erreur serveur
 */

export function getCuiteByIdController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		const cuiteId = Number.parseInt(req.params.id as string);

		if (Number.isNaN(cuiteId)) {
			res.status(400).json({ message: "ID de cuite invalide" });
			return;
		}

		try {
			const result = await getCuiteByIdService(cuiteId, userId);

			if (result instanceof CustomError) {
				res.status(result.StatusCode ?? 500).json(result.Message);
				return;
			}

			// Générer les URLs signées pour S3
			if (result.UrlPicture) {
				try {
					const key = result.UrlPicture.split("amazonaws.com/")[1];
					result.UrlPicture = await deps.s3Service.getSignedImageUrl(
						bucketName,
						key,
					);
				} catch (e) {
					console.error(`Erreur URL signée image cuite ${result.Id}`, e);
				}
			}
			if (result.UserPicture) {
				try {
					const ukey = result.UserPicture.split("amazonaws.com/")[1];
					result.UserPicture = await deps.s3Service.getSignedImageUrl(
						bucketName,
						ukey,
					);
				} catch (e) {
					console.error(`Erreur URL signée image user ${result.Id}`, e);
				}
			}

			res.status(200).json(result);
		} catch (error) {
			console.error("Erreur lors de la récupération de la cuite:", error);
			res
				.status(500)
				.json({ message: "Erreur serveur lors de la récupération de la cuite" });
		}
	};
}
