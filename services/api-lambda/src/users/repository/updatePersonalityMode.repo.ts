import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function updatePersonalityModeRepo(
	personalityMode: string,
	userId: number,
) {
	try {
		await prisma.users.update({
			where: { Id: userId },
			data: { PersonalityMode: personalityMode },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'update du PersonalityMode de l'utilisateur: ${userId}. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'update du PersonalityMode",
			StatusCodeEnum.InternalServerError,
		);
	}
}
