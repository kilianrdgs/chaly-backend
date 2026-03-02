import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function publishPendingCuiteRepo(
	userId: number,
): Promise<{ error: boolean; message?: string; statusCode?: number }> {
	try {
		// Trouver la pending cuite de l'utilisateur
		const pendingCuite = await prisma.cuites.findFirst({
			where: {
				Id_User: userId,
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

		// Mettre à jour IsPublished
		await prisma.cuites.update({
			where: {
				Id: pendingCuite.Id,
			},
			data: {
				IsPublished: true,
			},
		});

		return { error: false };
	} catch (error) {
		console.error(
			"Erreur lors de la publication de la pending cuite. Erreur:",
			error,
		);
		return {
			error: true,
			message: "Erreur lors de la publication de la pending cuite",
			statusCode: StatusCodeEnum.InternalServerError,
		};
	}
}
