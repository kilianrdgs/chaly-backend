// updatePendingCuite.controller.ts
import type { Request, Response } from "express";

import type { ServiceDeps } from "../service/types";
import { updatePendingCuiteService } from "../service/updatePendingCuite.service";

/**
 * @swagger
 * /api/cuites/pending:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     tags: [Cuites]
 *     summary: Mettre à jour le titre et la description d'une pending cuite
 *     description: Met à jour le titre et la description de la cuite en attente de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Titre:
 *                 type: string
 *                 description: Titre de la cuite
 *               Description:
 *                 type: string
 *                 nullable: true
 *                 description: Description de la cuite
 *     responses:
 *       200: { description: Pending cuite mise à jour avec succès }
 *       400: { description: Données invalides }
 *       404: { description: Aucune pending cuite trouvée }
 *       500: { description: Erreur serveur }
 */

export function updatePendingCuiteController(deps: ServiceDeps) {
	return async function updatePendingCuiteHandler(req: Request, res: Response) {
		const userId = res.locals.userId;

		const { Titre, Description } = req.body;

		if (!Titre || typeof Titre !== "string") {
			res.status(400).json({
				message: "Le titre est requis et doit être une chaîne de caractères",
			});
			return;
		}

		const result = await updatePendingCuiteService(
			deps,
			userId,
			Titre,
			Description ?? null,
		);

		if (result.error) {
			res.status(result.statusCode || 500).json({ message: result.message });
			return;
		}

		res.status(200).json({ message: "Pending cuite mise à jour avec succès" });
	};
}
