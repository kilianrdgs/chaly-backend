// createCuite.controller.ts
import path from "node:path";
import type { Request, Response } from "express";

import type { CuiteData } from "../models/cuite.model";

import type { ServiceDeps } from "../service/types";
import { checkUserPostPermissionRepo } from "../../users/repository/checkCanPost.repo";
import CustomError from "../../globals/customError";
import { createCuiteService } from "../service/createCuite.service";

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
 *       403: { description: Vous n'avez pas l'autorisation de poster }
 *       500: { description: Erreur serveur }
 */

export function createCuiteController(deps: ServiceDeps) {
  return async function createCuiteHandler(req: Request, res: Response) {
    try {
      const userId = res.locals.userId;

      const canPostResult = await checkUserPostPermissionRepo(userId);
      if (canPostResult instanceof CustomError) {
        return res
          .status(canPostResult.StatusCode ?? 500)
          .json({ message: canPostResult.Message });
      }

      let cuiteData: Partial<CuiteData>;
      try {
        cuiteData = req.body?.data
          ? typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data
          : undefined;
      } catch {
        return res
          .status(400)
          .json({ message: "Format de données JSON invalide" });
      }

      if (!cuiteData) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      let imageUrl: string | undefined;
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const key = `cuites/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}${ext}`;
        imageUrl = await deps.s3Service.uploadFileToS3(
          req.file,
          bucketName,
          key
        );
      }

      const cuite: CuiteData = {
        UserId: userId,
        Titre: cuiteData.Titre ?? null,
        Description: cuiteData.Description ?? null,
        ImageUrl: imageUrl ?? null,
        Address: cuiteData.Address ?? null,
      };

      const result = await createCuiteService(cuite);

      return res.status(result.mode === "created" ? 201 : 200).json(result);
    } catch (err) {
      if (err instanceof CustomError) {
        return res.status(err.StatusCode ?? 500).json({ message: err.Message });
      }

      console.error("createCuiteController error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}
