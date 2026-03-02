import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function deleteTokenNotificationRepo(id: number) {
	try {
		await prisma.users.update({
			where: { Id: id },
			data: { TokenNotification: null },
		});
		return;
	} catch (error) {
		console.error(
			`Erreur lors de l'enregistrement du token (de notification) de l'utilisateur. Erreur :`,
			error,
		);
		return new CustomError(
			"Erreur lors de l'enregistrement en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
