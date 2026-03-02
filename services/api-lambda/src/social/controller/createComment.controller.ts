// src/cuites/controller/createComment.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { StatusCode } from "../../globals/http";
import { createCommentService } from "../service/createComment.service";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/comment:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Créer un commentaire sur une cuite
 *     description: Crée un commentaire sur une cuite spécifique.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite à commenter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Contenu du commentaire
 *     responses:
 *       201: { description: Commentaire créé avec succès }
 *       400: { description: Commentaire manquant ou vide }
 *       403: { description: Non autorisé }
 *       404: { description: Cuite non trouvée }
 *       500: { description: Erreur serveur }
 */
export function createCommentController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const cuiteId = Number.parseInt(req.params.cuiteId, 10);
		const comment = req.body.comment as string;

		console.log("ici --------------", cuiteId, comment);

		if (!comment || comment.trim() === "") {
			res
				.status(StatusCode.BadRequest)
				.json({ error: "Commentaire manquant ou vide" });
			return;
		}

		const result = await createCommentService(deps, cuiteId, userId, comment);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ error: result.Message });
			return;
		}

		res.status(StatusCode.Created).json(result);
	};
}
