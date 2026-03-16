import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function blockUserRepo(blockerId: number, blockedId: number) {
	try {
		// Check if the user to block exists
		const userToBlock = await prisma.users.findUnique({
			where: { Id: blockedId },
		});

		if (!userToBlock) {
			return new CustomError(
				`Utilisateur non trouvé pour l'id ${blockedId}`,
				StatusCodeEnum.NotFound,
			);
		}

		// Check if the block already exists
		const existingBlock = await prisma.userBlock.findFirst({
			where: {
				Blocker_Id: blockerId,
				Blocked_Id: blockedId,
			},
		});

		if (!existingBlock) {
			await prisma.userBlock.create({
				data: {
					Blocker_Id: blockerId,
					Blocked_Id: blockedId,
				},
			});
		}

		return { success: true, blockedId };
	} catch (error) {
		console.error("Erreur lors du blocage de l'utilisateur", error);
		return new CustomError(
			"Erreur lors du blocage de l'utilisateur",
			StatusCodeEnum.InternalServerError,
		);
	}
}
