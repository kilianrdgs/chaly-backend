import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { updateBackgroundColorService } from "../service/updateBackgroundColor.service";

/**
 * @swagger
 * /api/users/background-color:
 *   patch:
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Met à jour la couleur unie de l'arrière-plan du profil
 *     description: |
 *       Met à jour la **couleur d'arrière-plan** (mode couleur unie) de l'utilisateur connecté.
 *       Requiert un header **Authorization** (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [color]
 *             properties:
 *               color:
 *                 type: string
 *                 pattern: "^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$"
 *                 description: Couleur hexadécimale (#RRGGBB ou #RGB)
 *                 example: "#ff00ff"
 *     responses:
 *       200: { description: Couleur d'arrière-plan mise à jour avec succès }
 *       400:
 *         description: Requête invalide (ex. couleur hex invalide)
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function updateBackgroundColorController(
	deps: ServiceDeps,
): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const color = req.body.color as string | undefined;

		if (color === undefined) {
			res.status(400).json({ message: "Missing 'color' in request body" });
			return;
		}

		const result = await updateBackgroundColorService(color, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json();
	};
}
