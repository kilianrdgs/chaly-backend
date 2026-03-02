import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function createCommentRepo(
	cuiteId: number,
	userId: number,
	comment: string,
) {
	console.log("createCommentRepo called with:", { cuiteId, userId, comment });
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

		await prisma.comments.create({
			data: {
				Id_Cuite: cuiteId,
				Id_User: userId,
				Content: comment,
			},
		});

		return cuite.Id_User;
	} catch (error) {
		console.error("Erreur lors de la création du commentaire", error);
		return new CustomError(
			"Erreur lors de la création du commentaire",
			StatusCodeEnum.InternalServerError,
		);
	}
}
