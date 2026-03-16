import { CuiteComment } from "../../cuites/models/comment";
import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getCommentsRepo(cuiteId: number) {
	try {
		const cuite = await prisma.cuites.findUnique({
			where: { Id: cuiteId },
		});

		if (!cuite) {
			return new CustomError(
				`Cuite non trouvée pour l'id ${cuiteId}`,
				StatusCodeEnum.NotFound,
			);
		}

		const comments = await prisma.comments.findMany({
			where: { Id_Cuite: cuiteId },
			select: {
				Id: true,
				Content: true,
				Created_At: true,
				Mentions: true,
				ImageUrl: true,
				Id_Meme: true,
				User: {
					select: {
						Id: true,
						Pseudo: true,
						PhotoUrl: true,
					},
				},
			},
			orderBy: {
				Created_At: "desc",
			},
		});

		// Récupérer les memes pour les commentaires qui ont un Id_Meme
		const memeIds = comments
			.filter((c) => c.Id_Meme !== null)
			.map((c) => c.Id_Meme as number);

		const memes = memeIds.length > 0
			? await prisma.memes.findMany({
				where: { Id: { in: memeIds } },
				select: { Id: true, ImageUrl: true },
			})
			: [];

		const memeMap = new Map(memes.map((m) => [m.Id, m.ImageUrl]));

		return comments.map(
			(comment) =>
				new CuiteComment(
					comment.Id,
					comment.Content,
					comment.Created_At,
					comment.User.Pseudo || "Utilisateur inconnu",
					comment.User.PhotoUrl || undefined,
					comment.User.Id || undefined,
					comment.Mentions as number[] | null || null,
					comment.Id_Meme ? memeMap.get(comment.Id_Meme) || undefined : comment.ImageUrl || undefined,
					comment.Id_Meme || undefined,
				),
		);
	} catch (error) {
		console.error("Erreur lors de la récupération des commentaires", error);
		return new CustomError(
			"Erreur lors de la récupération des commentaires",
			StatusCodeEnum.InternalServerError,
		);
	}
}
