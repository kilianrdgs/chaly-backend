import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function unblockUserRepo(blockerId: number, blockedId: number) {
	try {
		const result = await prisma.userBlock.deleteMany({
			where: {
				Blocker_Id: blockerId,
				Blocked_Id: blockedId,
			},
		});

		if (result.count === 0) {
			return new CustomError(
				`Aucun blocage trouvé entre les utilisateurs ${blockerId} et ${blockedId}`,
				StatusCodeEnum.NotFound,
			);
		}

		return { success: true, unblockedId: blockedId };
	} catch (error) {
		console.error("Erreur lors du déblocage de l'utilisateur", error);
		return new CustomError(
			"Erreur lors du déblocage de l'utilisateur",
			StatusCodeEnum.InternalServerError,
		);
	}
}
