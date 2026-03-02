import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updatePendingCuiteRepo(
	cuiteIdOrUserId: number,
	titre: string,
	description: string | null,
	isUserId = false,
): Promise<{ error: boolean; message?: string; statusCode?: number }> {
	try {
		let cuiteId: number;

		if (isUserId) {
			// Trouver la pending cuite de l'utilisateur
			const pendingCuite = await prisma.cuites.findFirst({
				where: {
					Id_User: cuiteIdOrUserId,
					IsPublished: false,
				},
				orderBy: {
					Created_at: "desc",
				},
			});

			if (!pendingCuite) {
				return {
					error: true,
					message: "Aucune pending cuite trouvée pour cet utilisateur",
					statusCode: StatusCodeEnum.NotFound,
				};
			}

			cuiteId = pendingCuite.Id;
		} else {
			cuiteId = cuiteIdOrUserId;
		}

		// Mettre à jour le titre et la description
		await prisma.cuites.update({
			where: {
				Id: cuiteId,
			},
			data: {
				Titre: titre,
				Description: description,
				isAnalyzed: true,
			},
		});

		return { error: false };
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de la pending cuite. Erreur:",
			error,
		);
		return {
			error: true,
			message: "Erreur lors de la mise à jour de la pending cuite",
			statusCode: StatusCodeEnum.InternalServerError,
		};
	}
}
