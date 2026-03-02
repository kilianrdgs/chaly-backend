import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getPersonalityModeRepo(
	userId: number,
): Promise<string | CustomError> {
	try {
		const user = await prisma.users.findUnique({
			where: { Id: userId },
			select: { PersonalityMode: true },
		});

		if (!user) {
			return new CustomError("Utilisateur non trouvé", StatusCodeEnum.NotFound);
		}

		return user.PersonalityMode;
	} catch (error) {
		console.error("Erreur lors de la récupération du PersonalityMode:", error);
		return new CustomError(
			"Erreur lors de la récupération du PersonalityMode",
			StatusCodeEnum.InternalServerError,
		);
	}
}
