// createCuite.controller.ts
import path from "node:path";
import type { Request, Response } from "express";

import type { CuiteData } from "../models/cuite.model";
import { createCuiteService } from "../service/createCuite.service";
import type { ServiceDeps } from "../service/types";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/cuites:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Cuites]
 *     summary: Créer une nouvelle cuite
 *     description: Crée une nouvelle entrée de cuite avec les détails fournis et une image optionnelle.
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: object
 *                 required: [CuiteDate]
 *                 properties:
 *                   Titre:
 *                     type: string
 *                   Description:
 *                     type: string
 *                   CuiteDate:
 *                     type: string
 *                     format: date-time
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Media associée à la cuite
 *     responses:
 *       201: { description: Cuite créée avec succès }
 *       400: { description: Données invalides }
 *       500: { description: Erreur serveur }
 */

export function createCuiteController(deps: ServiceDeps) {
	return async function createCuiteHandler(req: Request, res: Response) {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		let cuiteData: Partial<CuiteData>;
		try {
			cuiteData = req.body?.data
				? typeof req.body.data === "string"
					? JSON.parse(req.body.data)
					: req.body.data
				: undefined;
		} catch {
			res.status(400).json({ message: "Format de données JSON invalide" });
			return;
		}
		if (!cuiteData) {
			res.status(400).json({ message: "Données manquantes" });
			return;
		}

		let imageUrl: string | undefined;
		if (req.file) {
			const ext = path.extname(req.file.originalname);
			const key = `cuites/${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 15)}${ext}`;
			imageUrl = await deps.s3Service.uploadFileToS3(req.file, bucketName, key);
		}

		const cuite: CuiteData = {
			Id: null,
			UserId: userId,
			Titre: cuiteData.Titre ?? null,
			Description: cuiteData.Description ?? null,
			CuiteDate: cuiteData.CuiteDate
				? new Date(cuiteData.CuiteDate as unknown as string)
				: new Date(),
			ImageUrl: imageUrl ?? null,
		};

		const result = await createCuiteService(deps, cuite);
		res.status(201).json(result);
	};
}
