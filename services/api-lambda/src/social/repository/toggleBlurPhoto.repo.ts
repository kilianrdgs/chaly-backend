import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function toggleBlurPhotoRepo(cuiteId: number, userId: number) {
	try {
		// Check if the user is a moderator
		const user = await prisma.users.findUnique({
			where: { Id: userId },
			select: { Moderator: true },
		});

		if (!user || !user.Moderator) {
			return new CustomError(
				"Vous devez être modérateur pour flouter/déflouter des photos",
				StatusCodeEnum.Unauthorized,
			);
		}

		// Check if the cuite exists
		const cuite = await prisma.cuites.findUnique({
			where: { Id: cuiteId },
			select: { IsBlurred: true },
		});

		if (!cuite) {
			return new CustomError(
				`Photo non trouvée pour l'id ${cuiteId}`,
				StatusCodeEnum.NotFound,
			);
		}

		// Toggle the IsBlurred field
		const updatedCuite = await prisma.cuites.update({
			where: { Id: cuiteId },
			data: { IsBlurred: !cuite.IsBlurred },
			select: { Id: true, IsBlurred: true },
		});

		return {
			success: true,
			cuiteId: updatedCuite.Id,
			isBlurred: updatedCuite.IsBlurred,
		};
	} catch (error) {
		console.error("Erreur lors du toggle blur de la photo", error);
		return new CustomError(
			"Erreur lors du toggle blur de la photo",
			StatusCodeEnum.InternalServerError,
		);
	}
}
