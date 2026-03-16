import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { toggleBlurPhotoService } from "../service/toggleBlurPhoto.service";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/blur:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Toggle le floutage d'une photo
 *     description: Active ou désactive le floutage d'une photo (toggle IsBlurred)
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite dont on veut flouter/déflouter la photo
 *     responses:
 *       200:
 *         description: Photo floutée/défloutée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cuiteId:
 *                   type: number
 *                 isBlurred:
 *                   type: boolean
 *       400:
 *         description: ID invalide
 *       403:
 *         description: Non autorisé à modifier cette photo
 *       404:
 *         description: Photo non trouvée
 *       500:
 *         description: Erreur serveur
 */
export const toggleBlurPhotoController: RequestHandler = async (req, res) => {
	const userId = res.locals.userId;
	const cuiteId = Number.parseInt(req.params.cuiteId, 10);

	if (Number.isNaN(cuiteId)) {
		res.status(400).json({ error: "ID invalide" });
		return;
	}

	const result = await toggleBlurPhotoService(cuiteId, userId);
	if (result instanceof CustomError) {
		res.status(result.StatusCode ?? 500).json(result.Message);
		return;
	}

	res.status(200).json(result);
};
