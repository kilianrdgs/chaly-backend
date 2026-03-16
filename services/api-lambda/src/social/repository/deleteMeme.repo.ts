import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function deleteMemeRepo(memeId: number) {
	try {
		await prisma.memes.delete({
			where: { Id: memeId },
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du meme:", error);
		return new CustomError(
			"Erreur lors de la suppression du meme",
			StatusCodeEnum.InternalServerError,
		);
	}
}

export async function getMemeInfoByIdRepo(id: number) {
	try {
		const memeInfo = await prisma.memes.findUnique({
			where: { Id: id },
			select: {
				Id_User: true,
				ImageUrl: true,
				IsActive: true,
			},
		});

		if (!memeInfo) {
			return new CustomError(
				"Aucun meme trouvé pour cet id",
				StatusCodeEnum.NotFound,
			);
		}

		return {
			Id_User: memeInfo.Id_User,
			ImageUrl: memeInfo.ImageUrl,
			IsActive: memeInfo.IsActive,
		};
	} catch (error) {
		console.error("Erreur lors de la récupération du meme :", error);
		return new CustomError(
			"Erreur lors de la récupération du meme",
			StatusCodeEnum.InternalServerError,
		);
	}
}
