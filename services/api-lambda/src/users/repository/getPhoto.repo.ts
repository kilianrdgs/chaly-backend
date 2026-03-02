import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getPhotoRepo(id: number) {
	try {
		const photo = await prisma.users.findUnique({
			where: { Id: id },
			select: { PhotoUrl: true },
		});
		if (!photo || !photo.PhotoUrl)
			return new CustomError(
				"Pas de photo pour cette utilisteur",
				StatusCodeEnum.NoContent,
			);
		return photo.PhotoUrl;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération de la photo de l'utilisateur: ${id}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération de la photo de l'utilisateur en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
