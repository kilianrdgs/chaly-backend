import type { RequestHandler } from "express";
import { requestCodeService } from "../service/requestCode.service";

/**
 * @swagger
 * /api/auth/request-code:
 *   post:
 *     tags: [Auth]
 *     summary: Envoie du numéro de téléphone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone: { type: string, description: "+336..." }
 *     responses:
 *       200: { description: Code envoyé }
 *       400: { description: Numéro invalide }
 *       500: { description: Erreur serveur }
 */
export function requestCodeController(): RequestHandler {
	return async (req, res) => {
		try {
			const { phone } = req.body;
			const out = await requestCodeService(phone);
			res.status(200).json(out);
		} catch (e) {
			console.error(e);
			res.status(500).json("Erreur serveur");
		}
	};
}
