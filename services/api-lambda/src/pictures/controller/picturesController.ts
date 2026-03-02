import type { Request, Response } from "express";
import multer from "multer";
import CustomError from "../../globals/customError";
import { getPersonalityModeRepo } from "../../users/repository/getPersonalityMode.repo";
import type PicturesService from "../service/picturesService";

const storage = multer.memoryStorage();

const upload = multer({
	storage: storage,
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/bmp",
			"image/tiff",
		];

		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(null, false);
		}
	},
});

/**
 * @swagger
 * /api/pictures/analyse:
 *   post:
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Pictures
 *     summary: Poster une photo pour analyse
 *     description: |
 *       Envoie une photo de soirée à l'API. Elle sera traitée pour générer un titre, une description et d'autres informations par un système d'intelligence artificielle.
 *       La photo est analysée via AWS Bedrock (Nova + Mistral) avec consentement RGPD.
 *     parameters:
 *       - name: challenge
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           Intitulé du défi du jour.
 *           Permet à l'IA de vérifier si la photo correspond bien au thème demandé.
 *           Exemple : "photographie quelque chose de rouge"
 *       - name: language
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [fr, en, es, pt]
 *         description: |
 *           Langue pour l'analyse IA (français, anglais, espagnol, portugais).
 *           Par défaut : "fr".
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - media
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Image de la soirée (JPEG, PNG, GIF, WebP, BMP, TIFF)
 *     responses:
 *       200:
 *         description: Analyse réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Dark Vapo 🌌💨"
 *                 description:
 *                   type: string
 *                   example: "AAAAAAAH T'ES UNE LÉGENDE LUMINEUSE 😭💨🌈 Là t'es pas en train de fumer, t'es en train de charger un sabre laser avec ta gorge 😭"
 *       400:
 *         description: Requête invalide (fichier manquant ou incorrect)
 *       500:
 *         description: Erreur serveur ou échec de traitement IA
 */

export default class PicturesController {
	constructor(private pictureService: PicturesService) {}

	getUploadMiddleware() {
		return upload.single("media");
	}

	async analyse(req: Request, res: Response) {
		try {
			const media = req.file;

			if (!media || !media.buffer) {
				res.status(400).json("media incorrect");
				return;
			}

			const userId = res.locals.userId as number;

			// Récupérer le PersonalityMode de l'utilisateur
			const personalityMode = await getPersonalityModeRepo(userId);

			if (personalityMode instanceof CustomError) {
				res.status(personalityMode.StatusCode).json(personalityMode.Message);
				return;
			}

			const challenge = (req.query.challenge as string) ?? null;
			const language = (req.query.language as string) ?? "fr";
			const cuiteId = req.query.cuiteId
				? Number.parseInt(req.query.cuiteId as string)
				: null;

			const result = await this.pictureService.analyse(
				media,
				challenge,
				language,
				personalityMode,
				cuiteId,
			);

			if (result instanceof CustomError) {
				res.status(result.StatusCode).json(result.Message);
				return;
			}

			res.status(200).json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Oups, le tonton a buggé 🧨" });
		}
	}
}
