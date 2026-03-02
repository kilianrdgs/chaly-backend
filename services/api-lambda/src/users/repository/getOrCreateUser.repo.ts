import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { XpInfo } from "../../globals/xpModel";
import UserDto from "../service/models/userDto";

export async function getOrCreateUserRepo(phoneNumber: string) {
	try {
		// 1. Chercher l'utilisateur existant
		const existingUser = await prisma.users.findUnique({
			where: { PhoneNumber: phoneNumber },
			select: {
				Id: true,
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

		if (existingUser) {
			return {
				user: new UserDto(
					existingUser.Id,
					existingUser.Pseudo ?? null,
					existingUser.PhotoUrl,
					new XpInfo(existingUser.XpTotal),
					existingUser.IsVerified,
					existingUser.IsCertified || false,
					existingUser.Description ?? null,
					existingUser.BackgroundName ?? null,
					existingUser.Moderator,
					null,
				),
				isNewUser: false,
			};
		}

		const newUser = await prisma.users.create({
			data: {
				PhoneNumber: phoneNumber,
				XpTotal: 0,
				IsVerified: false,
				IsCertified: false,
				Moderator: false,
			},
			select: {
				Id: true,
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

		return {
			user: new UserDto(
				newUser.Id,
				null,
				newUser.PhotoUrl,
				new XpInfo(newUser.XpTotal),
				newUser.IsVerified,
				newUser.IsCertified || false,
				newUser.Description ?? null,
				newUser.BackgroundName ?? null,
				newUser.Moderator,
				null,
			),
			isNewUser: true,
		};
	} catch (error) {
		console.error("Erreur dans getOrCreateUserRepo:", error);
		return new CustomError(
			"Erreur lors de la gestion de l'utilisateur",
			StatusCodeEnum.InternalServerError,
		);
	}
}
