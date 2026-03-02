import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { updateDescriptionService } from "../service/updateDescription.service";

/**
 * @swagger
 * /api/users/description:
 *   patch:
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Met à jour la description (bio) de l'utilisateur connecté
 *     description: Met à jour la description (bio) de l'utilisateur connecté. Requiert un header **Authorization** (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 160
 *                 description: Nouvelle bio de l'utilisateur
 *                 example: "Toujours en quête de vibes 🔮"
 *     responses:
 *       200: { description: Description mise à jour avec succès (corps vide) }
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function updateDescriptionController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const description = req.body.description as string | undefined;

		if (description === undefined) {
			res
				.status(400)
				.json({ message: "Missing 'description' in request body" });
			return;
		}

		const result = await updateDescriptionService(description, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json();
	};
}
