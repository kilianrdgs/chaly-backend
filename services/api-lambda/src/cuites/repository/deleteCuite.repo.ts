import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function deleteCuiteRepo(idCuite: number) {
	try {
		await prisma.cuites.delete({
			where: { Id: idCuite },
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de la cuite:", error);
		return new CustomError(
			"Erreur lors de la suppression de la cuite",
			StatusCodeEnum.InternalServerError,
		);
	}
}

export async function getPictureUrlByCuiteIdRepo(id: number) {
	try {
		const cuiteInfo = await prisma.cuites.findUnique({
			where: { Id: id },
			select: {
				Id_User: true,
				ImageUrl: true,
			},
		});

		if (!cuiteInfo || !cuiteInfo.ImageUrl) {
			return new CustomError(
				"Aucune image trouvée pour l'id donné",
				StatusCodeEnum.NotFound,
			);
		}

		return {
			Id_User: cuiteInfo.Id_User,
			Url_Picture: cuiteInfo.ImageUrl,
		};
	} catch (error) {
		console.error("Erreur lors de la récupération de l'image :", error);
		return new CustomError(
			"Erreur lors de la récupération de l'image",
			StatusCodeEnum.InternalServerError,
		);
	}
}
