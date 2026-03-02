import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getUserRoleRepo(
	id: number,
): Promise<boolean | CustomError> {
	try {
		const user = await prisma.users.findUnique({
			where: { Id: id },
			select: { Moderator: true },
		});
		if (!user)
			return new CustomError(
				"Pas d'utilisateur pour cet id",
				StatusCodeEnum.NotFound,
			);
		return user.Moderator;
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
