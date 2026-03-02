import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updatePhotoRepo(photoUrl: string, id: number) {
	try {
		await prisma.users.update({
			where: { Id: id },
			data: { PhotoUrl: photoUrl },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'update de la photo de l'utilisateur: ${id}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'update de l'utilisateur en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
