import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function deleteUserRepo(id: number) {
	try {
		await prisma.users.delete({ where: { Id: id } });
		return;
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'utilisateur. Erreur:",
			error,
		);
		return new CustomError(
			"Erreur lors de la suppression de l'utilisateur.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
