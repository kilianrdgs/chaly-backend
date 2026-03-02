import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getNotificationTokenByPseudoRepo(
	pseudo: string,
): Promise<string | CustomError | null> {
	try {
		const userInfo = await prisma.users.findFirst({
			where: { Pseudo: pseudo },
			select: { TokenNotification: true },
		});
		if (!userInfo)
			return new CustomError(
				"Pas d'utilisateur pour le pseudo donné",
				StatusCodeEnum.NotFound,
			);
		return userInfo.TokenNotification;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération de token de l'utilisateur. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération du Token de notif en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
