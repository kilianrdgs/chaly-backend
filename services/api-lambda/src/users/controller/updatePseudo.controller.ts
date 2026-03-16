import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { StatusCode } from "../../globals/http";
import { updatePseudoService } from "../service/updatePseudo.service";

/**
 * @swagger
 * /api/users/{pseudo}:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Modifie le pseudo de l'utilisateur
 *     description: Permet à un utilisateur connecté de modifier son pseudo.
 *     parameters:
 *       - in: path
 *         name: pseudo
 *         required: true
 *         schema: { type: string }
 *         description: Nouveau pseudo de l'utilisateur
 *     responses:
 *       200: { description: Pseudo mis à jour avec succès }
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string }, details: { type: string } } }
 */
export function updatePseudoController(): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const pseudo = req.params.pseudo;
		const result = await updatePseudoService(pseudo, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(StatusCode.Ok).json({ message: "PSEUDO_UPDATED" });
	};
}
