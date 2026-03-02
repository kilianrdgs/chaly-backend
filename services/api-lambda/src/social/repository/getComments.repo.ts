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
				User: {
					select: {
						Pseudo: true,
						PhotoUrl: true,
					},
				},
			},
			orderBy: {
				Created_At: "desc",
			},
		});

		console.log(comments);

		return comments.map(
			(comment) =>
				new CuiteComment(
					comment.Id,
					comment.Content,
					comment.Created_At,
					comment.User.Pseudo || "Utilisateur inconnu",
					comment.User.PhotoUrl || undefined,
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
