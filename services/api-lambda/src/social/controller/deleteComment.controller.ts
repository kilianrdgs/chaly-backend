// src/cuites/controller/deleteComment.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { deleteCommentService } from "../service/deleteComment.service";

/**
 * @swagger
 * /api/social/cuites/{commentId}/comment:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Supprimer un commentaire sur une cuite
 *     description: Supprime un commentaire spécifique sur une cuite.
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer }
 *         description: ID du commentaire à supprimer
 *     responses:
 *       202: { description: Commentaire supprimé avec succès }
 *       400: { description: Commentaire manquant ou vide }
 *       403: { description: Non autorisé }
 *       404: { description: Cuite non trouvée }
 *       500: { description: Erreur serveur }
 */
export function deleteCommentController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const commentId = Number.parseInt(req.params.commentId, 10);
		console.log("----- id du comm ----", commentId);
		if (Number.isNaN(commentId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const result = await deleteCommentService(commentId, userId);
		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ error: result.Message });
			return;
		}

		res.status(202).json(result);
	};
}
