// src/cuites/controller/createComment.controller.ts
import path from "node:path";
import type { Request, Response } from "express";
import CustomError from "../../globals/customError";
import { StatusCode } from "../../globals/http";
import type { ServiceDeps } from "../../cuites/service/types";
import { createCommentService } from "../service/createComment.service";
import { checkUserPostPermissionRepo } from "../../users/repository/checkCanPost.repo";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/social/cuites/{cuiteId}/comment:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Social]
 *     summary: Créer un commentaire sur une cuite
 *     description: Crée un commentaire sur une cuite spécifique avec possibilité de mentionner des utilisateurs et d'ajouter une image.
 *     parameters:
 *       - in: path
 *         name: cuiteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la cuite à commenter
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     type: string
 *                     description: Contenu du commentaire
 *                   mentions:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: Liste des IDs des utilisateurs mentionnés
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Image optionnelle du commentaire
 *     responses:
 *       201: { description: Commentaire créé avec succès }
 *       400: { description: Commentaire manquant ou vide }
 *       403: { description: Non autorisé }
 *       404: { description: Cuite non trouvée }
 *       500: { description: Erreur serveur }
 */
export function createCommentController(deps: ServiceDeps) {
  return async function createCommentHandler(req: Request, res: Response) {
    const userId = res.locals.userId;
    console.log("(***) - userId", userId);

    // Vérifier si l'utilisateur a le droit de poster
    const canPostResult = await checkUserPostPermissionRepo(userId);
    if (canPostResult instanceof CustomError) {
      res
        .status(canPostResult.StatusCode ?? 500)
        .json({ error: canPostResult.Message });
      return;
    }

    const cuiteId = Number.parseInt(req.params.cuiteId, 10);

    let comment: string | undefined;
    let mentions: number[] | undefined;
    let memeId: number | undefined;

    // Parse data from multipart form if present
    if (req.body?.data) {
      try {
        const parsedData =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
        comment = parsedData.comment;
        mentions = parsedData.mentions;
        memeId = parsedData.memeId;
      } catch {
        res
          .status(StatusCode.BadRequest)
          .json({ error: "Format de données JSON invalide" });
        return;
      }
    } else {
      // Fallback to direct body fields for backward compatibility
      comment = req.body.comment as string;
      mentions = req.body.mentions as number[] | undefined;
      memeId = req.body.memeId as number | undefined;
    }

    console.log("ici --------------", cuiteId, comment, mentions, memeId);

    // Validate that either comment, media, or memeId is provided
    if ((!comment || comment.trim() === "") && !req.file && !memeId) {
      res
        .status(StatusCode.BadRequest)
        .json({ error: "Commentaire, image ou meme requis" });
      return;
    }

    // Upload image to S3 if provided
    let imageUrl: string | undefined;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const key = `comments/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}${ext}`;
      imageUrl = await deps.s3Service.uploadFileToS3(req.file, bucketName, key);
    }

    const result = await createCommentService(
      cuiteId,
      userId,
      comment || "",
      mentions,
      imageUrl,
      memeId
    );
    if (result instanceof CustomError) {
      res.status(result.StatusCode ?? 500).json({ error: result.Message });
      return;
    }

    res.status(StatusCode.Created).json(result);
  };
}
