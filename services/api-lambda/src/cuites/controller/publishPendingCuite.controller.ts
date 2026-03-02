// publishPendingCuite.controller.ts
import type { Request, Response } from "express";

import { publishPendingCuiteService } from "../service/publishPendingCuite.service";
import type { ServiceDeps } from "../service/types";

/**
 * @swagger
 * /api/cuites/pending/publish:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     tags: [Cuites]
 *     summary: Publier la pending cuite
 *     description: Met IsPublished à true pour la pending cuite de l'utilisateur
 *     responses:
 *       200: { description: Pending cuite publiée avec succès }
 *       404: { description: Aucune pending cuite trouvée }
 *       500: { description: Erreur serveur }
 */

export function publishPendingCuiteController(deps: ServiceDeps) {
	return async function publishPendingCuiteHandler(
		req: Request,
		res: Response,
	) {
		const userId = res.locals.userId;

		const result = await publishPendingCuiteService(deps, userId);

		if (result.error) {
			res.status(result.statusCode || 500).json({ message: result.message });
			return;
		}

		res.status(200).json({ message: "Pending cuite publiée avec succès" });
	};
}
