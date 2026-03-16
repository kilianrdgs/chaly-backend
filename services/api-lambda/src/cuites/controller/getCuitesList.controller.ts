// cuites/controller/getCuitesList.controller.ts
import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { getCuitesListService } from "../service/getCuitesList.service";
import type { ServiceDeps } from "../service/types";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

/**
 * @swagger
 * /api/cuites/list:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Cuites
 *     summary: Récupérer une liste de cuites
 *     description: |
 *       Récupère une liste paginée de cuites.
 *       Utilise le paramètre `type` pour indiquer le contexte :
 *       - `scroll` : feed général
 *       - `profile` : cuites d'un utilisateur spécifique (nécessite `userId`)
 *       - `vote` : fetch lors du vote
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Nombre de cuites à retourner
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *         description: Curseur pour la pagination (ID de la dernière cuite récupérée)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [scroll, profile, vote]
 *         description: Contexte 'scroll' pour le feed global, 'profile' pour les cuites d'un utilisateur spécifique, 'vote' pour le fetch lors du vote
 *       - in: query
 *         name: pseudo
 *         required: false
 *         schema:
 *           type: string
 *         description: pseudo de l'utilisateur pour récupérer ses cuites (nécessaire si `type` est `profile`)
 *     responses:
 *       200:
 *         description: Liste paginée de cuites
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur
 */

export function getCuitesListController(deps: ServiceDeps): RequestHandler {
  return async (req, res) => {
    const userId = res.locals.userId;
    console.log("(***) - userId", userId);

    const limit = Number.parseInt(req.query.limit as string) || 9;
    const cursor = (req.query.cursor as string) ?? null;
    const type = req.query.type as string;
    const pseudo = (req.query.pseudo as string) ?? null;

    try {
      const result = await getCuitesListService(
        limit,
        cursor,
        type,
        userId,
        pseudo
      );

      if (result instanceof CustomError) {
        res.status(result.StatusCode ?? 500).json(result.Message);
        return;
      }

      for (const cuite of result.cuites) {
        if (cuite.UrlPicture) {
          try {
            const key = cuite.UrlPicture.split("amazonaws.com/")[1];
            cuite.UrlPicture = await deps.s3Service.getSignedImageUrl(
              bucketName,
              key
            );
          } catch (e) {
            console.error(`Erreur URL signée image cuite ${cuite.Id}`, e);
          }
        }
        if (cuite.UserPicture) {
          try {
            const ukey = cuite.UserPicture.split("amazonaws.com/")[1];
            cuite.UserPicture = await deps.s3Service.getSignedImageUrl(
              bucketName,
              ukey
            );
          } catch (e) {
            console.error(`Erreur URL signée image user ${cuite.Id}`, e);
          }
        }
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Erreur lors de la récupération des cuites:", error);
      res
        .status(500)
        .json({ message: "Erreur serveur lors de la récupération des cuites" });
    }
  };
}
