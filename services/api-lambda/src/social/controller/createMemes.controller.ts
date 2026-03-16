import path from "node:path";
import { ServiceDeps } from "../../cuites/service/types";
import type { Request, Response } from "express";
import CustomError from "../../globals/customError";
import { createMemeService } from "../service/createMeme.service";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/social/memes:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Créer un nouveau meme
 *     description: Upload une image de meme dans le bucket S3 et enregistre le meme dans la base de données
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [media]
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Image du meme
 *     responses:
 *       201: { description: Meme créé avec succès }
 *       400: { description: Image manquante }
 *       500: { description: Erreur serveur }
 */

export function createMemesController(deps: ServiceDeps) {
  return async function createMemeHandler(req: Request, res: Response) {
    const userId = res.locals.userId;
    console.log("(***) - userId", userId);

    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      res.status(400).json({ message: "Image manquante" });
      return;
    }

    try {
      // Upload de l'image dans S3 dans le dossier memes/
      const ext = path.extname(req.file.originalname);
      const key = `memes/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}${ext}`;

      const imageUrl = await deps.s3Service.uploadFileToS3(
        req.file,
        bucketName,
        key
      );

      // Créer le meme dans la base de données
      const result = await createMemeService(userId, imageUrl);

      if (result instanceof CustomError) {
        res.status(result.StatusCode ?? 500).json({ message: result.Message });
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Erreur lors de la création du meme:", error);
      res.status(500).json({ message: "Erreur lors de la création du meme" });
    }
  };
}
