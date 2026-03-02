import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";
import { verifyCodeService } from "../service/verifyCode.service";

/**
 * @swagger
 * /api/auth/verify-code:
 *   post:
 *     tags: [Auth]
 *     summary: Vérifie le code à 6 chiffres
 *     description: renvoie AccessToken et RefreshToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, phone]
 *             properties:
 *               code:  { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès
 *       500:
 *         description: Erreur serveur
 */

export function verifyCodeController(): RequestHandler {
	return async (req, res) => {
		try {
			const { code, phone } = req.body;
			const response = await verifyCodeService(code, phone);

			if (response instanceof CustomError) {
				return res.status(response.StatusCode).json({
					error: response.Message,
				});
			}

			if (response?.isNewUser) {
				return res.status(StatusCode.Created).json(response);
			}

			return res.status(StatusCode.Ok).json(response);
		} catch (e) {
			console.error(e);

			if (e instanceof HttpError) {
				return res.status(e.statusCode).json({
					error: e.error,
					message: e.message,
				});
			}

			res
				.status(StatusCode.InternalServerError)
				.json({ error: "Erreur serveur" });
		}
	};
}
