// src/users/controller/getUserInformation.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import { HttpError, StatusCode } from "../../globals/http";
import { getUserInformationService } from "../service/getUserInformation.service";

/**
 * @swagger
 * /api/users:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Users
 *     summary: Récupère les informations de l'utilisateur
 *     description: Permet de récupérer les informations du profil utilisateur connecté
 *     responses:
 *       200:
 *         description: Informations utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     Id:
 *                       type: number
 *                     Pseudo:
 *                       type: string
 *                     PhotoUrl:
 *                       type: string
 *                       nullable: true
 *                     XpTotal:
 *                       type: object
 *                       properties:
 *                         xpTotal:
 *                           type: number
 *                         currentLevel:
 *                           type: number
 *                         percentageToNextLevel:
 *                           type: number
 *                         xpRemainingToNextLevel:
 *                           type: number
 *                     IsVerified:
 *                       type: boolean
 *                     stats:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         totalCuites:
 *                           type: number
 *                         streakDays:
 *                           type: number
 *                 requiresPseudo:
 *                   type: boolean
 *                 pendingCuite:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     Id:
 *                       type: number
 *                     ImageUrl:
 *                       type: string
 *                     Created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: string
 */

export function getUserInformationController(
	deps: ServiceDeps,
): RequestHandler {
	return async (req, res) => {
		try {
			const userId = res.locals.userId;
			console.log("(***) - userId", userId);
			const result = await getUserInformationService(deps, userId);
			res.status(StatusCode.Ok).json(result);
		} catch (e) {
			console.error(e);

			if (e instanceof HttpError) {
				return res.status(e.statusCode).json({
					error: e.error,
					message: e.message,
				});
			}
		}
	};
}
