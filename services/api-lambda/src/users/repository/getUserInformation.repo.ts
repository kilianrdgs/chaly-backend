import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { XpInfo } from "../../globals/xpModel";
import UserDto from "../service/models/userDto";

export async function getUserInformationRepo(id: number) {
	try {
		const user = await prisma.users.findUnique({
			where: { Id: id },
			select: {
				Pseudo: true,
				PhoneNumber: true,
				PhotoUrl: true,
				XpTotal: true,
				IsVerified: true,
				IsCertified: true,
				Description: true,
				BackgroundName: true,
				Moderator: true,
			},
		});

		if (user) {
			return new UserDto(
				id,
				user.Pseudo || "",
				user.PhotoUrl,
				new XpInfo(user.XpTotal),
				user.IsVerified,
				user.IsCertified ?? false,
				user.Description ?? null,
				user.BackgroundName ?? null,
				user.Moderator,
				null,
			);
		}
		return new CustomError(
			"Pas d'utilisateur pour l'id donné",
			StatusCodeEnum.NoContent,
		);
	} catch (error) {
		console.error("Erreur lors de la récupération du user. Erreur:", error);
		return new CustomError(
			"Erreur lors de la récupération du user.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
