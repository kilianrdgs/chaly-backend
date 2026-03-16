import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getSocialCountRepo(cuiteId: number, userId: number) {
	try {
		const [likeCount, commentCount, likedByMeCount] = await Promise.all([
			prisma.likes.count({
				where: { Id_Cuite: cuiteId },
			}),
			prisma.comments.count({
				where: { Id_Cuite: cuiteId },
			}),
			prisma.likes.count({
				where: {
					Id_Cuite: cuiteId,
					Id_User: userId,
				},
			}),
		]);

		return {
			likeCount,
			commentCount,
			likedByMe: likedByMeCount > 0,
		};
	} catch (error) {
		throw new CustomError(
			"Impossible de récupérer les infos sociales",
			StatusCodeEnum.InternalServerError,
		);
	}
}
