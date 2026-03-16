import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getNotificationTokenRepo(
	id: number,
): Promise<string | CustomError | null> {
	try {
		const userInfo = await prisma.users.findUnique({
			where: { Id: id },
			select: { TokenNotification: true },
		});
		if (!userInfo)
			return new CustomError(
				"Pas d'utilisateur pour l'id donné",
				StatusCodeEnum.NotFound,
			);
		return userInfo.TokenNotification;
	} catch (error) {
		console.error(
			`Erreur lors de l'enregistrement du token (de notification) de l'utilisateur. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération de Notification Token en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
