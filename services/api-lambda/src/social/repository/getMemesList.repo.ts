import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { encodeCursor, decodeCursor } from "../../cuites/utils/nextCursor";

export async function getMemesListRepo(
	limit: number,
	cursor: string | null,
	userId?: number | null,
) {
	try {
		let prismaCursor: { Id: number; Created_At: Date } | null = null;

		if (cursor && cursor !== "null") {
			const { id, createdAt } = decodeCursor(cursor);
			prismaCursor = { Id: id, Created_At: new Date(createdAt) };
		}

		const whereCondition = {
			IsActive: true,
			...(userId && { Id_User: userId }),
		};

		const totalMemes = await prisma.memes.count({
			where: whereCondition,
		});

		const memes = await prisma.memes.findMany({
			take: limit,
			orderBy: [{ Created_At: "desc" }, { Id: "desc" }],
			...(prismaCursor && {
				cursor: prismaCursor,
				skip: 1,
			}),
			where: whereCondition,
			select: {
				Id: true,
				ImageUrl: true,
				Created_At: true,
				IsActive: true,
				Id_User: true,
				User: {
					select: {
						Pseudo: true,
						PhotoUrl: true,
						IsCertified: true,
					},
				},
			},
		});

		const last = memes[memes.length - 1];
		const nextCursor =
			memes.length === limit && last
				? encodeCursor(last.Id, last.Created_At)
				: null;

		return {
			memes,
			cursor: nextCursor,
			totalMemes,
		};
	} catch (error) {
		console.error("Erreur dans getMemesList:", error);
		return new CustomError(
			"Erreur dans getMemesList",
			StatusCodeEnum.InternalServerError,
		);
	}
}
