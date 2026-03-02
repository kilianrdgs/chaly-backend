import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function likeCuiteRepo(cuiteId: number, userId: number) {
	try {
		const cuite = await prisma.cuites.findUnique({
			where: { Id: cuiteId },
		});

		if (!cuite) {
			return new CustomError(
				`Cuite non trouvée pour l'cuiteId ${cuiteId}`,
				StatusCodeEnum.NotFound,
			);
		}

		const existingLike = await prisma.likes.findFirst({
			where: {
				Id_Cuite: cuiteId,
				Id_User: userId,
			},
		});

		if (!existingLike) {
			await prisma.likes.create({
				data: {
					Id_Cuite: cuiteId,
					Id_User: userId,
				},
			});
		}

		return cuite.Id_User;
	} catch (error) {
		console.error("Erreur lors du like", error);
		return new CustomError(
			"Erreur lors de l'ajout du like",
			StatusCodeEnum.InternalServerError,
		);
	}
}
