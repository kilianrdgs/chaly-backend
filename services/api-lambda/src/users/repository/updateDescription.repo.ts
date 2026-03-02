import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updateDescriptionRepo(description: string, id: number) {
	try {
		await prisma.users.update({
			where: { Id: id },
			data: { Description: description },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'update de la description de l'utilisateur: ${id}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'update de la description de l'utilisateur en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
