import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updatePseudoRepo(pseudo: string, id: number) {
	try {
		await prisma.users.update({
			where: { Id: id },
			data: { Pseudo: pseudo, IsVerified: true },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'update du pseudo de l'utilisateur: ${id}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'update de l'utilisateur en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
