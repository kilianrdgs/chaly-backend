import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updateBackgroundColorRepo(
	backgroundColor: string,
	id: number,
) {
	try {
		await prisma.users.update({
			where: { Id: id },
			data: { BackgroundName: backgroundColor },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'update de la couleur de fond de l'utilisateur: ${id}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'update de la couleur de fond de l'utilisateur en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
