import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getIdByPseudoRepo(pseudo: string) {
	try {
		const id = await prisma.users.findFirst({
			where: { Pseudo: pseudo },
			select: { Id: true },
		});
		if (!id)
			return new CustomError(
				"Erreur lors de la récupération d'id du user.",
				StatusCodeEnum.NoContent,
			);
		return id.Id;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'id a partir du pseudo. Erreur:",
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération d'id du user.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
