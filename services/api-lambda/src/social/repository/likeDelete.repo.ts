import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function likeDeleteRepo(
	cuiteId: number,
	userId: number,
): Promise<CustomError | undefined> {
	try {
		const cuite = await prisma.cuites.findUnique({
			where: { Id: cuiteId },
		});

		if (!cuite) {
			return new CustomError(
				`Cuite non trouvée pour l'id ${cuiteId}`,
				StatusCodeEnum.NotFound,
			);
		}

		const like = await prisma.likes.findFirst({
			where: {
				Id_Cuite: cuiteId,
				Id_User: userId,
			},
		});

		if (!like) {
			return new CustomError("Aucun like à supprimer", StatusCodeEnum.NotFound);
		}

		await prisma.likes.delete({
			where: {
				Id: like.Id,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du like", error);
		return new CustomError(
			"Erreur lors de la suppression du like",
			StatusCodeEnum.InternalServerError,
		);
	}
}
