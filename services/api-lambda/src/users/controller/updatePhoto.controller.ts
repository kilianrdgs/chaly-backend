import path from "node:path";
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { updatePhotoService } from "../service/updatePhoto.service";

/**
 * @swagger
 * /api/users/photo:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     summary: Met à jour la photo de profil de l'utilisateur
 *     description: Permet de mettre à jour la photo de profil de l'utilisateur connecté
 *     consumes: [multipart/form-data]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [media]
 *             properties:
 *               media: { type: string, format: binary, description: Photo de profil à télécharger }
 *     responses:
 *       200: { description: Photo de profil mise à jour avec succès }
 *       400:
 *         description: Requête invalide ou fichier manquant
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: Token manquant ou invalide }
 *       500: { description: Erreur serveur }
 */
export function updatePhotoController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		if (!req.file) {
			res.status(400).json({ message: "Fichier manquant ou type invalide" });
			return;
		}

		const ext = path.extname(req.file.originalname);
		const result = await updatePhotoService(deps, userId, req.file, ext);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json(result.Message);
			return;
		}
		res.status(200).json(result);
	};
}
