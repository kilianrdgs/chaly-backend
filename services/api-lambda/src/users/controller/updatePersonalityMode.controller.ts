import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { StatusCode } from "../../globals/http";
import { updatePersonalityModeService } from "../service/updatePersonalityMode.service";

/**
 * @swagger
 * /api/users/personality-mode:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Modifie le mode de personnalité de l'utilisateur
 *     description: Permet à un utilisateur connecté de modifier son mode de personnalité IA (default, clean, trash).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalityMode:
 *                 type: string
 *                 enum: [default, clean, trash]
 *     responses:
 *       200: { description: Mode de personnalité mis à jour avec succès }
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
export function updatePersonalityModeController(): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		const { personalityMode } = req.body;

		if (!personalityMode) {
			res.status(StatusCode.BadRequest).json({
				message: "PERSONALITY_MODE_REQUIRED",
			});
			return;
		}

		// Validation des modes de personnalité
		const validModes = ["default", "clean", "trash"];
		if (!validModes.includes(personalityMode)) {
			res.status(StatusCode.BadRequest).json({
				message: "INVALID_PERSONALITY_MODE",
			});
			return;
		}

		const result = await updatePersonalityModeService(personalityMode, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(StatusCode.Ok).json({ message: "PERSONALITY_MODE_UPDATED" });
	};
}
