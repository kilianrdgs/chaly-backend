import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

const MAX_RETRIES = 2;

export async function verifyCodeRepo(code: string, number: string) {
	try {
		const existing = await prisma.phoneVerifications.findUnique({
			where: { Phone: number },
		});

		if (!existing) {
			return new CustomError(
				"Aucune demande de code trouvée.",
				StatusCodeEnum.NoContent,
			);
		}

		if (existing.Retries >= MAX_RETRIES) {
			return new CustomError(
				"trop de tentatives reéssayez plus tard",
				StatusCodeEnum.TooManyRequests,
			);
		}

		if (existing.ExpiresAt < new Date()) {
			await prisma.phoneVerifications.delete({
				where: { Phone: number },
			});
			return new CustomError(
				"Le code est expiré.",
				StatusCodeEnum.RequestTimeOut,
			);
		}

		if (existing.Code !== code) {
			await prisma.phoneVerifications.update({
				where: { Phone: number },
				data: {
					Retries: existing.Retries + 1,
				},
			});
			return new CustomError("Code invalide.", StatusCodeEnum.BadRequest);
		}

		await prisma.phoneVerifications.delete({
			where: { Phone: number },
		});
		return true;
	} catch (error) {
		console.error("Erreur dans verifyCode:", error);
		return new CustomError(
			"Erreur serveur. Réessaye plus tard.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
