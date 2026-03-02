// src/users/controller/deleteUser.controller.ts
import type { RequestHandler } from "express";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { deleteUserService } from "../service/deleteUser.service";

/**
 * @swagger
 * /api/users:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Users
 *     summary: Supprime définitivement le compte utilisateur
 *     description: Permet à l'utilisateur connecté de supprimer son compte. Cette opération est irréversible.
 *     responses:
 *       202:
 *         description: Compte utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Compte supprimé avec succès
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token invalide ou expiré
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur interne est survenue
 *                 details:
 *                   type: string
 *                   example: Stack trace ou description de l'erreur
 */
export function deleteUserController(deps: ServiceDeps): RequestHandler {
	return async (req, res) => {
		const userId = res.locals.userId;
		console.log("(***) - userId", userId);

		const result = await deleteUserService(deps, userId);

		if (result instanceof CustomError) {
			res.status(result.StatusCode ?? 500).json({ message: result.Message });
			return;
		}

		res.status(202).json({ message: "Compte supprimé avec succès" });
	};
}
